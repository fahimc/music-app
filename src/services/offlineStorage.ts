import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Song, DownloadProgress } from '../types';

// IndexedDB Schema
interface StoredSong extends Song {
  audioBlob?: Blob;
  downloadedAt: Date;
}

interface DownloadStatus {
  songId: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

class MusicDatabase extends Dexie {
  songs!: Table<StoredSong>;
  downloads!: Table<DownloadStatus>;

  constructor() {
    super('MusicAppDB');
    
    this.version(1).stores({
      songs: 'id, name, artist, album, downloadedAt, size',
      downloads: 'songId, status, progress, startedAt, completedAt'
    });
  }
}

class OfflineStorageService {
  private db: MusicDatabase;

  constructor() {
    this.db = new MusicDatabase();
  }

  /**
   * Store a downloaded song in IndexedDB
   */
  async storeSong(song: Song, audioBlob: Blob): Promise<void> {
    const storedSong: StoredSong = {
      ...song,
      audioBlob,
      isDownloaded: true,
      downloadedAt: new Date(),
    };

    await this.db.songs.put(storedSong);
    
    // Update download status
    await this.updateDownloadProgress(song.id, {
      progress: 100,
      status: 'completed'
    });
  }

  /**
   * Get a downloaded song from IndexedDB
   */
  async getSong(songId: string): Promise<StoredSong | undefined> {
    return await this.db.songs.get(songId);
  }

  /**
   * Get all downloaded songs
   */
  async getAllDownloadedSongs(): Promise<StoredSong[]> {
    return await this.db.songs.filter(song => song.isDownloaded === true).toArray();
  }

  /**
   * Remove a song from offline storage
   */
  async removeSong(songId: string): Promise<void> {
    await this.db.songs.delete(songId);
    await this.db.downloads.delete(songId);
  }

  /**
   * Check if a song is downloaded
   */
  async isSongDownloaded(songId: string): Promise<boolean> {
    const song = await this.db.songs.get(songId);
    return song?.isDownloaded === true && song.audioBlob !== undefined;
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    totalSongs: number;
    totalSize: number;
    lastUpdated: Date;
  }> {
    const songs = await this.db.songs.filter(song => song.isDownloaded === true).toArray();
    const totalSize = songs.reduce((sum, song) => sum + (song.size || 0), 0);
    const lastUpdated = songs.reduce((latest, song) => {
      return song.downloadedAt > latest ? song.downloadedAt : latest;
    }, new Date(0));

    return {
      totalSongs: songs.length,
      totalSize,
      lastUpdated,
    };
  }

  /**
   * Clear all downloaded songs
   */
  async clearAllSongs(): Promise<void> {
    await this.db.songs.clear();
    await this.db.downloads.clear();
  }

  /**
   * Update download progress
   */
  async updateDownloadProgress(
    songId: string, 
    update: Partial<Pick<DownloadStatus, 'progress' | 'status' | 'error'>>
  ): Promise<void> {
    const existing = await this.db.downloads.get(songId);
    
    const downloadStatus: DownloadStatus = {
      songId,
      progress: update.progress ?? existing?.progress ?? 0,
      status: update.status ?? existing?.status ?? 'pending',
      error: update.error ?? existing?.error,
      startedAt: existing?.startedAt ?? new Date(),
      completedAt: update.status === 'completed' ? new Date() : existing?.completedAt,
    };

    await this.db.downloads.put(downloadStatus);
  }

  /**
   * Get download progress for a song
   */
  async getDownloadProgress(songId: string): Promise<DownloadProgress | null> {
    const downloadStatus = await this.db.downloads.get(songId);
    
    if (!downloadStatus) {
      return null;
    }

    return {
      songId: downloadStatus.songId,
      progress: downloadStatus.progress,
      status: downloadStatus.status,
      error: downloadStatus.error,
    };
  }

  /**
   * Get all active downloads
   */
  async getActiveDownloads(): Promise<DownloadProgress[]> {
    const activeStatuses = await this.db.downloads
      .where('status')
      .anyOf(['pending', 'downloading'])
      .toArray();

    return activeStatuses.map(status => ({
      songId: status.songId,
      progress: status.progress,
      status: status.status,
      error: status.error,
    }));
  }

  /**
   * Create a URL for playing an offline song
   */
  async createSongURL(songId: string): Promise<string | null> {
    const song = await this.getSong(songId);
    
    if (!song?.audioBlob) {
      return null;
    }

    return URL.createObjectURL(song.audioBlob);
  }

  /**
   * Clean up expired URLs (call when component unmounts)
   */
  revokeSongURL(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Get songs sorted by download date
   */
  async getRecentlyDownloaded(limit = 10): Promise<StoredSong[]> {
    return await this.db.songs
      .filter(song => song.isDownloaded === true)
      .reverse()
      .sortBy('downloadedAt')
      .then(songs => songs.slice(0, limit));
  }

  /**
   * Search downloaded songs
   */
  async searchDownloadedSongs(query: string): Promise<StoredSong[]> {
    const allSongs = await this.getAllDownloadedSongs();
    const searchTerm = query.toLowerCase();
    
    return allSongs.filter(song => 
      song.name.toLowerCase().includes(searchTerm) ||
      (song.artist && song.artist.toLowerCase().includes(searchTerm)) ||
      (song.album && song.album.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Update song metadata (without changing the audio blob)
   */
  async updateSongMetadata(songId: string, updates: Partial<Song>): Promise<void> {
    await this.db.songs.update(songId, updates);
  }

  /**
   * Check and clean up corrupted downloads
   */
  async cleanupCorruptedDownloads(): Promise<string[]> {
    const songs = await this.db.songs.filter(song => song.isDownloaded === true).toArray();
    const corruptedIds: string[] = [];

    for (const song of songs) {
      if (!song.audioBlob || song.audioBlob.size === 0) {
        corruptedIds.push(song.id);
        await this.removeSong(song.id);
      }
    }

    return corruptedIds;
  }
}

export const offlineStorageService = new OfflineStorageService();