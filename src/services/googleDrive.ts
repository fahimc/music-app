import type { DriveFile, DriveResponse, Song } from '../types';
import { googleAuthService } from './googleAuth';

class GoogleDriveService {
  private readonly BASE_URL = 'https://www.googleapis.com/drive/v3';
  private readonly AUDIO_MIME_TYPES = [
    'audio/mpeg',
    'audio/mp3', 
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/flac',
    'audio/x-m4a'
  ];

  /**
   * List audio files from a specific Google Drive folder
   */
  async listSongs(folderId?: string, pageToken?: string, maxResults = 50): Promise<DriveResponse> {
    const accessToken = googleAuthService.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    // Check if token needs refresh
    if (googleAuthService.isTokenExpired()) {
      await googleAuthService.refreshToken();
    }

    const query = this.buildQuery(folderId);
    const params = new URLSearchParams({
      q: query,
      fields: 'files(id,name,mimeType,size,thumbnailLink,webContentLink,createdTime,modifiedTime,parents),nextPageToken,incompleteSearch',
      pageSize: maxResults.toString(),
      orderBy: 'name'
    });

    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    const response = await fetch(`${this.BASE_URL}/files?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Drive API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Convert Drive files to Song objects
   */
  convertDriveFilesToSongs(driveFiles: DriveFile[]): Song[] {
    return driveFiles.map(file => ({
      id: file.id,
      name: this.extractSongName(file.name),
      artist: this.extractArtist(file.name),
      album: undefined, // Could be extracted from folder structure
      duration: undefined, // Would need additional API call to get metadata
      size: parseInt(file.size, 10),
      mimeType: file.mimeType,
      downloadUrl: file.webContentLink,
      thumbnailLink: file.thumbnailLink,
      isDownloaded: false,
      downloadProgress: 0,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
    }));
  }

  /**
   * Get all songs from the configured folder or root
   */
  async getAllSongs(folderId?: string): Promise<Song[]> {
    const allSongs: Song[] = [];
    let pageToken: string | undefined;

    do {
      const response = await this.listSongs(folderId, pageToken);
      const songs = this.convertDriveFilesToSongs(response.files);
      allSongs.push(...songs);
      pageToken = response.nextPageToken;
    } while (pageToken);

    return allSongs;
  }

  /**
   * Download a song file from Google Drive
   */
  async downloadSong(song: Song, onProgress?: (progress: number) => void): Promise<Blob> {
    const accessToken = googleAuthService.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    if (!song.downloadUrl) {
      throw new Error('No download URL available for this song');
    }

    const response = await fetch(song.downloadUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const contentLength = response.headers.get('Content-Length');
    const total = contentLength ? parseInt(contentLength, 10) : song.size;

    if (!onProgress) {
      return await response.blob();
    }

    // Track download progress
    const reader = response.body?.getReader();
    if (!reader) {
      return await response.blob();
    }

    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      const progress = (receivedLength / total) * 100;
      onProgress(progress);
    }

    // Combine all chunks
    const allChunks = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }

    return new Blob([allChunks], { type: song.mimeType });
  }

  /**
   * Get file metadata including duration (requires additional API call)
   */
  async getFileMetadata(fileId: string): Promise<any> {
    const accessToken = googleAuthService.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${this.BASE_URL}/files/${fileId}?fields=*`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Metadata fetch failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Search songs by query
   */
  async searchSongs(query: string, folderId?: string): Promise<Song[]> {
    const searchQuery = `${this.buildQuery(folderId)} and name contains '${query}'`;
    
    const params = new URLSearchParams({
      q: searchQuery,
      fields: 'files(id,name,mimeType,size,thumbnailLink,webContentLink,createdTime,modifiedTime,parents)',
      pageSize: '50',
      orderBy: 'name'
    });

    const accessToken = googleAuthService.getAccessToken();
    const response = await fetch(`${this.BASE_URL}/files?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return this.convertDriveFilesToSongs(result.files);
  }

  private buildQuery(folderId?: string): string {
    const mimeTypeQuery = this.AUDIO_MIME_TYPES
      .map(type => `mimeType='${type}'`)
      .join(' or ');
    
    let query = `(${mimeTypeQuery}) and trashed=false`;
    
    if (folderId) {
      query += ` and '${folderId}' in parents`;
    }
    
    return query;
  }

  private extractSongName(fileName: string): string {
    // Remove file extension
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    
    // Try to extract song name from common patterns
    // Pattern: "Artist - Song Name"
    const dashPattern = nameWithoutExt.split(' - ');
    if (dashPattern.length >= 2) {
      return dashPattern.slice(1).join(' - ').trim();
    }
    
    // Pattern: "01. Song Name" or "Track 01 - Song Name"
    const trackPattern = nameWithoutExt.replace(/^\d+\.?\s*-?\s*/, '');
    if (trackPattern !== nameWithoutExt) {
      return trackPattern.trim();
    }
    
    return nameWithoutExt.trim();
  }

  private extractArtist(fileName: string): string | undefined {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    
    // Pattern: "Artist - Song Name"
    const dashPattern = nameWithoutExt.split(' - ');
    if (dashPattern.length >= 2) {
      return dashPattern[0].trim();
    }
    
    return undefined;
  }
}

export const googleDriveService = new GoogleDriveService();