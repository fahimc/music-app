import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  IconButton,
  Box,
  Typography,
  Chip,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  PlaylistAdd as PlaylistAddIcon,
  PlaylistPlay as PlaylistIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
  MusicNote as MusicNoteIcon,
} from '@mui/icons-material';
import type { Playlist, Song } from '../types';
import { playlistService } from '../services/playlistService';

interface PlaylistDialogProps {
  open: boolean;
  onClose: () => void;
  song?: Song; // If provided, show "Add to Playlist" dialog
  playlists: Playlist[];
  onPlaylistsChange: () => void;
}

export const PlaylistDialog: React.FC<PlaylistDialogProps> = ({
  open,
  onClose,
  song,
  playlists,
  onPlaylistsChange,
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;

    playlistService.createPlaylist(newPlaylistName, newPlaylistDescription);
    setNewPlaylistName('');
    setNewPlaylistDescription('');
    setShowCreateForm(false);
    onPlaylistsChange();
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (!song) return;

    const success = playlistService.addSongToPlaylist(playlistId, song.id);
    if (success) {
      onPlaylistsChange();
    }
  };

  const handleDeletePlaylist = (playlistId: string) => {
    playlistService.deletePlaylist(playlistId);
    onPlaylistsChange();
    setAnchorEl(null);
  };

  const handleUpdatePlaylist = () => {
    if (!editingPlaylist || !newPlaylistName.trim()) return;

    playlistService.updatePlaylist(editingPlaylist.id, {
      name: newPlaylistName,
      description: newPlaylistDescription,
    });
    setEditingPlaylist(null);
    setNewPlaylistName('');
    setNewPlaylistDescription('');
    onPlaylistsChange();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, playlist: Playlist) => {
    setAnchorEl(event.currentTarget);
    setSelectedPlaylist(playlist);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPlaylist(null);
  };

  const startEdit = () => {
    if (selectedPlaylist) {
      setEditingPlaylist(selectedPlaylist);
      setNewPlaylistName(selectedPlaylist.name);
      setNewPlaylistDescription(selectedPlaylist.description || '');
      setShowCreateForm(true);
    }
    handleMenuClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {song ? 'Add to Playlist' : editingPlaylist ? 'Edit Playlist' : 'Manage Playlists'}
        </DialogTitle>

        <DialogContent>
          {song && (
            <Alert severity="info" sx={{ mb: 2 }} icon={<MusicNoteIcon />}>
              Adding "{song.name}" to a playlist
            </Alert>
          )}

          {!showCreateForm && !editingPlaylist ? (
            <>
              <List>
                {playlists.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <PlaylistIcon sx={{ fontSize: 48, color: '#666', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No playlists yet. Create your first one!
                    </Typography>
                  </Box>
                ) : (
                  playlists.map((playlist) => {
                    const isInPlaylist = song && playlistService.isSongInPlaylist(playlist.id, song.id);
                    
                    return (
                      <ListItem
                        key={playlist.id}
                        secondaryAction={
                          !song && (
                            <IconButton onClick={(e) => handleMenuClick(e, playlist)}>
                              <MoreIcon />
                            </IconButton>
                          )
                        }
                        disablePadding
                      >
                        <ListItemButton
                          onClick={() => song && handleAddToPlaylist(playlist.id)}
                          disabled={isInPlaylist}
                        >
                          <ListItemIcon>
                            <PlaylistIcon sx={{ color: '#1db954' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={playlist.name}
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {playlist.description && (
                                  <Typography variant="caption">{playlist.description}</Typography>
                                )}
                                <Chip
                                  label={`${playlist.songIds.length} songs`}
                                  size="small"
                                  sx={{ bgcolor: 'rgba(29, 185, 84, 0.2)' }}
                                />
                                {isInPlaylist && (
                                  <Chip label="Added" size="small" color="success" />
                                )}
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })
                )}
              </List>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<PlaylistAddIcon />}
                onClick={() => setShowCreateForm(true)}
                sx={{
                  mt: 2,
                  borderColor: '#1db954',
                  color: '#1db954',
                  '&:hover': {
                    borderColor: '#1ed760',
                    backgroundColor: 'rgba(29, 185, 84, 0.08)',
                  },
                }}
              >
                Create New Playlist
              </Button>
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Playlist Name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="My Awesome Playlist"
                autoFocus
              />
              <TextField
                fullWidth
                label="Description (Optional)"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                placeholder="A collection of my favorite songs"
                multiline
                rows={2}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingPlaylist(null);
                    setNewPlaylistName('');
                    setNewPlaylistDescription('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={editingPlaylist ? handleUpdatePlaylist : handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                  sx={{
                    bgcolor: '#1db954',
                    '&:hover': { bgcolor: '#1ed760' },
                  }}
                >
                  {editingPlaylist ? 'Update' : 'Create'}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={startEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => selectedPlaylist && handleDeletePlaylist(selectedPlaylist.id)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
