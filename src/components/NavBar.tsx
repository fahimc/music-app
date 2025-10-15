import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Home as HomeIcon,
  LibraryMusic as LibraryMusicIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const NavBar: React.FC = () => {
  const { isAuthenticated, user, signOut, signIn, error } = useAuth();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOut();
    handleUserMenuClose();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar position="static" sx={{ backgroundColor: '#040404' }}>
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 0,
            textDecoration: 'none',
            color: '#1db954',
            fontWeight: 'bold',
            mr: 4,
          }}
        >
          🎵 MusicApp
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            startIcon={<HomeIcon />}
            sx={{
              color: isActive('/') ? '#1db954' : '#b3b3b3',
              '&:hover': {
                color: '#1db954',
              },
            }}
          >
            Home
          </Button>

          {isAuthenticated && (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/songs"
                startIcon={<LibraryMusicIcon />}
                sx={{
                  color: isActive('/songs') ? '#1db954' : '#b3b3b3',
                  '&:hover': {
                    color: '#1db954',
                  },
                }}
              >
                Your Music
              </Button>

              <Button
                color="inherit"
                component={Link}
                to="/settings"
                startIcon={<SettingsIcon />}
                sx={{
                  color: isActive('/settings') ? '#1db954' : '#b3b3b3',
                  '&:hover': {
                    color: '#1db954',
                  },
                }}
              >
                Settings
              </Button>
            </>
          )}
        </Box>

        {/* User Profile / Auth */}
        {isAuthenticated && user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
              {user.name}
            </Typography>
            <IconButton onClick={handleUserMenuClick} size="small">
              <Avatar
                src={user.picture}
                alt={user.name}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleUserMenuClose} component={Link} to="/settings">
                <SettingsIcon sx={{ mr: 1 }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleSignOut}>
                <AccountCircleIcon sx={{ mr: 1 }} />
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button
            variant="outlined"
            onClick={signIn}
            disabled={Boolean(error)}
            sx={{
              color: error ? '#666' : '#1db954',
              borderColor: error ? '#666' : '#1db954',
              '&:hover': !error ? {
                borderColor: '#1ed760',
                backgroundColor: 'rgba(29, 185, 84, 0.08)',
              } : {},
              '&:disabled': {
                borderColor: '#666',
                color: '#666',
              }
            }}
          >
            {error ? 'OAuth Not Configured' : 'Sign In with Google'}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};