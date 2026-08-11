
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import { MusicSourceProvider } from './contexts/MusicSourceContext';
import { NavBar } from './components/NavBar';
import { HomePage } from './components/HomePage';
import { SongListPage } from './components/SongListPage';
import { SettingsPage } from './components/SettingsPage';
import { AudioPlayer } from './components/AudioPlayer';
import './App.css';

// Spotify-inspired dark theme with a purple accent
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#a855f7',
      light: '#c084fc',
      dark: '#9333ea',
    },
    secondary: {
      main: '#c084fc',
    },
    background: {
      default: '#121212',
      paper: '#181818',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
    divider: '#282828',
  },
  typography: {
    fontFamily: '"Circular", "Helvetica Neue", Helvetica, Arial, sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 700 },
    button: { fontWeight: 700 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '50px',
          fontWeight: 700,
          padding: '8px 20px',
          '&:focus-visible': {
            outline: '2px solid #c084fc',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid #c084fc',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#181818',
          borderRadius: 8,
          transition: 'background-color 0.2s ease, transform 0.2s ease',
          '&:hover': {
            backgroundColor: '#282828',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#282828',
          color: '#ffffff',
          fontSize: '0.75rem',
          borderRadius: 4,
          padding: '6px 10px',
        },
        arrow: {
          color: '#282828',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1f1f1f',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#282828',
          borderRadius: 8,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          '&.Mui-selected': {
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            '&:hover': {
              backgroundColor: 'rgba(168, 85, 247, 0.22)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <MusicSourceProvider>
          <AudioPlayerProvider>
            <Router>
              <div className="app">
                <NavBar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/songs" element={<SongListPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </main>
                <AudioPlayer />
              </div>
            </Router>
          </AudioPlayerProvider>
        </MusicSourceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
