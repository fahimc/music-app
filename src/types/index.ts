// Song and audio-related types
export interface Song {
  id: string;
  name: string;
  artist?: string;
  album?: string;
  duration?: number;
  size: number;
  mimeType: string;
  downloadUrl?: string;
  thumbnailLink?: string;
  isDownloaded: boolean;
  downloadProgress?: number;
  createdTime: string;
  modifiedTime: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AudioPlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  isShuffling: boolean;
  isRepeating: boolean;
  queue: Song[];
  currentIndex: number;
}

// Google Drive API types
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  thumbnailLink?: string;
  webContentLink?: string;
  createdTime: string;
  modifiedTime: string;
  parents?: string[];
}

export interface DriveResponse {
  files: DriveFile[];
  nextPageToken?: string;
  incompleteSearch: boolean;
}

// Auth types
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: GoogleUser | null;
  accessToken: string | null;
  error: string | null;
}

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

// Download and offline types
export interface DownloadProgress {
  songId: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  error?: string;
}

export interface OfflineStorage {
  songs: Map<string, Blob>;
  metadata: Map<string, Song>;
  totalSize: number;
  lastUpdated: Date;
}

// UI types
export interface SearchFilters {
  query: string;
  sortBy: 'name' | 'artist' | 'album' | 'duration' | 'dateAdded';
  sortOrder: 'asc' | 'desc';
  showDownloadedOnly: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  autoDownloadQuality: 'low' | 'medium' | 'high';
  maxCacheSize: number; // in MB
  autoPlay: boolean;
  crossfade: boolean;
  normalizeVolume: boolean;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Service Worker types
export interface SWMessage {
  type: 'CACHE_SONG' | 'DELETE_SONG' | 'GET_CACHED_SONGS' | 'CLEAR_CACHE';
  payload?: any;
}