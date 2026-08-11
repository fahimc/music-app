import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { CloudQueue as CloudIcon } from '@mui/icons-material';
import { FolderPicker } from './FolderPicker';
import { credentialStorageService } from '../services/credentialStorage';

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
  const [selectedFolder, setSelectedFolder] = useState<{
    id: string;
    name: string;
  }>({
    id: currentFolderId || '',
    name: currentFolderId ? '' : 'My Drive (Root)',
  });

  // Reset selection each time the dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedFolder({
        id: currentFolderId || '',
        name: currentFolderId ? '' : 'My Drive (Root)',
      });
    }
  }, [open, currentFolderId]);

  const handleSelectionChange = (folderId: string, folderName: string) => {
    setSelectedFolder({ id: folderId, name: folderName });
  };

  const handleSave = () => {
    if (!selectedFolder.id && selectedFolder.id !== '') {
      return;
    }

    // Save folder ID and name to credentials
    const credentials = credentialStorageService.loadCredentials();
    if (credentials) {
      credentialStorageService.saveCredentials({
        ...credentials,
        folderId: selectedFolder.id,
        folderName: selectedFolder.name,
      });
    }

    onFolderSelected(selectedFolder.id, selectedFolder.name);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { backgroundColor: '#1a1a1a', color: 'white', minHeight: '480px' },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CloudIcon sx={{ color: '#a855f7' }} />
        Select Music Folder
      </DialogTitle>

      <DialogContent>
        <FolderPicker
          currentFolderId={currentFolderId}
          onSelectionChange={handleSelectionChange}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: '#b3b3b3' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            bgcolor: '#a855f7',
            '&:hover': { bgcolor: '#c084fc' },
          }}
        >
          Select Folder
        </Button>
      </DialogActions>
    </Dialog>
  );
};
