import React from 'react';
import {
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemButton,
  ListItemIcon,
} from '@mui/material';
import {
  Home as HomeIcon,
  LibraryMusic as LibraryMusicIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  MusicNote as MusicNoteIcon,
  Google as GoogleIcon,
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

  const navItem = (to: string, icon: React.ReactNode, label: string) => (
    <ListItemButton
      component={Link}
      to={to}
      selected={isActive(to)}
      sx={{
        borderRadius: 1,
        px: 1.5,
        py: 1,
        color: isActive(to) ? '#ffffff' : '#b3b3b3',
        '&:hover': {
          color: '#ffffff',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
        },
        '&.Mui-selected': {
          color: '#a855f7',
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
          },
        },
        minWidth: 0,
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 36,
          color: 'inherit',
        }}
      >
        {icon}
      </ListItemIcon>
      <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
        {label}
      </Box>
    </ListItemButton>
  );

  return (
    <Box
      component="nav"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'row', md: 'column' },
        alignItems: { xs: 'center', md: 'stretch' },
        justifyContent: 'space-between',
        bgcolor: '#000000',
        borderBottom: { xs: '1px solid #181818', md: 'none' },
        borderRight: { md: '1px solid #181818' },
        width: { xs: '100%', md: 240 },
        height: { xs: 'auto', md: '100%' },
        flexShrink: 0,
        px: { xs: 2, md: 1.5 },
        py: { xs: 1, md: 2 },
        gap: { xs: 1, md: 0 },
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
        <MusicNoteIcon sx={{ color: '#a855f7' }} />
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: 'none',
            color: '#a855f7',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          MusicApp
        </Typography>
      </Box>

      {/* Nav items */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
          alignItems: { xs: 'center', md: 'stretch' },
          flex: { xs: '0 1 auto', md: '1 1 auto' },
          gap: { xs: 0.5, md: 0.5 },
        }}
      >
        {navItem('/', <HomeIcon fontSize="small" />, 'Home')}
        {isAuthenticated && navItem('/songs', <LibraryMusicIcon fontSize="small" />, 'Your Music')}
        {isAuthenticated && navItem('/settings', <SettingsIcon fontSize="small" />, 'Settings')}
      </Box>

      {/* User / Auth */}
      <Box
        sx={{
          mt: { md: 'auto' },
          pt: { md: 2 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'flex-end', md: 'stretch' },
        }}
      >
        {isAuthenticated && user ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1,
              width: '100%',
              justifyContent: { xs: 'flex-end', md: 'flex-start' },
            }}
          >
            <IconButton onClick={handleUserMenuClick} size="small">
              <Avatar src={user.picture} alt={user.name} sx={{ width: 32, height: 32 }} />
            </IconButton>
            <Typography
              variant="body2"
              sx={{
                color: '#b3b3b3',
                display: { xs: 'none', md: 'block' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 140,
              }}
            >
              {user.name}
            </Typography>
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
            startIcon={<GoogleIcon />}
            size="small"
            sx={{
              color: error ? '#666' : '#a855f7',
              borderColor: error ? '#666' : '#a855f7',
              borderRadius: '50px',
              '&:hover': !error
                ? {
                    borderColor: '#c084fc',
                    backgroundColor: 'rgba(168, 85, 247, 0.08)',
                  }
                : {},
              '&:disabled': {
                borderColor: '#666',
                color: '#666',
              },
              whiteSpace: 'nowrap',
            }}
          >
            {error ? (
              'Not Configured'
            ) : (
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Sign in with Google
              </Box>
            )}
          </Button>
        )}
      </Box>
    </Box>
  );
};
