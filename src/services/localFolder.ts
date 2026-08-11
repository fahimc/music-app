import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Song } from '../types';

// Supported audio file extensions
const SUPPORTED_EXTENSIONS = [
  '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma', '.opus'
];

// File System Access API types
interface FileSystemDirectoryHandle {
  kind: 'directory';
  name: string;
  values(): AsyncIterableIterator<[string, FileSystemHandle]>;
  getFileHandle(name: string): Promise<FileSystemFileHandle>;
  getDirectoryHandle(name: string): Promise<FileSystemDirectoryHandle>;
  requestPermission?(options?: { mode: 'read' | 'readwrite' }): Promise<'granted' | 'denied' | 'prompt'>;
}

interface FileSystemFileHandle {
  kind: 'file';
  name: string;
  getFile(): Promise<File>;
}

type FileSystemHandle = FileSystemDirectoryHandle | FileSystemFileHandle;

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  }
}

export interface LocalFolder {
  id: string;
  name: string;
  handle: FileSystemDirectoryHandle;
  lastScanned: Date;
  songCount: number;
}

export interface LocalSong extends Omit<Song, 'id' | 'webViewLink' | 'createdTime' | 'modifiedTime'> {
  id: string;
  folderId: string;
  file: File;
  localPath: string;
  lastModified: Date;
  createdTime: Date;
  modifiedTime: Date;
  source: 'local';
}

/**
 * IndexedDB database for local music folders.
 * FileSystemDirectoryHandle and File objects are structured-cloneable, so we can
 * persist them here and re-request permission on the next visit - meaning local
 * folders survive browser restarts (unlike localStorage, which can't store handles).
 */
class LocalMusicDB extends Dexie {
  folders!: Table<LocalFolder>;
  songs!: Table<LocalSong>;

  constructor() {
    super('MusicAppLocalDB');
    this.version(1).stores({
      folders: 'id, name, lastScanned, songCount',
      songs: 'id, folderId, name, artist, album, duration, size, mimeType, localPath, lastModified',
    });
  }
}

class LocalFolderService {
  private db: LocalMusicDB;
  private folders: LocalFolder[] = [];
  private songs: LocalSong[] = [];

  constructor() {
    this.db = new LocalMusicDB();
  }

  /**
   * Load persisted folders/songs from IndexedDB and re-request read permission
   * for stored directory handles. Call once at app startup.
   */
  async initialize(): Promise<void> {
    try {
      const storedFolders = await this.db.folders.toArray();
      const storedSongs = await this.db.songs.toArray();
      this.folders = storedFolders;
      this.songs = storedSongs;

      // Re-request permission for each persisted handle. In Chromium, a handle
      // stored in IndexedDB keeps its permission grant across sessions, so this
      // is normally granted silently and keeps the folder fully usable.
      for (const folder of this.folders) {
        if (folder.handle?.requestPermission) {
          try {
            await folder.handle.requestPermission({ mode: 'read' });
          } catch (error) {
            console.warn(`Could not re-request permission for ${folder.name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize local folder service:', error);
      this.folders = [];
      this.songs = [];
    }
  }

  /**
   * Check if File System Access API is supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' &&
           'showDirectoryPicker' in window &&
           typeof window.showDirectoryPicker === 'function';
  }

  /**
   * Add a local folder using File System Access API
   */
  async addFolder(): Promise<LocalFolder | null> {
    if (!this.isSupported()) {
      throw new Error('File System Access API is not supported in this browser');
    }

    try {
      const dirHandle = await window.showDirectoryPicker!();

      const folder: LocalFolder = {
        id: this.generateFolderId(),
        name: dirHandle.name,
        handle: dirHandle,
        lastScanned: new Date(),
        songCount: 0,
      };

      // Scan the folder for audio files
      const songs = await this.scanFolder(folder);
      folder.songCount = songs.length;

      // Store the folder and songs in IndexedDB
      this.folders.push(folder);
      this.songs.push(...songs);

      await this.db.folders.put(folder);
      if (songs.length > 0) {
        await this.db.songs.bulkPut(songs);
      }

      return folder;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled the folder selection
        return null;
      }
      throw error;
    }
  }

  /**
   * Remove a local folder and its songs
   */
  async removeFolder(folderId: string): Promise<void> {
    this.folders = this.folders.filter(folder => folder.id !== folderId);
    this.songs = this.songs.filter(song => song.folderId !== folderId);

    await this.db.folders.delete(folderId);
    await this.db.songs.where('folderId').equals(folderId).delete();
  }

  /**
   * Get all local folders
   */
  getFolders(): LocalFolder[] {
    return [...this.folders];
  }

  /**
   * Get all songs from local folders
   */
  getSongs(): LocalSong[] {
    return [...this.songs];
  }

  /**
   * Get songs from a specific folder
   */
  getSongsByFolder(folderId: string): LocalSong[] {
    return this.songs.filter(song => song.folderId === folderId);
  }

  /**
   * Rescan a folder for changes
   */
  async rescanFolder(folderId: string): Promise<LocalSong[]> {
    const folder = this.folders.find(f => f.id === folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }

    try {
      // Remove existing songs from this folder (in memory and IndexedDB)
      this.songs = this.songs.filter(song => song.folderId !== folderId);
      await this.db.songs.where('folderId').equals(folderId).delete();

      // Scan for new songs
      const songs = await this.scanFolder(folder);

      // Update folder info
      folder.lastScanned = new Date();
      folder.songCount = songs.length;

      // Add new songs
      this.songs.push(...songs);

      await this.db.folders.put(folder);
      if (songs.length > 0) {
        await this.db.songs.bulkPut(songs);
      }

      return songs;
    } catch (error) {
      console.error('Error rescanning folder:', error);
      throw new Error(`Failed to rescan folder: ${(error as Error).message}`);
    }
  }

  /**
   * Search local songs
   */
  searchSongs(query: string): LocalSong[] {
    const searchTerm = query.toLowerCase();
    return this.songs.filter(song =>
      song.name.toLowerCase().includes(searchTerm) ||
      (song.artist && song.artist.toLowerCase().includes(searchTerm)) ||
      (song.album && song.album.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Create a playable URL for a local file
   */
  createSongUrl(song: LocalSong): string {
    return URL.createObjectURL(song.file);
  }

  /**
   * Clean up object URLs (call when component unmounts)
   */
  revokeSongUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Scan a folder for audio files
   */
  private async scanFolder(folder: LocalFolder): Promise<LocalSong[]> {
    const songs: LocalSong[] = [];

    try {
      await this.scanDirectory(folder.handle, folder.id, '', songs);
    } catch (error) {
      console.error('Error scanning folder:', error);
    }

    return songs;
  }

  /**
   * Recursively scan a directory for audio files
   */
  private async scanDirectory(
    dirHandle: FileSystemDirectoryHandle,
    folderId: string,
    currentPath: string,
    songs: LocalSong[]
  ): Promise<void> {
    try {
      for await (const [name, handle] of dirHandle.values()) {
        const fullPath = currentPath ? `${currentPath}/${name}` : name;

        if (handle.kind === 'file') {
          const extension = name.toLowerCase().substring(name.lastIndexOf('.'));

          if (SUPPORTED_EXTENSIONS.includes(extension)) {
            try {
              const file = await handle.getFile();
              const song = await this.createSongFromFile(file, folderId, fullPath);
              songs.push(song);
            } catch (error) {
              console.warn(`Failed to process file ${fullPath}:`, error);
            }
          }
        } else if (handle.kind === 'directory') {
          // Recursively scan subdirectories (with depth limit)
          if (currentPath.split('/').length < 5) { // Limit recursion depth
            await this.scanDirectory(handle, folderId, fullPath, songs);
          }
        }
      }
    } catch (error) {
      console.error('Error scanning directory:', error);
    }
  }

  /**
   * Create a song object from a file
   */
  private async createSongFromFile(file: File, folderId: string, localPath: string): Promise<LocalSong> {
    // Extract basic metadata from filename and file info
    const name = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    const size = file.size;
    const lastModified = new Date(file.lastModified);

    // Try to extract metadata using Web Audio API or ID3 tags
    const metadata = await this.extractMetadata(file);

    return {
      id: this.generateSongId(folderId, localPath),
      folderId,
      name: metadata.title || name,
      artist: metadata.artist,
      album: metadata.album,
      duration: metadata.duration,
      size,
      mimeType: file.type || `audio/${this.getAudioType(file.name)}`,
      file,
      localPath,
      lastModified,
      createdTime: lastModified,
      modifiedTime: lastModified,
      source: 'local',
      isDownloaded: true, // Local files are always "downloaded"
    };
  }

  /**
   * Extract metadata from audio file
   */
  private async extractMetadata(file: File): Promise<{
    title?: string;
    artist?: string;
    album?: string;
    duration?: number;
  }> {
    // This is a simplified implementation
    // In a real app, you'd use a library like music-metadata-browser
    // to extract ID3 tags and other metadata

    try {
      // Try to get duration using Audio element
      const audio = new Audio();
      const url = URL.createObjectURL(file);

      return new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', () => {
          URL.revokeObjectURL(url);
          resolve({
            duration: audio.duration,
          });
        });

        audio.addEventListener('error', () => {
          URL.revokeObjectURL(url);
          resolve({});
        });

        audio.src = url;
      });
    } catch (error) {
      console.warn('Failed to extract metadata:', error);
      return {};
    }
  }

  /**
   * Get audio type from file extension
   */
  private getAudioType(filename: string): string {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.') + 1);
    const typeMap: { [key: string]: string } = {
      'mp3': 'mpeg',
      'wav': 'wav',
      'ogg': 'ogg',
      'm4a': 'mp4',
      'aac': 'aac',
      'flac': 'flac',
      'wma': 'x-ms-wma',
      'opus': 'opus'
    };
    return typeMap[extension] || extension;
  }

  /**
   * Generate unique folder ID
   */
  private generateFolderId(): string {
    return `local_folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique song ID
   */
  private generateSongId(folderId: string, localPath: string): string {
    return `local_song_${folderId}_${btoa(localPath).replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): {
    folderCount: number;
    songCount: number;
    totalSize: number;
  } {
    const totalSize = this.songs.reduce((sum, song) => sum + (song.size || 0), 0);

    return {
      folderCount: this.folders.length,
      songCount: this.songs.length,
      totalSize,
    };
  }
}

export const localFolderService = new LocalFolderService();
