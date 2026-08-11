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
  const isAuthOriginError = error.includes('Authorization Origin Error');

  // Handle authorization origin errors separately
  if (isAuthOriginError) {
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>🔒 Authorization Origin Not Configured</AlertTitle>
          Your current URL is not authorized in your Google OAuth settings.
        </Alert>

        <Paper sx={{ p: 3, bgcolor: '#1a1a1a' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon />
            Quick Fix Instructions
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            The app cannot initialize because your Google OAuth Client ID doesn't include this website's URL in its authorized origins.
          </Typography>

          <Box sx={{ mt: 2, mb: 3, p: 2, bgcolor: '#0a0a0a', borderRadius: 1, border: '1px solid #a855f7' }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: '#a855f7' }}>
              ⚠️ Add this exact URL to your Google OAuth settings:
            </Typography>
            <Typography 
              variant="body1" 
              component="pre" 
              sx={{ 
                fontFamily: 'monospace', 
                color: '#a855f7',
                fontWeight: 'bold',
                fontSize: '1.1em',
                m: 0,
                p: 1
              }}
            >
              {currentOrigin}
            </Typography>
          </Box>

          <List dense>
            <ListItem>
              <ListItemIcon>
                <AssignmentIcon sx={{ color: '#a855f7' }} />
              </ListItemIcon>
              <ListItemText
                primary="1. Open Google Cloud Console"
                secondary={
                  <span>
                    Go to{' '}
                    <Link 
                      href="https://console.cloud.google.com/apis/credentials" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ color: '#a855f7' }}
                    >
                      Google Cloud Console → Credentials
                    </Link>
                  </span>
                }
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <VpnKeyIcon sx={{ color: '#a855f7' }} />
              </ListItemIcon>
              <ListItemText
                primary="2. Edit Your OAuth Client"
                secondary="Click on your OAuth 2.0 Client ID to edit it"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <SettingsIcon sx={{ color: '#a855f7' }} />
              </ListItemIcon>
              <ListItemText
                primary="3. Add Authorized JavaScript Origin"
                secondary={
                  <>
                    Under "Authorized JavaScript origins" section, click{' '}
                    <strong>+ ADD URI</strong> and paste the URL shown above
                  </>
                }
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <AssignmentIcon sx={{ color: '#a855f7' }} />
              </ListItemIcon>
              <ListItemText
                primary="4. Save and Wait"
                secondary="Click Save button. Changes may take 5-10 minutes to propagate."
              />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <AlertTitle>Why is this needed?</AlertTitle>
            Google OAuth requires you to explicitly authorize which websites can use your OAuth credentials. 
            This is a security feature to prevent unauthorized use of your API credentials.
          </Alert>

          <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ 
                bgcolor: '#a855f7',
                '&:hover': { bgcolor: '#c084fc' }
              }}
            >
              I've Added the Origin - Reload Page
            </Button>
            
            {onRetry && (
              <Button 
                variant="outlined" 
                onClick={onRetry}
                sx={{ 
                  borderColor: '#a855f7',
                  color: '#a855f7',
                  '&:hover': { borderColor: '#c084fc', backgroundColor: 'rgba(168, 85, 247, 0.08)' }
                }}
              >
                Retry
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    );
  }

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
        <Typography variant="h6" gutterBottom sx={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          Setup Instructions
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          To use this app, you need to create Google API credentials and configure environment variables:
        </Typography>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <AssignmentIcon sx={{ color: '#a855f7' }} />
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
                    sx={{ color: '#a855f7' }}
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
              <VpnKeyIcon sx={{ color: '#a855f7' }} />
            </ListItemIcon>
            <ListItemText
              primary="2. Enable APIs and Create Credentials"
              secondary="Enable the Google Drive API and create OAuth 2.0 credentials (Web application type)."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <SettingsIcon sx={{ color: '#a855f7' }} />
            </ListItemIcon>
            <ListItemText
              primary="3. Configure Environment Variables"
              secondary="Copy your Client ID to the .env file in the project root."
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
              bgcolor: '#a855f7',
              '&:hover': { bgcolor: '#c084fc' }
            }}
          >
            Configure Credentials
          </Button>
          
          {onRetry && (
            <Button 
              variant="outlined" 
              onClick={onRetry}
              sx={{ 
                borderColor: '#a855f7',
                color: '#a855f7',
                '&:hover': { borderColor: '#c084fc', backgroundColor: 'rgba(168, 85, 247, 0.08)' }
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