import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  VpnKey as VpnKeyIcon,
  FolderOpen as FolderIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { credentialStorageService } from '../services/credentialStorage';
import type {
  GoogleCredentials,
  CredentialValidationResult,
} from '../services/credentialStorage';

interface CredentialSetupDialogProps {
  open: boolean;
  onClose: () => void;
  onCredentialsSaved: () => void;
  initialCredentials?: GoogleCredentials | null;
}

export const CredentialSetupDialog: React.FC<CredentialSetupDialogProps> = ({
  open,
  onClose,
  onCredentialsSaved,
  initialCredentials,
}) => {
  const [credentials, setCredentials] = useState<GoogleCredentials>({
    clientId: initialCredentials?.clientId || '',
    apiKey: initialCredentials?.apiKey || '',
    folderId: initialCredentials?.folderId || '',
  });

  const [validation, setValidation] = useState<CredentialValidationResult>({
    isValid: true,
    errors: [],
  });
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);

  // Get current origin for authorized origins setup
  const currentOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:5173';

  const validateForm = () => {
    const result = credentialStorageService.validateCredentials(credentials);
    setValidation(result);
    return result.isValid;
  };

  const handleInputChange =
    (field: keyof GoogleCredentials) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setCredentials(prev => ({ ...prev, [field]: value }));

      // Clear validation errors when user starts typing
      if (validation.errors.length > 0) {
        setValidation({ isValid: true, errors: [] });
      }
      setTestResult(null);
    };

  const handleTestCredentials = async () => {
    if (!validateForm()) {
      return;
    }

    setIsValidating(true);
    setTestResult(null);

    try {
      const result =
        await credentialStorageService.testCredentials(credentials);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      credentialStorageService.saveCredentials(credentials);
      onCredentialsSaved();
      onClose();
    } catch (error) {
      setValidation({
        isValid: false,
        errors: [
          error instanceof Error ? error.message : 'Failed to save credentials',
        ],
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setCredentials({
      clientId: initialCredentials?.clientId || '',
      apiKey: initialCredentials?.apiKey || '',
      folderId: initialCredentials?.folderId || '',
    });
    setValidation({ isValid: true, errors: [] });
    setTestResult(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { backgroundColor: '#1a1a1a', color: 'white' },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <VpnKeyIcon sx={{ color: '#1db954' }} />
        Google API Credentials Setup
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Configure your Google API credentials to access Google Drive music
            files.
          </Alert>

          {/* Validation Errors */}
          {!validation.isValid && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Please fix the following errors:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Test Result */}
          {testResult && (
            <Alert
              severity={testResult.success ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              {testResult.success
                ? 'Credentials appear to be valid!'
                : `Validation failed: ${testResult.error}`}
            </Alert>
          )}

          {/* Form Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Google OAuth Client ID *"
              value={credentials.clientId}
              onChange={handleInputChange('clientId')}
              placeholder="123456789-abcdef...xyz.apps.googleusercontent.com"
              fullWidth
              error={validation.errors.some(e => e.includes('Client ID'))}
              helperText="Required: Your Google OAuth 2.0 Client ID"
              InputProps={{
                sx: { backgroundColor: '#2a2a2a' },
              }}
            />

            <TextField
              label="Google API Key"
              value={credentials.apiKey}
              onChange={handleInputChange('apiKey')}
              placeholder="AIza..."
              fullWidth
              error={validation.errors.some(e => e.includes('API Key'))}
              helperText="Optional: API Key for enhanced functionality"
              InputProps={{
                sx: { backgroundColor: '#2a2a2a' },
              }}
            />

            <TextField
              label="Google Drive Folder ID"
              value={credentials.folderId}
              onChange={handleInputChange('folderId')}
              placeholder="1a2b3c4d5e6f..."
              fullWidth
              error={validation.errors.some(e => e.includes('Folder ID'))}
              helperText="Optional: Specific folder to scan for music (leave empty for root)"
              InputProps={{
                sx: { backgroundColor: '#2a2a2a' },
              }}
            />
          </Box>

          {/* Test Button */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={handleTestCredentials}
              disabled={isValidating || !credentials.clientId}
              startIcon={
                isValidating ? <CircularProgress size={16} /> : <CheckIcon />
              }
              sx={{
                borderColor: '#1db954',
                color: '#1db954',
                '&:hover': {
                  borderColor: '#1ed760',
                  backgroundColor: 'rgba(29, 185, 84, 0.08)',
                },
              }}
            >
              {isValidating ? 'Testing...' : 'Test Credentials'}
            </Button>
          </Box>
        </Box>

        {/* Setup Instructions */}
        <Accordion sx={{ backgroundColor: '#2a2a2a', mt: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: '#1db954' }} />}
          >
            <Typography sx={{ color: '#1db954' }}>
              📖 Setup Instructions
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Follow these steps to get your Google API credentials:
            </Typography>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Chip label="1" size="small" sx={{ bgcolor: '#1db954' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Create Google Cloud Project"
                  secondary={
                    <span>
                      Go to{' '}
                      <Link
                        href="https://console.cloud.google.com"
                        target="_blank"
                        sx={{ color: '#1db954' }}
                      >
                        Google Cloud Console
                      </Link>{' '}
                      and create a new project
                    </span>
                  }
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Chip label="2" size="small" sx={{ bgcolor: '#1db954' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Enable Google Drive API"
                  secondary="In APIs & Services > Library, search for and enable 'Google Drive API'"
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Chip label="3" size="small" sx={{ bgcolor: '#1db954' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Create OAuth 2.0 Credentials"
                  secondary="In Credentials, create OAuth 2.0 Client ID (Web application type)"
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Chip label="4" size="small" sx={{ bgcolor: '#1db954' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Configure Authorized Origins"
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ mb: 1, display: 'block' }}
                      >
                        ⚠️ <strong>Important:</strong> Add this exact origin to
                        your OAuth credentials:
                      </Typography>
                      <span
                        style={{
                          display: 'block',
                          padding: '8px',
                          backgroundColor: '#1a1a1a',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          fontSize: '0.85em',
                          color: '#1db954',
                          border: '1px solid #1db954',
                          margin: '8px 0',
                        }}
                      >
                        {currentOrigin}
                      </span>
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ mt: 1, display: 'block', color: '#b3b3b3' }}
                      >
                        In Google Cloud Console → Credentials → Your OAuth
                        Client → Authorized JavaScript origins
                      </Typography>
                    </>
                  }
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <FolderIcon sx={{ color: '#1db954' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Optional: Get Folder ID"
                  secondary="Open Google Drive folder in browser, copy ID from URL after '/folders/'"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} sx={{ color: '#b3b3b3' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!credentials.clientId || isSaving}
          sx={{
            bgcolor: '#1db954',
            '&:hover': { bgcolor: '#1ed760' },
          }}
        >
          {isSaving ? <CircularProgress size={20} /> : 'Save Credentials'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
