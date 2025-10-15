import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Tabs,
  Tab,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MusicNote as MusicNoteIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  CloudDownload as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Cloud as CloudIcon,
  Computer as ComputerIcon,
  PlaylistAdd as PlaylistAddIcon,
  PlaylistPlay as PlaylistIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useAudioPlayerContext } from '../contexts/AudioPlayerContext';
import { useMusicSources, type UnifiedSong } from '../contexts/MusicSourceContext';
import { offlineStorageService } from '../services/offlineStorage';
import { playlistService } from '../services/playlistService';
import { PlaylistDialog } from './PlaylistDialog';
import type { Song, Playlist } from '../types';

export const SongListPage: React.FC = () => {
  const { isAuthenticated, error: authError } = useAuth();
  const { 
    currentSong, 
    isPlaying, 
    playSong, 
    togglePlayPause, 
    setQueue 
  } = useAudioPlayerContext();
  
  const {
    allSongs,
    isLoadingSongs,
    songsError,
    refreshSongs,
    searchSongs,
    createSongUrl,
  } = useMusicSources();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadedSongs, setDownloadedSongs] = useState<Set<string>>(new Set());
  const [currentTab, setCurrentTab] = useState<'all' | 'playlists'>(0);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState<Song | null>(null);
  const [songMenuAnchor, setSongMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuSong, setMenuSong] = useState<Song | null>(null);

  // Get filtered songs based on search query and selected playlist
  const getDisplayedSongs = (): UnifiedSong[] => {
    let songs = searchQuery ? searchSongs(searchQuery) : allSongs;
    
    if (selectedPlaylist) {
      songs = songs.filter(song => selectedPlaylist.songIds.includes(song.id));
    }
    
    return songs;
  };

  const filteredSongs = getDisplayedSongs();

  // Check downloaded songs on mount and when songs change
  useEffect(() => {
    checkDownloadedSongs();
  }, [allSongs]);

  // Load playlists on mount
  useEffect(() => {
    loadPlaylists();
  }, []);

  const checkDownloadedSongs = async () => {
    const downloaded = new Set<string>();
    for (const song of allSongs) {
      if (song.source === 'local' || song.isDownloaded) {
        downloaded.add(song.id);
      } else {
        const isDownloaded = await offlineStorageService.isSongDownloaded(song.id);
        if (isDownloaded) {
          downloaded.add(song.id);
        }
      }
    }
    setDownloadedSongs(downloaded);
  };

  const loadPlaylists = () => {
    const loadedPlaylists = playlistService.getAllPlaylists();
    setPlaylists(loadedPlaylists);
  };

  const handleOpenPlaylistDialog = (song?: Song) => {
    setSelectedSongForPlaylist(song || null);
    setPlaylistDialogOpen(true);
  };

  const handleRemoveFromPlaylist = (songId: string) => {
    if (!selectedPlaylist) return;
    
    playlistService.removeSongFromPlaylist(selectedPlaylist.id, songId);
    loadPlaylists();
    
    // Update selected playlist to reflect changes
    const updated = playlistService.getPlaylist(selectedPlaylist.id);
    setSelectedPlaylist(updated);
  };

  const handleSongMenuOpen = (event: React.MouseEvent<HTMLElement>, song: Song) => {
    setSongMenuAnchor(event.currentTarget);
    setMenuSong(song);
  };

  const handleSongMenuClose = () => {
    setSongMenuAnchor(null);
    setMenuSong(null);
  };

  const handlePlayPause = async (song: UnifiedSong) => {
    if (currentSong?.id === song.id) {
      togglePlayPause();
    } else {
      try {
        // Convert UnifiedSong to Song format for audio player
        const songForPlayer: Song = {
          id: song.id,
          name: song.name,
          artist: song.artist,
          album: song.album,
          duration: song.duration,
          size: song.size,
          mimeType: song.mimeType,
          downloadUrl: createSongUrl(song),
          isDownloaded: song.isDownloaded || false,
          createdTime: song.createdTime || new Date().toISOString(),
          modifiedTime: song.modifiedTime || new Date().toISOString(),
        };
        
        await playSong(songForPlayer);
        
        // Convert filtered songs to Song format for queue
        const queueSongs: Song[] = filteredSongs.map(s => ({
          id: s.id,
          name: s.name,
          artist: s.artist,
          album: s.album,
          duration: s.duration,
          size: s.size,
          mimeType: s.mimeType,
          downloadUrl: createSongUrl(s),
          isDownloaded: s.isDownloaded || false,
          createdTime: s.createdTime || new Date().toISOString(),
          modifiedTime: s.modifiedTime || new Date().toISOString(),
        }));
        
        setQueue(queueSongs);
      } catch (error) {
        console.error('Failed to play song:', error);
      }
    }
  };

  const handleDownload = async (song: UnifiedSong) => {
    if (song.source === 'local') {
      return; // Local files don't need downloading
    }

    try {
      // TODO: Implement actual download functionality for Drive songs
      console.log('Download requested for:', song.name);
      
      // Placeholder: Mark as downloaded
      const newDownloaded = new Set(downloadedSongs);
      newDownloaded.add(song.id);
      setDownloadedSongs(newDownloaded);
      
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const getSourceIcon = (source: 'drive' | 'local') => {
    return source === 'drive' ? <CloudIcon /> : <ComputerIcon />;
  };

  const formatDuration = (duration?: number): string => {
    if (!duration) return '--:--';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          Please sign in with Google to access your music library, or use local folder access.
        </Alert>
      </Container>
    );
  }

  if (authError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {authError}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Your Music Library
        </Typography>
        <IconButton 
          onClick={refreshSongs} 
          disabled={isLoadingSongs}
          sx={{ color: '#1db954' }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search songs, artists..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          sx: {
            backgroundColor: '#2a2a2a',
            borderRadius: '50px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#404040',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1db954',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1db954',
            },
          },
        }}
      />

      {/* Tabs and Playlist Management */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Box sx={{ flex: currentTab === 'playlists' ? '0 0 280px' : '0 0 auto' }}>
          <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)} sx={{ mb: 2 }}>
            <Tab label="All Songs" value="all" />
            <Tab label="Playlists" value="playlists" />
          </Tabs>

          {currentTab === 'playlists' && (
            <Box>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PlaylistAddIcon />}
                onClick={() => handleOpenPlaylistDialog()}
                sx={{
                  mb: 2,
                  borderColor: '#1db954',
                  color: '#1db954',
                  '&:hover': {
                    borderColor: '#1ed760',
                    backgroundColor: 'rgba(29, 185, 84, 0.08)',
                  },
                }}
              >
                New Playlist
              </Button>

              <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
                {playlists.map((playlist) => (
                  <ListItemButton
                    key={playlist.id}
                    selected={selectedPlaylist?.id === playlist.id}
                    onClick={() => setSelectedPlaylist(playlist)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(29, 185, 84, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(29, 185, 84, 0.3)',
                        },
                      },
                    }}
                  >
                    <ListItemIcon>
                      <PlaylistIcon sx={{ color: '#1db954' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={playlist.name}
                      secondary={`${playlist.songIds.length} songs`}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          )}
        </Box>

        <Box sx={{ flex: 1 }}>
          {/* Content area - stats and songs will go here */}
        </Box>
      </Box>

      {/* Stats */}
      {allSongs.length > 0 && (
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Chip 
            label={`${filteredSongs.length} songs`} 
            sx={{ backgroundColor: '#1db954', color: 'white' }} 
          />
          <Chip 
            label={`${downloadedSongs.size} downloaded`} 
            variant="outlined" 
            sx={{ borderColor: '#1db954', color: '#1db954' }} 
          />
          <Chip 
            label={`${allSongs.filter(s => s.source === 'drive').length} from Drive`} 
            icon={<CloudIcon />}
            variant="outlined" 
            sx={{ borderColor: '#4285f4', color: '#4285f4' }} 
          />
          <Chip 
            label={`${allSongs.filter(s => s.source === 'local').length} local`} 
            icon={<ComputerIcon />}
            variant="outlined" 
            sx={{ borderColor: '#ff9800', color: '#ff9800' }} 
          />
        </Stack>
      )}

      {/* Error Display */}
      {songsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {songsError}
        </Alert>
      )}

      {/* Loading State */}
      {isLoadingSongs && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#1db954' }} />
        </Box>
      )}

      {/* Songs List */}
      {!isLoadingSongs && filteredSongs.length > 0 && (
        <List sx={{ bgcolor: '#181818', borderRadius: 2 }}>
          {filteredSongs.map((song, index) => (
            <ListItem 
              key={song.id} 
              divider={index < filteredSongs.length - 1}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)' 
                } 
              }}
            >
              <ListItemButton onClick={() => handlePlayPause(song)}>
                <ListItemIcon>
                  {currentSong?.id === song.id && isPlaying ? (
                    <PauseIcon sx={{ color: '#1db954' }} />
                  ) : (
                    <PlayArrowIcon sx={{ color: '#b3b3b3' }} />
                  )}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {song.name}
                      </Typography>
                      {getSourceIcon(song.source)}
                      {downloadedSongs.has(song.id) && (
                        <CheckCircleIcon sx={{ color: '#1db954', fontSize: 16 }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                      <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                        {song.artist || 'Unknown Artist'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        •
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                        {formatFileSize(song.size)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        •
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                        {formatDuration(song.duration)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        •
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                        {song.source === 'drive' ? 'Google Drive' : 'Local'}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>

              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(song);
                }}
                disabled={downloadedSongs.has(song.id) || song.source === 'local'}
                sx={{ 
                  color: downloadedSongs.has(song.id) ? '#1db954' : '#b3b3b3',
                  '&:hover': {
                    color: '#1db954',
                  },
                }}
              >
                {downloadedSongs.has(song.id) ? <CheckCircleIcon /> : <DownloadIcon />}
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}

      {/* Empty State */}
      {!isLoadingSongs && filteredSongs.length === 0 && allSongs.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <MusicNoteIcon sx={{ fontSize: 64, color: '#666', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No music found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add local folders or connect your Google Drive to get started.
          </Typography>
        </Box>
      )}

      {/* No Search Results */}
      {!isLoadingSongs && filteredSongs.length === 0 && allSongs.length > 0 && searchQuery && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <SearchIcon sx={{ fontSize: 64, color: '#666', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No results for "{searchQuery}"
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try a different search term or browse all your music.
          </Typography>
        </Box>
      )}
    </Container>
  );
};