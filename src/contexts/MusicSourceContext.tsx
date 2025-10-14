import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Song } from '../types';
import { googleDriveService } from '../services/googleDrive';
import { localFolderService, type LocalSong, type LocalFolder } from '../services/localFolder';
import { useAuth } from './AuthContext';

export type MusicSource = 'drive' | 'local';

export interface UnifiedSong extends Song {
  source: MusicSource;
  originalData?: LocalSong; // For local files, store the original local song data
}

interface MusicSourceContextType {
  // Songs
  allSongs: UnifiedSong[];
  driveSongs: Song[];
  localSongs: LocalSong[];
  isLoadingSongs: boolean;
  songsError: string | null;

  // Local folders
  localFolders: LocalFolder[];
  isLoadingFolders: boolean;

  // Actions
  refreshSongs: () => Promise<void>;
  addLocalFolder: () => Promise<LocalFolder | null>;
  removeLocalFolder: (folderId: string) => void;
  rescanLocalFolder: (folderId: string) => Promise<void>;
  searchSongs: (query: string) => UnifiedSong[];

  // Utilities
  createSongUrl: (song: UnifiedSong) => string;
  revokeSongUrl: (url: string) => void;
  isLocalFolderSupported: boolean;
}

const MusicSourceContext = createContext<MusicSourceContextType | undefined>(undefined);

interface MusicSourceProviderProps {
  children: ReactNode;
}

export const MusicSourceProvider: React.FC<MusicSourceProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // Songs state
  const [driveSongs, setDriveSongs] = useState<Song[]>([]);
  const [localSongs, setLocalSongs] = useState<LocalSong[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [songsError, setSongsError] = useState<string | null>(null);

  // Local folders state
  const [localFolders, setLocalFolders] = useState<LocalFolder[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);

  // Check if local folder support is available
  const isLocalFolderSupported = localFolderService.isSupported();

  // Initialize local songs on mount
  useEffect(() => {
    loadLocalSongs();
    loadLocalFolders();
  }, []);

  // Load Drive songs when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshDriveSongs();
    } else {
      setDriveSongs([]);
    }
  }, [isAuthenticated]);

  /**
   * Load local songs from the local folder service
   */
  const loadLocalSongs = () => {
    try {
      const songs = localFolderService.getSongs();
      setLocalSongs(songs);
    } catch (error) {
      console.error('Error loading local songs:', error);
    }
  };

  /**
   * Load local folders
   */
  const loadLocalFolders = () => {
    try {
      const folders = localFolderService.getFolders();
      setLocalFolders(folders);
    } catch (error) {
      console.error('Error loading local folders:', error);
    }
  };

  /**
   * Refresh Drive songs
   */
  const refreshDriveSongs = async () => {
    if (!isAuthenticated) {
      setDriveSongs([]);
      return;
    }

    setIsLoadingSongs(true);
    setSongsError(null);

    try {
      const songs = await googleDriveService.getAllSongs();
      setDriveSongs(songs);
    } catch (error) {
      console.error('Error fetching Drive songs:', error);
      setSongsError(error instanceof Error ? error.message : 'Failed to load songs from Google Drive');
    } finally {
      setIsLoadingSongs(false);
    }
  };

  /**
   * Refresh all songs from all sources
   */
  const refreshSongs = async () => {
    setIsLoadingSongs(true);
    setSongsError(null);

    try {
      // Refresh Drive songs if authenticated
      if (isAuthenticated) {
        await refreshDriveSongs();
      }

      // Refresh local songs
      loadLocalSongs();
    } catch (error) {
      console.error('Error refreshing songs:', error);
      setSongsError(error instanceof Error ? error.message : 'Failed to refresh songs');
    } finally {
      setIsLoadingSongs(false);
    }
  };

  /**
   * Add a local folder
   */
  const addLocalFolder = async (): Promise<LocalFolder | null> => {
    setIsLoadingFolders(true);

    try {
      const folder = await localFolderService.addFolder();
      
      if (folder) {
        // Refresh local folders and songs
        loadLocalFolders();
        loadLocalSongs();
      }
      
      return folder;
    } catch (error) {
      console.error('Error adding local folder:', error);
      throw error;
    } finally {
      setIsLoadingFolders(false);
    }
  };

  /**
   * Remove a local folder
   */
  const removeLocalFolder = (folderId: string) => {
    try {
      localFolderService.removeFolder(folderId);
      loadLocalFolders();
      loadLocalSongs();
    } catch (error) {
      console.error('Error removing local folder:', error);
      throw error;
    }
  };

  /**
   * Rescan a local folder
   */
  const rescanLocalFolder = async (folderId: string) => {
    setIsLoadingFolders(true);

    try {
      await localFolderService.rescanFolder(folderId);
      loadLocalFolders();
      loadLocalSongs();
    } catch (error) {
      console.error('Error rescanning local folder:', error);
      throw error;
    } finally {
      setIsLoadingFolders(false);
    }
  };

  /**
   * Convert local songs to unified format
   */
  const convertLocalSongsToUnified = (songs: LocalSong[]): UnifiedSong[] => {
    return songs.map(song => ({
      id: song.id,
      name: song.name,
      size: song.size,
      mimeType: song.mimeType,
      createdTime: song.createdTime.toISOString(),
      modifiedTime: song.modifiedTime.toISOString(),
      artist: song.artist,
      album: song.album,
      duration: song.duration,
      isDownloaded: song.isDownloaded,
      webViewLink: undefined, // Local files don't have webViewLink
      downloadUrl: undefined, // Local files don't need download URL
      thumbnailLink: undefined, // Local files don't have thumbnails (yet)
      downloadProgress: 0,
      source: 'local' as MusicSource,
      originalData: song,
    }));
  };

  /**
   * Convert Drive songs to unified format
   */
  const convertDriveSongsToUnified = (songs: Song[]): UnifiedSong[] => {
    return songs.map(song => ({
      ...song,
      source: 'drive' as MusicSource,
    }));
  };

  /**
   * Get all songs in unified format
   */
  const allSongs: UnifiedSong[] = [
    ...convertDriveSongsToUnified(driveSongs),
    ...convertLocalSongsToUnified(localSongs),
  ];

  /**
   * Search songs across all sources
   */
  const searchSongs = (query: string): UnifiedSong[] => {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      return allSongs;
    }

    return allSongs.filter(song =>
      song.name.toLowerCase().includes(searchTerm) ||
      (song.artist && song.artist.toLowerCase().includes(searchTerm)) ||
      (song.album && song.album.toLowerCase().includes(searchTerm))
    );
  };

  /**
   * Create a playable URL for a song
   */
  const createSongUrl = (song: UnifiedSong): string => {
    if (song.source === 'local' && song.originalData) {
      return localFolderService.createSongUrl(song.originalData);
    } else if (song.source === 'drive' && song.downloadUrl) {
      // For Drive songs, use the download URL
      return song.downloadUrl;
    }
    
    throw new Error(`Cannot create URL for song: ${song.name}`);
  };

  /**
   * Clean up object URLs
   */
  const revokeSongUrl = (url: string) => {
    if (url.startsWith('blob:')) {
      localFolderService.revokeSongUrl(url);
    }
    // Drive URLs don't need manual cleanup
  };

  const contextValue: MusicSourceContextType = {
    // Songs
    allSongs,
    driveSongs,
    localSongs,
    isLoadingSongs,
    songsError,

    // Local folders
    localFolders,
    isLoadingFolders,

    // Actions
    refreshSongs,
    addLocalFolder,
    removeLocalFolder,
    rescanLocalFolder,
    searchSongs,

    // Utilities
    createSongUrl,
    revokeSongUrl,
    isLocalFolderSupported,
  };

  return (
    <MusicSourceContext.Provider value={contextValue}>
      {children}
    </MusicSourceContext.Provider>
  );
};

export const useMusicSources = (): MusicSourceContextType => {
  const context = useContext(MusicSourceContext);
  if (!context) {
    throw new Error('useMusicSources must be used within a MusicSourceProvider');
  }
  return context;
};