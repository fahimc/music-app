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
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAudioPlayerContext } from '../contexts/AudioPlayerContext';
import { useMusicSources, type UnifiedSong } from '../contexts/MusicSourceContext';
import { offlineStorageService } from '../services/offlineStorage';
import { playlistService } from '../services/playlistService';
import { googleDriveService } from '../services/googleDrive';
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
    addLocalFolder,
    isLocalFolderSupported,
  } = useMusicSources();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadedSongs, setDownloadedSongs] = useState<Set<string>>(new Set());
  const [downloadingSongs, setDownloadingSongs] = useState<Map<string, number>>(new Map());
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'all' | 'playlists'>('all');
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

  const handleAddLocalFolder = async () => {
    try {
      await addLocalFolder();
    } catch (err) {
      console.error('Error adding local folder:', err);
    }
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
    if (song.source === 'local') return; // Local files don't need downloading
    if (downloadingSongs.has(song.id) || downloadedSongs.has(song.id)) return;

    setDownloadError(null);
    setDownloadingSongs(prev => new Map(prev).set(song.id, 0));

    try {
      // Fetch the audio with the authenticated media endpoint
      const blob = await googleDriveService.downloadSong(song, (progress) => {
        setDownloadingSongs(prev => new Map(prev).set(song.id, progress));
      });

      const songForStorage: Song = {
        id: song.id,
        name: song.name,
        artist: song.artist,
        album: song.album,
        duration: song.duration,
        size: song.size,
        mimeType: song.mimeType,
        downloadUrl: song.downloadUrl,
        thumbnailLink: song.thumbnailLink,
        isDownloaded: true,
        downloadProgress: 100,
        createdTime: song.createdTime,
        modifiedTime: song.modifiedTime,
      };

      // Store in IndexedDB for offline playback
      await offlineStorageService.storeSong(songForStorage, blob);

      setDownloadedSongs(prev => new Set(prev).add(song.id));
    } catch (err) {
      console.error('Download error:', err);
      setDownloadError(err instanceof Error ? err.message : 'Failed to download song');
    } finally {
      setDownloadingSongs(prev => {
        const next = new Map(prev);
        next.delete(song.id);
        return next;
      });
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
          sx={{ color: '#a855f7' }}
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
              borderColor: '#a855f7',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#a855f7',
            },
          },
        }}
      />

      {/* Tabs and Playlist Management */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, val) => setCurrentTab(val)} sx={{ mb: 2 }}>
          <Tab label="All Songs" value="all" />
          <Tab label="Playlists" value="playlists" />
        </Tabs>

        {currentTab === 'playlists' && (
          <Box sx={{ maxWidth: 360 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PlaylistAddIcon />}
              onClick={() => handleOpenPlaylistDialog()}
              sx={{
                mb: 2,
                borderColor: '#a855f7',
                color: '#a855f7',
                '&:hover': {
                  borderColor: '#c084fc',
                  backgroundColor: 'rgba(168, 85, 247, 0.08)',
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
                      backgroundColor: 'rgba(168, 85, 247, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(168, 85, 247, 0.3)',
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    <PlaylistIcon sx={{ color: '#a855f7' }} />
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

      {/* Stats */}
      {allSongs.length > 0 && (
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Chip 
            label={`${filteredSongs.length} songs`} 
            sx={{ backgroundColor: '#a855f7', color: 'white' }} 
          />
          <Chip 
            label={`${downloadedSongs.size} downloaded`} 
            variant="outlined" 
            sx={{ borderColor: '#a855f7', color: '#a855f7' }} 
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

      {/* Download Error */}
      {downloadError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setDownloadError(null)}>
          {downloadError}
        </Alert>
      )}

      {/* Loading State */}
      {isLoadingSongs && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#a855f7' }} />
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
                    <PauseIcon sx={{ color: '#a855f7' }} />
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
                        <CheckCircleIcon sx={{ color: '#a855f7', fontSize: 16 }} />
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
                disabled={downloadedSongs.has(song.id) || song.source === 'local' || downloadingSongs.has(song.id)}
                sx={{ 
                  color: downloadedSongs.has(song.id) ? '#a855f7' : '#b3b3b3',
                  '&:hover': {
                    color: '#a855f7',
                  },
                }}
              >
                {downloadingSongs.has(song.id) ? (
                  <CircularProgress
                    size={20}
                    variant="determinate"
                    value={downloadingSongs.get(song.id) ?? 0}
                    sx={{ color: '#a855f7' }}
                  />
                ) : downloadedSongs.has(song.id) ? (
                  <CheckCircleIcon />
                ) : (
                  <DownloadIcon />
                )}
              </IconButton>

              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleSongMenuOpen(e, song);
                }}
                sx={{ color: '#b3b3b3', '&:hover': { color: 'white' } }}
                title="More options"
              >
                <MoreIcon />
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
            Connect your Google Drive folder or add local music to get started.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              component={RouterLink}
              to="/settings"
              startIcon={<CloudIcon />}
              sx={{ bgcolor: '#a855f7', '&:hover': { bgcolor: '#c084fc' } }}
            >
              Connect Google Drive
            </Button>
            {isLocalFolderSupported && (
              <Button
                variant="outlined"
                onClick={handleAddLocalFolder}
                startIcon={<ComputerIcon />}
                sx={{
                  borderColor: '#a855f7',
                  color: '#a855f7',
                  '&:hover': {
                    borderColor: '#c084fc',
                    color: '#c084fc',
                    backgroundColor: 'rgba(168, 85, 247, 0.08)',
                  },
                }}
              >
                Add Local Folder
              </Button>
            )}
          </Stack>
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

      {/* Song context menu */}
      <Menu
        anchorEl={songMenuAnchor}
        open={Boolean(songMenuAnchor)}
        onClose={handleSongMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleSongMenuClose();
            handleOpenPlaylistDialog(menuSong ?? undefined);
          }}
        >
          <PlaylistAddIcon sx={{ mr: 1, color: '#a855f7' }} />
          Add to Playlist
        </MenuItem>
        {selectedPlaylist && menuSong && (
          <MenuItem
            onClick={() => {
              handleRemoveFromPlaylist(menuSong.id);
              handleSongMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} />
            Remove from Playlist
          </MenuItem>
        )}
      </Menu>

      {/* Playlist management dialog */}
      <PlaylistDialog
        open={playlistDialogOpen}
        onClose={() => setPlaylistDialogOpen(false)}
        song={selectedSongForPlaylist || undefined}
        playlists={playlists}
        onPlaylistsChange={loadPlaylists}
      />
    </Container>
  );
};