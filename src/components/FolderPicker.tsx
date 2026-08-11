import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
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
  Breadcrumbs,
  Link,
  IconButton,
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  MusicNote as MusicNoteIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { googleDriveService } from '../services/googleDrive';

interface DriveFolder {
  id: string;
  name: string;
  mimeType: string;
}

interface FolderPathItem {
  id: string; // 'root' for the top level
  name: string;
}

interface FolderPickerProps {
  currentFolderId?: string;
  onSelectionChange: (folderId: string, folderName: string) => void;
}

const ROOT_PATH_ITEM: FolderPathItem = { id: 'root', name: 'My Drive' };

export const FolderPicker: React.FC<FolderPickerProps> = ({
  currentFolderId,
  onSelectionChange,
}) => {
  const [path, setPath] = useState<FolderPathItem[]>([ROOT_PATH_ITEM]);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(currentFolderId || '');
  const [selectedFolderName, setSelectedFolderName] = useState<string>(
    currentFolderId ? '' : 'My Drive (Root)'
  );

  const currentBrowseId = path[path.length - 1].id;

  const loadFolders = useCallback(async (folderId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await googleDriveService.listFiles(folderId);
      const folderItems = (response.files || []).filter(
        item => item.mimeType === 'application/vnd.google-apps.folder'
      );
      setFolders(folderItems as DriveFolder[]);
    } catch (err) {
      console.error('Error loading folders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load folders');
      setFolders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentBrowseId) {
      loadFolders(currentBrowseId);
    }
  }, [currentBrowseId, loadFolders]);

  const navigateInto = (folder: DriveFolder) => {
    setPath(prev => [...prev, { id: folder.id, name: folder.name }]);
    setSearchQuery('');
  };

  const navigateTo = (index: number) => {
    setPath(prev => prev.slice(0, index + 1));
    setSearchQuery('');
  };

  const handleSelect = (folderId: string, folderName: string) => {
    setSelectedFolderId(folderId);
    setSelectedFolderName(folderName);
    onSelectionChange(folderId, folderName);
  };

  const handleRootSelect = () => {
    handleSelect('', 'My Drive (Root)');
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Choose a Google Drive folder where your music files are stored.
          The app will scan this folder for audio files.
        </Typography>
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Breadcrumbs / navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {path.length > 1 && (
          <IconButton
            size="small"
            onClick={() => navigateTo(path.length - 2)}
            sx={{ color: '#a855f7' }}
            title="Go up one level"
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}
        <Breadcrumbs
          maxItems={4}
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' },
          }}
        >
          {path.map((item, index) => (
            <Link
              key={`${item.id}-${index}`}
              component="button"
              underline="hover"
              onClick={() => navigateTo(index)}
              sx={{
                color: index === path.length - 1 ? '#a855f7' : '#b3b3b3',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textTransform: 'none',
                background: 'none',
                border: 'none',
                padding: 0,
                fontFamily: 'inherit',
                '&:hover': { color: '#a855f7' },
              }}
            >
              {item.name}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search folders in this location..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        size="small"
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

      <List sx={{ maxHeight: '260px', overflow: 'auto' }}>
        {/* Root folder option */}
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedFolderId === ''}
            onClick={handleRootSelect}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                '&:hover': { backgroundColor: 'rgba(168, 85, 247, 0.3)' },
              },
            }}
          >
            <ListItemIcon>
              <Radio
                checked={selectedFolderId === ''}
                sx={{ color: '#a855f7', '&.Mui-checked': { color: '#a855f7' } }}
              />
            </ListItemIcon>
            <ListItemIcon>
              <FolderOpenIcon sx={{ color: '#a855f7' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  My Drive (Root)
                  <Chip label="All files" size="small" sx={{ bgcolor: '#a855f7' }} />
                </Box>
              }
              secondary="Scan all music files in your Google Drive"
            />
          </ListItemButton>
        </ListItem>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress sx={{ color: '#a855f7' }} />
          </Box>
        ) : filteredFolders.length > 0 ? (
          filteredFolders.map((folder) => {
            const isMusicFolder = folder.name.toLowerCase() === 'music';
            const isSelected = selectedFolderId === folder.id;
            return (
              <ListItem key={folder.id} disablePadding>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleSelect(folder.id, folder.name)}
                  onDoubleClick={() => navigateInto(folder)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(168, 85, 247, 0.2)',
                      '&:hover': { backgroundColor: 'rgba(168, 85, 247, 0.3)' },
                    },
                    ...(isMusicFolder && {
                      border: '2px solid #a855f7',
                      borderRadius: '4px',
                      mb: 0.5,
                    }),
                  }}
                >
                  <ListItemIcon>
                    <Radio
                      checked={isSelected}
                      sx={{ color: '#a855f7', '&.Mui-checked': { color: '#a855f7' } }}
                    />
                  </ListItemIcon>
                  <ListItemIcon>
                    {isMusicFolder ? (
                      <MusicNoteIcon sx={{ color: '#a855f7' }} />
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
                            sx={{ bgcolor: '#a855f7', fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary="Double-click to open"
                  />
                  <FolderOpenIcon
                    sx={{ color: '#666', fontSize: 18, mr: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateInto(folder);
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <FolderIcon sx={{ fontSize: 40, color: '#666', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {searchQuery
                ? 'No folders found matching your search'
                : 'No folders in this location'}
            </Typography>
          </Box>
        )}
      </List>

      {selectedFolderId !== '' && selectedFolderName && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#0a0a0a', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Selected:
          </Typography>
          <Typography variant="body2" sx={{ color: '#a855f7', fontWeight: 'bold' }}>
            {selectedFolderName}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
