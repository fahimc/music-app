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
  VpnKey as VpnKeyIcon,
  CloudDone as CloudIcon,
  Storage as StorageIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  FolderOpen as FolderIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { CredentialSetupDialog } from './CredentialSetupDialog';
import { FolderSelectionDialog } from './FolderSelectionDialog';
import { LocalFolderManager } from './LocalFolderManager';
import { credentialStorageService } from '../services/credentialStorage';
import { offlineStorageService } from '../services/offlineStorage';
import type { GoogleCredentials } from '../services/credentialStorage';

export const SettingsPage: React.FC = () => {
  const { user, isAuthenticated, signOut, reinitialize } = useAuth();
  const [credentials, setCredentials] = useState<GoogleCredentials | null>(null);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
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
    const stored = credentialStorageService.loadCredentials();
    setCredentials(stored);
  };

  const loadStorageStats = async () => {
    try {
      const stats = await offlineStorageService.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error loading storage stats:', error);
    }
  };

  const handleCredentialsSaved = async () => {
    loadCredentials();
    // Reinitialize auth with new credentials
    await reinitialize();
  };

  const handleFolderSelected = (folderId: string, folderName: string) => {
    console.log(`Selected folder: ${folderName} (${folderId || 'root'})`);
    loadCredentials(); // Reload to show updated folder
  };

  const handleClearCredentials = () => {
    credentialStorageService.clearCredentials();
    setCredentials(null);
    // This will trigger a re-render and show the configuration error
    window.location.reload();
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

      {/* Google API Credentials Section */}
      <Card sx={{ mb: 3, backgroundColor: '#181818' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VpnKeyIcon sx={{ color: '#1db954' }} />
            Google API Credentials
          </Typography>

          {credentials ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Credentials are configured and ready to use.
                </Typography>
              </Alert>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <VpnKeyIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Client ID"
                    secondary={`${credentials.clientId.substring(0, 20)}...`}
                  />
                </ListItem>
                
                {credentials.apiKey && (
                  <ListItem>
                    <ListItemIcon>
                      <VpnKeyIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="API Key"
                      secondary="Configured"
                    />
                  </ListItem>
                )}
                
                {credentials.folderId && (
                  <ListItem>
                    <ListItemIcon>
                      <CloudIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Drive Folder ID"
                      secondary={credentials.folderId}
                    />
                  </ListItem>
                )}
              </List>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setSetupDialogOpen(true)}
                  sx={{ borderColor: '#1db954', color: '#1db954' }}
                >
                  Edit Credentials
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleClearCredentials}
                >
                  Clear Credentials
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  No Google API credentials configured. Set up credentials to access your Google Drive music.
                </Typography>
              </Alert>

              <Button
                variant="contained"
                startIcon={<VpnKeyIcon />}
                onClick={() => setSetupDialogOpen(true)}
                sx={{ bgcolor: '#1db954', '&:hover': { bgcolor: '#1ed760' } }}
              >
                Configure Credentials
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Google Drive Folder Section */}
      {isAuthenticated && credentials && (
        <Card sx={{ mb: 3, backgroundColor: '#181818' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FolderIcon sx={{ color: '#1db954' }} />
              Google Drive Music Folder
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select which Google Drive folder contains your music files. 
              The app will scan this folder for audio files.
            </Typography>

            {credentials.folderId ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Music folder is configured
                  </Typography>
                </Alert>

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <FolderIcon sx={{ color: '#1db954' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Selected Folder"
                      secondary={credentials.folderId === '' ? 'My Drive (Root)' : credentials.folderId}
                    />
                  </ListItem>
                </List>

                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setFolderSelectionOpen(true)}
                  sx={{ borderColor: '#1db954', color: '#1db954' }}
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
                  sx={{ bgcolor: '#1db954', '&:hover': { bgcolor: '#1ed760' } }}
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
              <CloudIcon sx={{ color: '#1db954' }} />
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
              <StorageIcon sx={{ color: '#1db954' }} />
              Offline Storage
            </Typography>
            <IconButton onClick={loadStorageStats} sx={{ color: '#1db954' }}>
              <RefreshIcon />
            </IconButton>
          </Box>

          {storageStats ? (
            <Box>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Chip 
                  label={`${storageStats.totalSongs} songs`} 
                  sx={{ bgcolor: '#1db954', color: 'white' }} 
                />
                <Chip 
                  label={formatFileSize(storageStats.totalSize)} 
                  variant="outlined"
                  sx={{ borderColor: '#1db954', color: '#1db954' }} 
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
            <InfoIcon sx={{ color: '#1db954' }} />
            App Information
          </Typography>

          <List dense>
            <ListItem>
              <ListItemText
                primary="Version"
                secondary="1.0.0-beta"
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

      {/* Credential Setup Dialog */}
      <CredentialSetupDialog
        open={setupDialogOpen}
        onClose={() => setSetupDialogOpen(false)}
        onCredentialsSaved={handleCredentialsSaved}
        initialCredentials={credentials}
      />

      {/* Folder Selection Dialog */}
      <FolderSelectionDialog
        open={folderSelectionOpen}
        onClose={() => setFolderSelectionOpen(false)}
        onFolderSelected={handleFolderSelected}
        currentFolderId={credentials?.folderId}
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