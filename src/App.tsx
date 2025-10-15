
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

// Spotify-like dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1db954',
    },
    secondary: {
      main: '#1ed760',
    },
    background: {
      default: '#121212',
      paper: '#181818',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '50px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#181818',
          '&:hover': {
            backgroundColor: '#282828',
          },
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
