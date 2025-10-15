import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Radio,
  Chip,
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  MusicNote as MusicNoteIcon,
  Search as SearchIcon,
  CloudQueue as CloudIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { googleDriveService } from '../services/googleDrive';
import { credentialStorageService } from '../services/credentialStorage';

interface DriveFolder {
  id: string;
  name: string;
  mimeType: string;
}

interface FolderSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onFolderSelected: (folderId: string, folderName: string) => void;
  currentFolderId?: string;
}

export const FolderSelectionDialog: React.FC<FolderSelectionDialogProps> = ({
  open,
  onClose,
  onFolderSelected,
  currentFolderId,
}) => {
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(currentFolderId || '');
  const [selectedFolderName, setSelectedFolderName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [useRootFolder, setUseRootFolder] = useState(!currentFolderId);
  const [musicFolder, setMusicFolder] = useState<DriveFolder | null>(null);

  useEffect(() => {
    if (open) {
      loadFolders();
    }
  }, [open]);

  const loadFolders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all folders from Google Drive (not just root)
      const response = await googleDriveService.listFiles();
      
      // Filter only folders
      const folderItems = (response.files || []).filter(
        item => item.mimeType === 'application/vnd.google-apps.folder'
      );

      setFolders(folderItems as DriveFolder[]);
      
      // Check if Music folder is in the list
      const musicFolderItem = folderItems.find(f => f.name.toLowerCase() === 'music');
      if (musicFolderItem) {
        setMusicFolder(musicFolderItem as DriveFolder);
        console.log('Found Music folder in list:', musicFolderItem.id);
      }
    } catch (err) {
      console.error('Error loading folders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load folders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderSelect = (folderId: string, folderName: string) => {
    setSelectedFolderId(folderId);
    setSelectedFolderName(folderName);
    setUseRootFolder(false);
  };

  const handleRootFolderSelect = () => {
    setSelectedFolderId('');
    setSelectedFolderName('My Drive (Root)');
    setUseRootFolder(true);
  };

  const handleSave = () => {
    const folderId = useRootFolder ? '' : selectedFolderId;
    const folderName = useRootFolder ? 'My Drive (Root)' : selectedFolderName;
    
    if (folderId || useRootFolder) {
      // Save folder ID to credentials
      const credentials = credentialStorageService.loadCredentials();
      if (credentials) {
        credentialStorageService.saveCredentials({
          ...credentials,
          folderId: folderId,
        });
      }
      
      onFolderSelected(folderId, folderName);
      onClose();
    }
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { backgroundColor: '#1a1a1a', color: 'white', minHeight: '500px' },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CloudIcon sx={{ color: '#1db954' }} />
        Select Music Folder
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }} icon={<InfoIcon />}>
          <Typography variant="body2">
            Choose a Google Drive folder where your music files are stored. 
            The app will scan this folder for audio files.
          </Typography>
        </Alert>

        {/* Music Folder Suggestion */}
        {musicFolder && (
          <Alert severity="success" sx={{ mb: 2 }} icon={<MusicNoteIcon />}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              💡 Music folder found!
            </Typography>
            <Typography variant="body2">
              We found a "Music" folder in your Drive. You can select it below.
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search folders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { backgroundColor: '#2a2a2a' },
          }}
        />

        {/* Root folder option */}
        <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
          <ListItem disablePadding>
            <ListItemButton
              selected={useRootFolder}
              onClick={handleRootFolderSelect}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(29, 185, 84, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(29, 185, 84, 0.3)',
                  },
                },
              }}
            >
              <ListItemIcon>
                <Radio
                  checked={useRootFolder}
                  sx={{
                    color: '#1db954',
                    '&.Mui-checked': { color: '#1db954' },
                  }}
                />
              </ListItemIcon>
              <ListItemIcon>
                <FolderOpenIcon sx={{ color: '#1db954' }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    My Drive (Root)
                    <Chip label="All files" size="small" sx={{ bgcolor: '#1db954' }} />
                  </Box>
                }
                secondary="Scan all music files in your Google Drive"
              />
            </ListItemButton>
          </ListItem>

          {/* Folder list */}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#1db954' }} />
            </Box>
          ) : filteredFolders.length > 0 ? (
            filteredFolders.map((folder) => {
              const isMusicFolder = folder.name.toLowerCase() === 'music';
              return (
                <ListItem key={folder.id} disablePadding>
                  <ListItemButton
                    selected={selectedFolderId === folder.id && !useRootFolder}
                    onClick={() => handleFolderSelect(folder.id, folder.name)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(29, 185, 84, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(29, 185, 84, 0.3)',
                        },
                      },
                      ...(isMusicFolder && {
                        border: '2px solid #1db954',
                        borderRadius: '4px',
                        mb: 0.5,
                      }),
                    }}
                  >
                    <ListItemIcon>
                      <Radio
                        checked={selectedFolderId === folder.id && !useRootFolder}
                        sx={{
                          color: '#1db954',
                          '&.Mui-checked': { color: '#1db954' },
                        }}
                      />
                    </ListItemIcon>
                    <ListItemIcon>
                      {isMusicFolder ? (
                        <MusicNoteIcon sx={{ color: '#1db954' }} />
                      ) : (
                        <FolderIcon sx={{ color: '#ff9800' }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {folder.name}
                          {isMusicFolder && (
                            <Chip 
                              label="Recommended" 
                              size="small" 
                              sx={{ bgcolor: '#1db954', fontSize: '0.7rem' }} 
                            />
                          )}
                        </Box>
                      }
                      secondary={`Folder ID: ${folder.id.substring(0, 15)}...`}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <FolderIcon sx={{ fontSize: 48, color: '#666', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? 'No folders found matching your search' : 'No folders found in your Google Drive'}
              </Typography>
            </Box>
          )}
        </List>

        {selectedFolderId && !useRootFolder && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#0a0a0a', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Selected:
            </Typography>
            <Typography variant="body2" sx={{ color: '#1db954', fontWeight: 'bold' }}>
              {selectedFolderName}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: '#b3b3b3' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!useRootFolder && !selectedFolderId}
          sx={{
            bgcolor: '#1db954',
            '&:hover': { bgcolor: '#1ed760' },
          }}
        >
          Select Folder
        </Button>
      </DialogActions>
    </Dialog>
  );
};
