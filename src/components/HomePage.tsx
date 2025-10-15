import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Link,
} from '@mui/material';
import {
  CloudDownload as CloudDownloadIcon,
  MusicNote as MusicNoteIcon,
  CloudOff as OfflineIcon,
  Google as GoogleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { CredentialSetupDialog } from './CredentialSetupDialog';
import { FolderSelectionDialog } from './FolderSelectionDialog';
import { credentialStorageService } from '../services/credentialStorage';

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
      },
    }}
  >
    <CardContent
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Box sx={{ color: '#1db954', mb: 2 }}>{icon}</Box>
      <Typography variant="h6" component="h3" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

export const HomePage: React.FC = () => {
  const { isAuthenticated, isLoading, signIn, reinitialize, error } = useAuth();
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [folderSelectionOpen, setFolderSelectionOpen] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('');

  useEffect(() => {
    // Check if credentials are available
    const hasStoredCredentials = credentialStorageService.hasCredentials();
    setHasCredentials(hasStoredCredentials);
    
    // Load selected folder
    const credentials = credentialStorageService.loadCredentials();
    setSelectedFolder(credentials?.folderId || '');
    
    // Auto-open setup dialog if no credentials are stored (first time user)
    if (!hasStoredCredentials) {
      // Small delay to let the page render first
      setTimeout(() => setSetupDialogOpen(true), 500);
    }
  }, []);

  // Show folder selection after successful sign in if no folder is selected
  useEffect(() => {
    if (isAuthenticated && !selectedFolder && hasCredentials) {
      setTimeout(() => setFolderSelectionOpen(true), 500);
    }
  }, [isAuthenticated, selectedFolder, hasCredentials]);

  const handleCredentialsSaved = async () => {
    setSetupDialogOpen(false);
    setHasCredentials(true);
    // Reinitialize auth with new credentials
    await reinitialize();
  };

  const handleSetupCredentials = () => {
    setSetupDialogOpen(true);
  };

  const handleFolderSelected = (folderId: string, folderName: string) => {
    setSelectedFolder(folderId);
    console.log(`Selected folder: ${folderName} (${folderId || 'root'})`);
  };

  if (isLoading) {
    return (
      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress size={60} sx={{ color: '#1db954' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Authorization Error Alert */}
      {error && error.includes('Authorization Origin Error') && (
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>🔒 Authorization Origin Not Configured</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Your current URL <code style={{ 
              backgroundColor: '#2a2a2a', 
              padding: '2px 6px', 
              borderRadius: '4px',
              color: '#1db954'
            }}>{window.location.origin}</code> is not authorized in your Google OAuth settings.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            To fix this:
          </Typography>
          <Box component="ol" sx={{ pl: 3, mb: 2, fontSize: '0.875rem' }}>
            <li>Go to <Link href="https://console.cloud.google.com/apis/credentials" target="_blank" sx={{ color: '#1db954' }}>Google Cloud Console Credentials</Link></li>
            <li>Click on your OAuth 2.0 Client ID</li>
            <li>Under "Authorized JavaScript origins", click <strong>+ ADD URI</strong></li>
            <li>Add this exact URL: <code style={{ 
              backgroundColor: '#2a2a2a', 
              padding: '2px 6px', 
              borderRadius: '4px',
              color: '#1db954',
              fontWeight: 'bold'
            }}>{window.location.origin}</code></li>
            <li>Click <strong>Save</strong> and wait 5-10 minutes for changes to take effect</li>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSetupCredentials}
              sx={{ borderColor: '#1db954', color: '#1db954' }}
            >
              View Setup Instructions
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => window.location.reload()}
              sx={{ bgcolor: '#1db954', '&:hover': { bgcolor: '#1ed760' } }}
            >
              I've Added the Origin - Reload
            </Button>
          </Box>
        </Alert>
      )}

      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 8,
          py: 6,
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #1db954, #1ed760)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Your Music, Everywhere
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          paragraph
          sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
        >
          Stream and download your music from Google Drive. 
          Enjoy your favorite songs online or offline, anytime, anywhere.
        </Typography>

        {/* Show different buttons based on credential and auth status */}
        {!hasCredentials ? (
          <Button
            variant="contained"
            size="large"
            onClick={handleSetupCredentials}
            startIcon={<SettingsIcon />}
            sx={{
              bgcolor: '#1db954',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                bgcolor: '#1ed760',
              },
            }}
          >
            Set Up Google Drive Access
          </Button>
        ) : !isAuthenticated ? (
          <Button
            variant="contained"
            size="large"
            onClick={signIn}
            startIcon={<GoogleIcon />}
            sx={{
              bgcolor: '#1db954',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                bgcolor: '#1ed760',
              },
            }}
          >
            Sign In with Google
          </Button>
        ) : (
          <Button
            variant="contained"
            size="large"
            href="/songs"
            sx={{
              bgcolor: '#1db954',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                bgcolor: '#1ed760',
              },
            }}
          >
            Browse Your Music
          </Button>
        )}
      </Box>

      {/* Features Section */}
      <Typography
        variant="h4"
        component="h2"
        textAlign="center"
        gutterBottom
        sx={{ mb: 4 }}
      >
        Why Choose MusicApp?
      </Typography>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <FeatureCard
            icon={<CloudDownloadIcon sx={{ fontSize: 48 }} />}
            title="Google Drive Integration"
            description="Connect to your Google Drive and access your music library directly from the cloud. No need to upload files separately."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FeatureCard
            icon={<OfflineIcon sx={{ fontSize: 48 }} />}
            title="Offline Listening"
            description="Download your favorite songs for offline listening. Perfect for commutes, flights, or areas with poor connectivity."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FeatureCard
            icon={<MusicNoteIcon sx={{ fontSize: 48 }} />}
            title="Rich Music Player"
            description="Full-featured audio player with playlist support, shuffle, repeat, and all the controls you expect from a modern music app."
          />
        </Grid>
      </Grid>

      {/* Getting Started Section */}
      {!isAuthenticated && (
        <Box
          sx={{
            textAlign: 'center',
            bgcolor: '#181818',
            borderRadius: 2,
            p: 4,
            mt: 6,
          }}
        >
          <Typography variant="h5" component="h3" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {!hasCredentials 
              ? "First, set up your Google API credentials to connect your Drive."
              : "Sign in with your Google account to connect your Drive and start listening to your music."
            }
          </Typography>
          {!hasCredentials ? (
            <Button
              variant="outlined"
              size="large"
              onClick={handleSetupCredentials}
              startIcon={<SettingsIcon />}
              sx={{
                borderColor: '#1db954',
                color: '#1db954',
                px: 3,
                '&:hover': {
                  borderColor: '#1ed760',
                  color: '#1ed760',
                  backgroundColor: 'rgba(29, 185, 84, 0.08)',
                },
              }}
            >
              Configure API Access
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="large"
              onClick={signIn}
              startIcon={<GoogleIcon />}
              sx={{
                borderColor: '#1db954',
                color: '#1db954',
                px: 3,
                '&:hover': {
                  borderColor: '#1ed760',
                  color: '#1ed760',
                  backgroundColor: 'rgba(29, 185, 84, 0.08)',
                },
              }}
            >
              Sign In with Google
            </Button>
          )}
        </Box>
      )}

      {/* Credential Setup Dialog */}
      <CredentialSetupDialog
        open={setupDialogOpen}
        onClose={() => setSetupDialogOpen(false)}
        onCredentialsSaved={handleCredentialsSaved}
      />

      {/* Folder Selection Dialog */}
      <FolderSelectionDialog
        open={folderSelectionOpen}
        onClose={() => setFolderSelectionOpen(false)}
        onFolderSelected={handleFolderSelected}
        currentFolderId={selectedFolder}
      />

      {/* App Status for Authenticated Users */}
      {isAuthenticated && (
        <Box
          sx={{
            textAlign: 'center',
            bgcolor: '#181818',
            borderRadius: 2,
            p: 4,
            mt: 6,
          }}
        >
          <Typography variant="h5" component="h3" gutterBottom color="#1db954">
            Welcome Back!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You're all set up. Visit your music library to start streaming and downloading songs.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              href="/songs"
              sx={{
                bgcolor: '#1db954',
                '&:hover': { bgcolor: '#1ed760' },
              }}
            >
              View Your Music
            </Button>
            <Button
              variant="outlined"
              href="/settings"
              sx={{
                borderColor: '#1db954',
                color: '#1db954',
                '&:hover': {
                  borderColor: '#1ed760',
                  color: '#1ed760',
                  backgroundColor: 'rgba(29, 185, 84, 0.08)',
                },
              }}
            >
              Manage Settings
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};