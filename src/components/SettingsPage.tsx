import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudDone as CloudIcon,
  Storage as StorageIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  FolderOpen as FolderIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { FolderSelectionDialog } from './FolderSelectionDialog';
import { LocalFolderManager } from './LocalFolderManager';
import { credentialStorageService } from '../services/credentialStorage';
import { offlineStorageService } from '../services/offlineStorage';

export const SettingsPage: React.FC = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const [isConfigured, setIsConfigured] = useState(false);
  const [folder, setFolder] = useState<{ folderId?: string; folderName?: string } | null>(null);
  const [folderSelectionOpen, setFolderSelectionOpen] = useState(false);
  const [storageStats, setStorageStats] = useState<{
    totalSongs: number;
    totalSize: number;
    lastUpdated: Date;
  } | null>(null);
  const [clearStorageDialogOpen, setClearStorageDialogOpen] = useState(false);

  // Load credentials and storage stats on component mount
  useEffect(() => {
    loadCredentials();
    loadStorageStats();
  }, []);

  const loadCredentials = () => {
    setFolder(credentialStorageService.loadFolder());
    setIsConfigured(credentialStorageService.isConfigured());
  };

  const loadStorageStats = async () => {
    try {
      const stats = await offlineStorageService.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error loading storage stats:', error);
    }
  };

  const handleFolderSelected = (folderId: string, folderName: string) => {
    console.log(`Selected folder: ${folderName} (${folderId || 'root'})`);
    loadCredentials(); // Reload to show updated folder
  };

  const handleClearStorage = async () => {
    try {
      await offlineStorageService.clearAllSongs();
      await loadStorageStats();
      setClearStorageDialogOpen(false);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      {/* Google Drive Folder Section */}
      {isAuthenticated && isConfigured && (
        <Card sx={{ mb: 3, backgroundColor: '#181818' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FolderIcon sx={{ color: '#a855f7' }} />
              Google Drive Music Folder
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select which Google Drive folder contains your music files. 
              The app will scan this folder for audio files.
            </Typography>

            {folder?.folderId ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Music folder is configured
                  </Typography>
                </Alert>

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <FolderIcon sx={{ color: '#a855f7' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Selected Folder"
                      secondary={folder.folderName || folder.folderId}
                    />
                  </ListItem>
                </List>

                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setFolderSelectionOpen(true)}
                  sx={{ borderColor: '#a855f7', color: '#a855f7' }}
                >
                  Change Folder
                </Button>
              </Box>
            ) : (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    No specific folder selected. The app will scan your entire Google Drive for music files.
                  </Typography>
                </Alert>

                <Button
                  variant="contained"
                  startIcon={<FolderIcon />}
                  onClick={() => setFolderSelectionOpen(true)}
                  sx={{ bgcolor: '#a855f7', '&:hover': { bgcolor: '#c084fc' } }}
                >
                  Select Music Folder
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Local Folder Management */}
      <Card sx={{ mb: 3, backgroundColor: '#181818' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorageIcon sx={{ color: '#ff9800' }} />
            Local Music Folders
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Access music files directly from your computer using the File System Access API.
          </Typography>
          <LocalFolderManager />
        </CardContent>
      </Card>

      {/* Account Information */}
      {isAuthenticated && user && (
        <Card sx={{ mb: 3, backgroundColor: '#181818' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudIcon sx={{ color: '#a855f7' }} />
              Google Account
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <img 
                src={user.picture} 
                alt={user.name}
                style={{ width: 48, height: 48, borderRadius: '50%' }}
              />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Chip label="Connected" color="success" size="small" />
            </Box>

            <Button
              variant="outlined"
              color="error"
              onClick={signOut}
              startIcon={<DeleteIcon />}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Offline Storage Management */}
      <Card sx={{ mb: 3, backgroundColor: '#181818' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorageIcon sx={{ color: '#a855f7' }} />
              Offline Storage
            </Typography>
            <IconButton onClick={loadStorageStats} sx={{ color: '#a855f7' }}>
              <RefreshIcon />
            </IconButton>
          </Box>

          {storageStats ? (
            <Box>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Chip 
                  label={`${storageStats.totalSongs} songs`} 
                  sx={{ bgcolor: '#a855f7', color: 'white' }} 
                />
                <Chip 
                  label={formatFileSize(storageStats.totalSize)} 
                  variant="outlined"
                  sx={{ borderColor: '#a855f7', color: '#a855f7' }} 
                />
              </Stack>

              {storageStats.totalSongs > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Last updated: {storageStats.lastUpdated.toLocaleDateString()}
                </Typography>
              )}

              {storageStats.totalSongs > 0 ? (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setClearStorageDialogOpen(true)}
                >
                  Clear All Offline Songs
                </Button>
              ) : (
                <Alert severity="info">
                  <Typography variant="body2">
                    No songs downloaded for offline listening. Download songs from your music library to play them offline.
                  </Typography>
                </Alert>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Loading storage information...
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* App Information */}
      <Card sx={{ backgroundColor: '#181818' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon sx={{ color: '#a855f7' }} />
            App Information
          </Typography>

          <List dense>
            <ListItem>
              <ListItemText
                primary="Version"
                secondary="1.1.0"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Storage Location"
                secondary="Browser Local Storage & IndexedDB"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Supported Audio Formats"
                secondary="MP3, WAV, OGG, AAC, FLAC, M4A"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Folder Selection Dialog */}
      <FolderSelectionDialog
        open={folderSelectionOpen}
        onClose={() => setFolderSelectionOpen(false)}
        onFolderSelected={handleFolderSelected}
        currentFolderId={folder?.folderId}
      />

      {/* Clear Storage Confirmation Dialog */}
      <Dialog
        open={clearStorageDialogOpen}
        onClose={() => setClearStorageDialogOpen(false)}
        PaperProps={{ sx: { backgroundColor: '#1a1a1a' } }}
      >
        <DialogTitle>Clear Offline Storage</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently delete all downloaded songs from your device. 
            You can re-download them later from your Google Drive.
          </Typography>
          <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
            {storageStats && `${storageStats.totalSongs} songs (${formatFileSize(storageStats.totalSize)}) will be deleted.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearStorageDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleClearStorage} color="error" variant="contained">
            Clear Storage
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};