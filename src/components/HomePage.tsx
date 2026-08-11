import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Link,
  Avatar,
} from '@mui/material';
import {
  LibraryMusic as LibraryMusicIcon,
  CloudOff as OfflineIcon,
  Settings as SettingsIcon,
  Google as GoogleIcon,
  FolderOpen as FolderOpenIcon,
  MusicNote as MusicNoteIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SetupWizard } from './SetupWizard';
import { FolderSelectionDialog } from './FolderSelectionDialog';
import { credentialStorageService } from '../services/credentialStorage';

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const cardGradients = [
  'linear-gradient(135deg, #7c3aed 0%, #a855f7 60%, #d8b4fe 100%)',
  'linear-gradient(135deg, #9333ea 0%, #6d28d9 100%)',
  'linear-gradient(135deg, #581c87 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #4c1d95 0%, #9333ea 100%)',
];

interface QuickCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
  onClick: () => void;
}

const QuickCard: React.FC<QuickCardProps> = ({ icon, title, subtitle, gradient, onClick }) => (
  <Box
    component="button"
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      width: '100%',
      p: 0,
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      bgcolor: '#181818',
      color: 'white',
      borderRadius: 1.5,
      overflow: 'hidden',
      transition: 'background-color 0.2s ease, transform 0.2s ease',
      '&:hover': {
        bgcolor: '#282828',
        transform: 'translateY(-2px)',
      },
    }}
  >
    <Box
      sx={{
        width: 64,
        height: 64,
        flexShrink: 0,
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0, pr: 1 }}>
      <Typography
        variant="body1"
        sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {title}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: '#b3b3b3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {subtitle}
      </Typography>
    </Box>
  </Box>
);

export const HomePage: React.FC = () => {
  const { isAuthenticated, isLoading, signIn, error, user } = useAuth();
  const navigate = useNavigate();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [folderSelectionOpen, setFolderSelectionOpen] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('');

  useEffect(() => {
    // Configured = user-provided override or the app's built-in Client ID
    const isConfigured = credentialStorageService.isConfigured();
    setHasCredentials(isConfigured);

    // Load selected folder
    const folder = credentialStorageService.loadFolder();
    setSelectedFolder(folder?.folderId || '');

    // Auto-open the setup wizard on first run
    if (!isConfigured) {
      setTimeout(() => setWizardOpen(true), 500);
    }
  }, []);

  // Show folder selection after successful sign in if no folder is selected
  useEffect(() => {
    if (isAuthenticated && !selectedFolder && hasCredentials && !wizardOpen) {
      setTimeout(() => setFolderSelectionOpen(true), 500);
    }
  }, [isAuthenticated, selectedFolder, hasCredentials, wizardOpen]);

  const handleWizardComplete = () => {
    setWizardOpen(false);
    setHasCredentials(true);
    navigate('/songs');
  };

  const handleSetupCredentials = () => {
    setWizardOpen(true);
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
        <CircularProgress size={60} sx={{ color: '#a855f7' }} />
      </Container>
    );
  }

  const greeting = getGreeting();

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      {/* Authorization Error Alert */}
      {error && error.includes('Authorization Origin Error') && (
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>🔒 Authorization Origin Not Configured</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Your current URL{' '}
            <code
              style={{
                backgroundColor: '#2a2a2a',
                padding: '2px 6px',
                borderRadius: '4px',
                color: '#a855f7',
              }}
            >
              {window.location.origin}
            </code>{' '}
            is not authorized in your Google OAuth settings.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            To fix this:
          </Typography>
          <Box component="ol" sx={{ pl: 3, mb: 2, fontSize: '0.875rem' }}>
            <li>
              Go to{' '}
              <Link
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                sx={{ color: '#a855f7' }}
              >
                Google Cloud Console Credentials
              </Link>
            </li>
            <li>Click on your OAuth 2.0 Client ID</li>
            <li>Under &quot;Authorized JavaScript origins&quot;, click + ADD URI</li>
            <li>
              Add this exact URL:{' '}
              <code
                style={{
                  backgroundColor: '#2a2a2a',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  color: '#a855f7',
                  fontWeight: 'bold',
                }}
              >
                {window.location.origin}
              </code>
            </li>
            <li>Click Save and wait 5-10 minutes for changes to take effect</li>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSetupCredentials}
              sx={{ borderColor: '#a855f7', color: '#a855f7' }}
            >
              View Setup Instructions
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => window.location.reload()}
              sx={{ bgcolor: '#a855f7', '&:hover': { bgcolor: '#c084fc' } }}
            >
              I've Added the Origin - Reload
            </Button>
          </Box>
        </Alert>
      )}

      {/* Greeting */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(90deg, #ffffff 0%, #c084fc 100%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {isAuthenticated && user?.name ? `${greeting}, ${user.name.split(' ')[0]}` : greeting}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {isAuthenticated
              ? 'Stream and download your own music from Google Drive.'
              : 'Sign in to bring your Google Drive music here.'}
          </Typography>
        </Box>

        {isAuthenticated && user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={user.picture} sx={{ width: 40, height: 40 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* CTA */}
      <Box sx={{ mb: 5 }}>
        {!hasCredentials ? (
          <Button
            variant="contained"
            size="large"
            onClick={handleSetupCredentials}
            startIcon={<SettingsIcon />}
            sx={{
              bgcolor: '#a855f7',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              borderRadius: '50px',
              '&:hover': { bgcolor: '#c084fc' },
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
              bgcolor: '#a855f7',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              borderRadius: '50px',
              '&:hover': { bgcolor: '#c084fc' },
            }}
          >
            Sign In with Google
          </Button>
        ) : (
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/songs"
            startIcon={<LibraryMusicIcon />}
            sx={{
              bgcolor: '#a855f7',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              borderRadius: '50px',
              '&:hover': { bgcolor: '#c084fc' },
            }}
          >
            Browse Your Music
          </Button>
        )}
      </Box>

      {/* Quick access cards */}
      <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 2 }}>
        Quick access
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <QuickCard
            icon={<LibraryMusicIcon sx={{ fontSize: 32, color: 'white' }} />}
            title="Your Music"
            subtitle="Songs from your Drive"
            gradient={cardGradients[0]}
            onClick={() => navigate('/songs')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <QuickCard
            icon={<FolderOpenIcon sx={{ fontSize: 32, color: 'white' }} />}
            title="Music Folder"
            subtitle={selectedFolder ? 'Change your folder' : 'Pick your folder'}
            gradient={cardGradients[1]}
            onClick={() => setFolderSelectionOpen(true)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <QuickCard
            icon={<OfflineIcon sx={{ fontSize: 32, color: 'white' }} />}
            title="Offline"
            subtitle="Downloaded songs"
            gradient={cardGradients[2]}
            onClick={() => navigate('/settings')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <QuickCard
            icon={<SettingsIcon sx={{ fontSize: 32, color: 'white' }} />}
            title="Settings"
            subtitle="Account & storage"
            gradient={cardGradients[3]}
            onClick={() => navigate('/settings')}
          />
        </Grid>
      </Grid>

      {/* Getting started panel */}
      <Box
        sx={{
          bgcolor: '#181818',
          borderRadius: 2,
          p: 4,
          mt: 3,
          border: '1px solid #282828',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <MusicNoteIcon sx={{ color: '#a855f7' }} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
            {isAuthenticated ? 'All set up' : 'How it works'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          {isAuthenticated
            ? 'Your Google Drive is connected. Visit Your Music to stream and download songs, or change which folder is scanned.'
            : 'Bring your own Google Drive folder. Sign in, pick a folder, and the app scans it for music — nothing is uploaded, and your files stay yours.'}
        </Typography>
        {!isAuthenticated && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={signIn}
              startIcon={<GoogleIcon />}
              sx={{
                borderColor: '#a855f7',
                color: '#a855f7',
                borderRadius: '50px',
                '&:hover': {
                  borderColor: '#c084fc',
                  color: '#c084fc',
                  backgroundColor: 'rgba(168, 85, 247, 0.08)',
                },
              }}
            >
              Sign In with Google
            </Button>
            <Button
              variant="outlined"
              onClick={handleSetupCredentials}
              sx={{
                borderColor: '#4a4a4a',
                color: '#b3b3b3',
                borderRadius: '50px',
                '&:hover': { borderColor: '#a855f7', color: '#a855f7' },
              }}
            >
              Setup Instructions
            </Button>
          </Box>
        )}
      </Box>

      {/* Setup Wizard */}
      <SetupWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={handleWizardComplete}
      />

      {/* Folder Selection Dialog */}
      <FolderSelectionDialog
        open={folderSelectionOpen}
        onClose={() => setFolderSelectionOpen(false)}
        onFolderSelected={handleFolderSelected}
        currentFolderId={selectedFolder}
      />
    </Container>
  );
};
