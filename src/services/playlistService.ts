import type { Playlist } from '../types';

class PlaylistService {
  private readonly STORAGE_KEY = 'music_app_playlists';

  /**
   * Get all playlists from localStorage
   */
  getAllPlaylists(): Playlist[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const playlists = JSON.parse(stored) as Playlist[];
      return playlists;
    } catch (error) {
      console.error('Error loading playlists:', error);
      return [];
    }
  }

  /**
   * Get a specific playlist by ID
   */
  getPlaylist(playlistId: string): Playlist | null {
    const playlists = this.getAllPlaylists();
    return playlists.find(p => p.id === playlistId) || null;
  }

  /**
   * Create a new playlist
   */
  createPlaylist(name: string, description?: string): Playlist {
    const playlists = this.getAllPlaylists();
    
    const newPlaylist: Playlist = {
      id: this.generateId(),
      name: name.trim(),
      description: description?.trim(),
      songIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    playlists.push(newPlaylist);
    this.savePlaylists(playlists);
    
    return newPlaylist;
  }

  /**
   * Update playlist details (name, description)
   */
  updatePlaylist(playlistId: string, updates: Partial<Pick<Playlist, 'name' | 'description'>>): Playlist | null {
    const playlists = this.getAllPlaylists();
    const index = playlists.findIndex(p => p.id === playlistId);
    
    if (index === -1) return null;

    playlists[index] = {
      ...playlists[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.savePlaylists(playlists);
    return playlists[index];
  }

  /**
   * Delete a playlist
   */
  deletePlaylist(playlistId: string): boolean {
    const playlists = this.getAllPlaylists();
    const filtered = playlists.filter(p => p.id !== playlistId);
    
    if (filtered.length === playlists.length) {
      return false; // Playlist not found
    }

    this.savePlaylists(filtered);
    return true;
  }

  /**
   * Add a song to a playlist
   */
  addSongToPlaylist(playlistId: string, songId: string): boolean {
    const playlists = this.getAllPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) return false;

    // Don't add duplicates
    if (playlist.songIds.includes(songId)) {
      return false;
    }

    playlist.songIds.push(songId);
    playlist.updatedAt = new Date().toISOString();
    
    this.savePlaylists(playlists);
    return true;
  }

  /**
   * Add multiple songs to a playlist
   */
  addSongsToPlaylist(playlistId: string, songIds: string[]): number {
    const playlists = this.getAllPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) return 0;

    let addedCount = 0;
    for (const songId of songIds) {
      if (!playlist.songIds.includes(songId)) {
        playlist.songIds.push(songId);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      playlist.updatedAt = new Date().toISOString();
      this.savePlaylists(playlists);
    }

    return addedCount;
  }

  /**
   * Remove a song from a playlist
   */
  removeSongFromPlaylist(playlistId: string, songId: string): boolean {
    const playlists = this.getAllPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) return false;

    const initialLength = playlist.songIds.length;
    playlist.songIds = playlist.songIds.filter(id => id !== songId);
    
    if (playlist.songIds.length === initialLength) {
      return false; // Song not found in playlist
    }

    playlist.updatedAt = new Date().toISOString();
    this.savePlaylists(playlists);
    return true;
  }

  /**
   * Check if a song is in a playlist
   */
  isSongInPlaylist(playlistId: string, songId: string): boolean {
    const playlist = this.getPlaylist(playlistId);
    return playlist ? playlist.songIds.includes(songId) : false;
  }

  /**
   * Get all playlists that contain a specific song
   */
  getPlaylistsForSong(songId: string): Playlist[] {
    const playlists = this.getAllPlaylists();
    return playlists.filter(p => p.songIds.includes(songId));
  }

  /**
   * Clear all playlists
   */
  clearAllPlaylists(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Save playlists to localStorage
   */
  private savePlaylists(playlists: Playlist[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(playlists));
    } catch (error) {
      console.error('Error saving playlists:', error);
      throw new Error('Failed to save playlists');
    }
  }

  /**
   * Generate a unique ID for playlists
   */
  private generateId(): string {
    return `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export playlists as JSON
   */
  exportPlaylists(): string {
    const playlists = this.getAllPlaylists();
    return JSON.stringify(playlists, null, 2);
  }

  /**
   * Import playlists from JSON
   */
  importPlaylists(json: string): number {
    try {
      const imported = JSON.parse(json) as Playlist[];
      const existing = this.getAllPlaylists();
      
      // Merge with existing, avoiding duplicates by ID
      const merged = [...existing];
      let importedCount = 0;

      for (const playlist of imported) {
        if (!existing.find(p => p.id === playlist.id)) {
          merged.push(playlist);
          importedCount++;
        }
      }

      this.savePlaylists(merged);
      return importedCount;
    } catch (error) {
      console.error('Error importing playlists:', error);
      throw new Error('Failed to import playlists');
    }
  }
}

export const playlistService = new PlaylistService();
