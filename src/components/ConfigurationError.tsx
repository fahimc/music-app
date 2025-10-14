import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  Button,
  Link,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Assignment as AssignmentIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import { CredentialSetupDialog } from './CredentialSetupDialog';

interface ConfigurationErrorProps {
  error: string;
  onRetry?: () => void;
}

export const ConfigurationError: React.FC<ConfigurationErrorProps> = ({ 
  error, 
  onRetry 
}) => {
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const isConfigurationError = error.includes('configuration') || error.includes('environment');

  if (!isConfigurationError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <AlertTitle>Authentication Error</AlertTitle>
        {error}
        {onRetry && (
          <Button variant="outlined" size="small" onClick={onRetry} sx={{ mt: 1 }}>
            Retry
          </Button>
        )}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Alert severity="warning" sx={{ mb: 3 }}>
        <AlertTitle>Google API Configuration Required</AlertTitle>
        The app needs Google API credentials to access your Google Drive music files.
      </Alert>

      <Paper sx={{ p: 3, bgcolor: '#1a1a1a' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#1db954', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          Setup Instructions
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          To use this app, you need to create Google API credentials and configure environment variables:
        </Typography>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <AssignmentIcon sx={{ color: '#1db954' }} />
            </ListItemIcon>
            <ListItemText
              primary="1. Create Google Cloud Project"
              secondary={
                <span>
                  Go to{' '}
                  <Link 
                    href="https://console.cloud.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ color: '#1db954' }}
                  >
                    Google Cloud Console
                  </Link>
                  {' '}and create a new project or select an existing one.
                </span>
              }
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <VpnKeyIcon sx={{ color: '#1db954' }} />
            </ListItemIcon>
            <ListItemText
              primary="2. Enable APIs and Create Credentials"
              secondary="Enable the Google Drive API and create OAuth 2.0 credentials (Web application type)."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <SettingsIcon sx={{ color: '#1db954' }} />
            </ListItemIcon>
            <ListItemText
              primary="3. Configure Environment Variables"
              secondary="Copy your Client ID and API Key to the .env file in the project root."
            />
          </ListItem>
        </List>

        <Box sx={{ mt: 3, p: 2, bgcolor: '#0a0a0a', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Required Environment Variables (.env file):
          </Typography>
          <Typography 
            variant="body2" 
            component="pre" 
            sx={{ 
              fontFamily: 'monospace', 
              color: '#b3b3b3',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5
            }}
          >
{`VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_API_KEY=your_api_key_here
VITE_GOOGLE_DRIVE_FOLDER_ID=optional_folder_id`}
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <AlertTitle>Development Mode</AlertTitle>
          You can still explore the app interface without Google API credentials. 
          The authentication features will be disabled until properly configured.
        </Alert>

        <Box sx={{ mt: 2, textAlign: 'center', display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => setSetupDialogOpen(true)}
            sx={{ 
              bgcolor: '#1db954',
              '&:hover': { bgcolor: '#1ed760' }
            }}
          >
            Configure Credentials
          </Button>
          
          {onRetry && (
            <Button 
              variant="outlined" 
              onClick={onRetry}
              sx={{ 
                borderColor: '#1db954',
                color: '#1db954',
                '&:hover': { borderColor: '#1ed760', backgroundColor: 'rgba(29, 185, 84, 0.08)' }
              }}
            >
              Retry
            </Button>
          )}
        </Box>
      </Paper>

      <CredentialSetupDialog
        open={setupDialogOpen}
        onClose={() => setSetupDialogOpen(false)}
        onCredentialsSaved={() => {
          setSetupDialogOpen(false);
          if (onRetry) onRetry();
        }}
      />
    </Box>
  );
};