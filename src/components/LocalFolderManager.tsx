import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Alert,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  MusicNote as MusicIcon,
  Computer as ComputerIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useMusicSources } from '../contexts/MusicSourceContext';
import type { LocalFolder } from '../services/localFolder';

export const LocalFolderManager: React.FC = () => {
  const {
    localFolders,
    isLoadingFolders,
    addLocalFolder,
    removeLocalFolder,
    rescanLocalFolder,
    isLocalFolderSupported,
  } = useMusicSources();

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [folderToRemove, setFolderToRemove] = useState<LocalFolder | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddFolder = async () => {
    setIsAdding(true);
    setError(null);

    try {
      const folder = await addLocalFolder();
      if (folder) {
        console.log('Added folder:', folder.name);
      }
    } catch (err) {
      console.error('Error adding folder:', err);
      setError(err instanceof Error ? err.message : 'Failed to add folder');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveFolder = (folder: LocalFolder) => {
    setFolderToRemove(folder);
    setRemoveDialogOpen(true);
  };

  const confirmRemoveFolder = () => {
    if (folderToRemove) {
      try {
        removeLocalFolder(folderToRemove.id);
        setRemoveDialogOpen(false);
        setFolderToRemove(null);
      } catch (err) {
        console.error('Error removing folder:', err);
        setError(err instanceof Error ? err.message : 'Failed to remove folder');
      }
    }
  };

  const handleRescanFolder = async (folderId: string) => {
    setError(null);
    
    try {
      await rescanLocalFolder(folderId);
    } catch (err) {
      console.error('Error rescanning folder:', err);
      setError(err instanceof Error ? err.message : 'Failed to rescan folder');
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  if (!isLocalFolderSupported) {
    return (
      <Card sx={{ backgroundColor: '#181818' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ComputerIcon sx={{ color: '#1db954' }} />
            Local Music Folders
          </Typography>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Not Supported:</strong> Your browser doesn't support the File System Access API 
              needed for local folder access. This feature requires a modern browser like Chrome, Edge, or Opera.
            </Typography>
          </Alert>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Local folder support allows you to play music files directly from your computer 
            without uploading them to Google Drive.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ backgroundColor: '#181818' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ComputerIcon sx={{ color: '#1db954' }} />
            Local Music Folders
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddFolder}
            disabled={isAdding || isLoadingFolders}
            sx={{ bgcolor: '#1db954', '&:hover': { bgcolor: '#1ed760' } }}
          >
            {isAdding ? 'Adding...' : 'Add Folder'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add local folders to play music directly from your computer. 
          Your files stay on your device - nothing is uploaded to the cloud.
        </Typography>

        {localFolders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <FolderIcon sx={{ fontSize: 48, color: '#666', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No local folders added yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click "Add Folder" to select a music folder from your computer
            </Typography>
          </Box>
        ) : (
          <List>
            {localFolders.map((folder) => (
              <ListItem
                key={folder.id}
                sx={{ 
                  backgroundColor: '#2a2a2a', 
                  borderRadius: 1, 
                  mb: 1,
                  '&:hover': { backgroundColor: '#333' }
                }}
              >
                <ListItemIcon>
                  <FolderIcon sx={{ color: '#1db954' }} />
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        {folder.name}
                      </Typography>
                      <Chip 
                        label={`${folder.songCount} songs`}
                        size="small"
                        icon={<MusicIcon />}
                        sx={{ bgcolor: '#1db954', color: 'white' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      Last scanned: {formatDate(folder.lastScanned)}
                    </Typography>
                  }
                />

                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => handleRescanFolder(folder.id)}
                    disabled={isLoadingFolders}
                    sx={{ color: '#1db954' }}
                    title="Rescan folder"
                  >
                    <RefreshIcon />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFolder(folder)}
                    sx={{ color: '#ff4444' }}
                    title="Remove folder"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </ListItem>
            ))}
          </List>
        )}

        {/* Browser Compatibility Note */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="caption">
            <strong>Note:</strong> Folder access permissions are reset when you close the browser. 
            You may need to re-add folders after restarting the app.
          </Typography>
        </Alert>
      </CardContent>

      {/* Remove Folder Confirmation Dialog */}
      <Dialog
        open={removeDialogOpen}
        onClose={() => setRemoveDialogOpen(false)}
        PaperProps={{ sx: { backgroundColor: '#1a1a1a' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Remove Local Folder
        </DialogTitle>
        
        <DialogContent>
          <Typography>
            Are you sure you want to remove "{folderToRemove?.name}" from your music library?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will remove access to {folderToRemove?.songCount} songs. 
            Your actual files on disk will not be deleted.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setRemoveDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmRemoveFolder} color="error" variant="contained">
            Remove Folder
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};