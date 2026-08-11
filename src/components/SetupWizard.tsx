import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Link,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  VpnKey as VpnKeyIcon,
  Google as GoogleIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  FolderOpen as FolderIcon,
  HelpOutline as HelpIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { credentialStorageService } from '../services/credentialStorage';
import { FolderPicker } from './FolderPicker';

interface SetupWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type StepKey = 'clientid' | 'origin' | 'signin' | 'folder';

interface WizardStep {
  key: StepKey;
  label: string;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  const { isAuthenticated, user, signIn, isLoading, reinitialize, error: authError } = useAuth();

  // 'central': the app ships with a built-in Client ID, users just sign in.
  // 'selfhost': no built-in Client ID, the user pastes their own.
  const [setupMode, setSetupMode] = useState<'central' | 'selfhost'>('central');
  const [steps, setSteps] = useState<WizardStep[]>([
    { key: 'signin', label: 'Sign in with Google' },
    { key: 'folder', label: 'Choose your music folder' },
  ]);
  const [activeStep, setActiveStep] = useState(0);
  const [clientId, setClientId] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [folder, setFolder] = useState<{ id: string; name: string }>({
    id: '',
    name: 'My Drive (Root)',
  });
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  // Reset wizard state each time it opens
  useEffect(() => {
    if (open) {
      const creds = credentialStorageService.loadCredentials();
      const savedFolder = credentialStorageService.loadFolder();
      const hasClientId = credentialStorageService.isConfigured();
      const hasStored = Boolean(creds?.clientId);
      setClientId(creds?.clientId || '');
      setFolder({
        id: savedFolder?.folderId || '',
        name: savedFolder?.folderName || 'My Drive (Root)',
      });

      if (hasClientId) {
        // Central mode (or an existing override): skip straight to sign-in.
        setSetupMode('central');
        setSteps([
          { key: 'signin', label: 'Sign in with Google' },
          { key: 'folder', label: 'Choose your music folder' },
        ]);
        setActiveStep(0);
      } else {
        // Self-host mode: full Client ID flow. With stored creds, jump past
        // the paste step to the origin check.
        setSetupMode('selfhost');
        setSteps([
          { key: 'clientid', label: 'Connect Google' },
          { key: 'origin', label: 'Authorize this site' },
          { key: 'signin', label: 'Sign in with Google' },
          { key: 'folder', label: 'Choose your music folder' },
        ]);
        setActiveStep(hasStored ? 1 : 0);
      }

      setValidationErrors([]);
      setCopied(false);
    }
  }, [open]);

  const handleSaveCredentials = async () => {
    const result = credentialStorageService.validateCredentials({ clientId });
    if (!result.isValid) {
      setValidationErrors(result.errors);
      return;
    }
    setValidationErrors([]);
    setIsSaving(true);
    try {
      // Preserve any existing optional fields (e.g. folder) when re-saving
      const existing = credentialStorageService.loadCredentials();
      credentialStorageService.saveCredentials({
        ...existing,
        clientId: clientId.trim(),
      });
      await reinitialize();
      setActiveStep(1);
    } catch (err) {
      setValidationErrors([
        err instanceof Error ? err.message : 'Failed to save credentials',
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (err) {
      console.error('Sign in error during setup:', err);
    }
  };

  const handleCopyOrigin = async () => {
    try {
      await navigator.clipboard.writeText(currentOrigin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy origin:', err);
    }
  };

  const handleFinish = () => {
    credentialStorageService.saveFolder(folder.id, folder.name);
    onComplete();
  };

  const currentKey = steps[activeStep]?.key;

  const renderStepContent = (key: StepKey) => {
    switch (key) {
      case 'clientid':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" icon={<VpnKeyIcon />}>
              Paste your Google OAuth Client ID to connect your Drive.
            </Alert>

            {validationErrors.length > 0 && (
              <Alert severity="error">
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </Alert>
            )}

            <TextField
              label="Google OAuth Client ID *"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setValidationErrors([]);
              }}
              placeholder="123456789-abcdef...xyz.apps.googleusercontent.com"
              fullWidth
              InputProps={{ sx: { backgroundColor: '#2a2a2a' } }}
              helperText="It ends in .apps.googleusercontent.com"
            />

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1,
              }}
            >
              <Button
                component="a"
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                startIcon={<GoogleIcon />}
                sx={{
                  borderColor: '#a855f7',
                  color: '#a855f7',
                  '&:hover': { borderColor: '#c084fc' },
                }}
              >
                Get a Client ID from Google
              </Button>
              <Button
                variant="outlined"
                startIcon={<HelpIcon />}
                onClick={() => setShowInstructions(true)}
                sx={{
                  borderColor: '#4a4a4a',
                  color: '#b3b3b3',
                  '&:hover': { borderColor: '#a855f7', color: '#a855f7' },
                }}
              >
                Step-by-step instructions
              </Button>
            </Box>
          </Box>
        );

      case 'origin':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="warning">
              Add this exact URL to your OAuth Client's{' '}
              <strong>Authorized JavaScript origins</strong> in Google
              Cloud Console, then wait a few minutes.
            </Alert>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  width: { xs: '100%', sm: 'auto' },
                  overflow: 'hidden',
                  p: 1.5,
                  bgcolor: '#0a0a0a',
                  borderRadius: 1,
                  border: '1px solid #a855f7',
                }}
              >
                <Typography
                  variant="body1"
                  component="code"
                  sx={{
                    fontFamily: 'monospace',
                    color: '#a855f7',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {currentOrigin}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={copied ? <CheckIcon /> : <CopyIcon />}
                onClick={handleCopyOrigin}
                sx={{
                  flexShrink: 0,
                  alignSelf: { xs: 'flex-end', sm: 'center' },
                  borderColor: '#a855f7',
                  color: copied ? '#c084fc' : '#a855f7',
                  '&:hover': { borderColor: '#c084fc' },
                }}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </Box>

            <Link
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: '#a855f7' }}
            >
              Open Google Cloud Console →
            </Link>
          </Box>
        );

      case 'signin':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {isAuthenticated && user ? (
              <Alert severity="success" icon={<CheckIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={user.picture} sx={{ width: 32, height: 32 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Signed in as {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </Alert>
            ) : (
              <>
                <Alert severity="info">
                  Sign in with the Google account that owns your music
                  folder. Only read access to your Drive is requested.
                </Alert>
                {authError && (
                  <Alert severity="error">{authError}</Alert>
                )}
                <Box>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<GoogleIcon />}
                    onClick={handleSignIn}
                    disabled={isLoading}
                    sx={{
                      bgcolor: '#a855f7',
                      '&:hover': { bgcolor: '#c084fc' },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                    ) : (
                      'Sign In with Google'
                    )}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        );

      case 'folder':
        return (
          <FolderPicker
            currentFolderId={folder.id}
            onSelectionChange={(id, name) => setFolder({ id, name })}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { backgroundColor: '#1a1a1a', color: 'white' },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FolderIcon sx={{ color: '#a855f7' }} />
        Set Up Your Music Library
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {setupMode === 'central'
            ? 'Connect your own Google Drive music folder in a couple of quick steps.'
            : 'A few quick steps to connect your own Google Drive music folder.'}
        </Typography>

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step) => (
            <Step key={step.key}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                {renderStepContent(step.key)}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: '#b3b3b3' }}>
          {activeStep > 0 ? 'Close' : 'Cancel'}
        </Button>

        {activeStep > 0 && (
          <Button
            onClick={() => setActiveStep(prev => prev - 1)}
            sx={{ color: '#b3b3b3' }}
          >
            Back
          </Button>
        )}

        {currentKey === 'clientid' && (
          <Button
            variant="contained"
            onClick={handleSaveCredentials}
            disabled={!clientId.trim() || isSaving}
            sx={{ bgcolor: '#a855f7', '&:hover': { bgcolor: '#c084fc' } }}
          >
            {isSaving ? <CircularProgress size={20} /> : 'Save & Continue'}
          </Button>
        )}

        {currentKey === 'origin' && (
          <Button
            variant="contained"
            onClick={() => setActiveStep(2)}
            sx={{ bgcolor: '#a855f7', '&:hover': { bgcolor: '#c084fc' } }}
          >
            I've Added the Origin — Continue
          </Button>
        )}

        {currentKey === 'signin' && (
          <Button
            variant="contained"
            onClick={() => setActiveStep(activeStep + 1)}
            disabled={!isAuthenticated}
            sx={{ bgcolor: '#a855f7', '&:hover': { bgcolor: '#c084fc' } }}
          >
            Continue
          </Button>
        )}

        {currentKey === 'folder' && (
          <Button
            variant="contained"
            onClick={handleFinish}
            sx={{ bgcolor: '#a855f7', '&:hover': { bgcolor: '#c084fc' } }}
          >
            Finish & Open My Music
          </Button>
        )}
      </DialogActions>
    </Dialog>

    {/* Step-by-step Google setup instructions popup (self-host mode) */}
    <Dialog
      open={showInstructions}
      onClose={() => setShowInstructions(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { backgroundColor: '#1a1a1a', color: 'white' },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <VpnKeyIcon sx={{ color: '#a855f7' }} />
        Getting Your Google Client ID
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          The Client ID lets this app read music from your own Google Drive. It
          takes about 5 minutes to set up, once:
        </Typography>

        <List dense>
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Chip label="1" size="small" sx={{ bgcolor: '#a855f7' }} />
            </ListItemIcon>
            <ListItemText
              primary="Create a Google Cloud project"
              secondary={
                <Link
                  href="https://console.cloud.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#a855f7' }}
                >
                  Open Google Cloud Console
                </Link>
              }
            />
          </ListItem>

          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Chip label="2" size="small" sx={{ bgcolor: '#a855f7' }} />
            </ListItemIcon>
            <ListItemText
              primary="Turn on the Google Drive API"
              secondary={
                <Link
                  href="https://console.cloud.google.com/apis/library/drive.googleapis.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#a855f7' }}
                >
                  Open the Drive API page and click Enable
                </Link>
              }
            />
          </ListItem>

          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Chip label="3" size="small" sx={{ bgcolor: '#a855f7' }} />
            </ListItemIcon>
            <ListItemText
              primary="Create OAuth credentials"
              secondary={
                <Link
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#a855f7' }}
                >
                  Credentials → Create credentials → OAuth client ID
                </Link>
              }
            />
          </ListItem>

          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Chip label="4" size="small" sx={{ bgcolor: '#a855f7' }} />
            </ListItemIcon>
            <ListItemText
              disableTypography
              primary={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Add this address to Authorized JavaScript origins
                </Typography>
              }
              secondary={
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexDirection: { xs: 'column', sm: 'row' },
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        width: { xs: '100%', sm: 'auto' },
                        overflow: 'hidden',
                        p: 1,
                        bgcolor: '#0a0a0a',
                        borderRadius: 1,
                        border: '1px solid #a855f7',
                      }}
                    >
                      <Typography
                        component="code"
                        sx={{
                          fontFamily: 'monospace',
                          color: '#a855f7',
                          fontSize: '0.85em',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {currentOrigin}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={copied ? <CheckIcon /> : <CopyIcon />}
                      onClick={handleCopyOrigin}
                      sx={{
                        flexShrink: 0,
                        alignSelf: { xs: 'flex-end', sm: 'center' },
                        borderColor: '#a855f7',
                        color: copied ? '#c084fc' : '#a855f7',
                        '&:hover': { borderColor: '#c084fc' },
                      }}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#b3b3b3' }}>
                    In your OAuth client's settings, under Authorized JavaScript
                    origins, click + Add URI and paste the address above.
                  </Typography>
                </Box>
              }
            />
          </ListItem>

          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Chip label="5" size="small" sx={{ bgcolor: '#a855f7' }} />
            </ListItemIcon>
            <ListItemText
              primary="Copy your Client ID and paste it here"
              secondary="Back on the Credentials page, copy the string ending in .apps.googleusercontent.com"
            />
          </ListItem>
        </List>

        <Alert severity="info" sx={{ mt: 2 }}>
          After saving, Google can take a few minutes to accept your new origin.
          If sign-in fails at first, wait and try again.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => setShowInstructions(false)} sx={{ color: '#b3b3b3' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};
