import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Slider,
  Stack,
  Avatar,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipPrevious as PrevIcon,
  SkipNext as NextIcon,
  Shuffle as ShuffleIcon,
  Repeat as RepeatIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as MuteIcon,
} from '@mui/icons-material';
import { useAudioPlayerContext } from '../contexts/AudioPlayerContext';

export const AudioPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    isLoading,
    duration,
    currentTime,
    volume,
    isMuted,
    isShuffling,
    isRepeating,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
  } = useAudioPlayerContext();

  if (!currentSong) {
    return null;
  }

  // Format time in MM:SS
  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: '#181818',
        borderTop: '1px solid #282828',
        padding: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Song Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: '0 1 30%' }}>
          <Avatar
            variant="square"
            src={currentSong.thumbnailLink}
            sx={{ 
              width: 56, 
              height: 56, 
              backgroundColor: '#282828',
              '& img': {
                objectFit: 'cover',
              }
            }}
          >
            🎵
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'white', 
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentSong.name}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#b3b3b3',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentSong.artist || 'Unknown Artist'}
            </Typography>
          </Box>
        </Box>

        {/* Player Controls */}
        <Box sx={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              size="small"
              onClick={toggleShuffle}
              sx={{
                color: isShuffling ? '#1db954' : '#b3b3b3',
                '&:hover': { color: '#1db954' },
              }}
            >
              <ShuffleIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="medium"
              onClick={playPrevious}
              sx={{ color: '#b3b3b3', '&:hover': { color: 'white' } }}
            >
              <PrevIcon />
            </IconButton>

            <IconButton
              size="large"
              onClick={togglePlayPause}
              disabled={isLoading}
              sx={{
                backgroundColor: '#1db954',
                color: 'black',
                '&:hover': { backgroundColor: '#1ed760' },
                '&:disabled': { backgroundColor: '#666', color: '#999' },
                width: 48,
                height: 48,
              }}
            >
              {isLoading ? (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    border: '2px solid #999',
                    borderTop: '2px solid black',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              ) : isPlaying ? (
                <PauseIcon />
              ) : (
                <PlayIcon />
              )}
            </IconButton>

            <IconButton
              size="medium"
              onClick={playNext}
              sx={{ color: '#b3b3b3', '&:hover': { color: 'white' } }}
            >
              <NextIcon />
            </IconButton>

            <IconButton
              size="small"
              onClick={toggleRepeat}
              sx={{
                color: isRepeating ? '#1db954' : '#b3b3b3',
                '&:hover': { color: '#1db954' },
              }}
            >
              <RepeatIcon fontSize="small" />
            </IconButton>
          </Stack>

          {/* Progress Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', maxWidth: 600 }}>
            <Typography variant="caption" sx={{ color: '#b3b3b3', minWidth: 40, textAlign: 'center' }}>
              {formatTime(currentTime)}
            </Typography>
            <Slider
              value={progress}
              onChange={(_, value) => {
                const newTime = (value as number / 100) * duration;
                seekTo(newTime);
              }}
              sx={{
                flex: 1,
                color: '#1db954',
                height: 4,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  '&:before': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                  },
                  '&:hover, &.Mui-focusVisible, &.Mui-active': {
                    boxShadow: 'none',
                  },
                },
                '& .MuiSlider-rail': {
                  backgroundColor: '#535353',
                },
              }}
            />
            <Typography variant="caption" sx={{ color: '#b3b3b3', minWidth: 40, textAlign: 'center' }}>
              {formatTime(duration)}
            </Typography>
          </Box>
        </Box>

        {/* Volume Control */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: '0 1 30%', justifyContent: 'flex-end' }}>
          <IconButton
            size="small"
            onClick={toggleMute}
            sx={{ color: '#b3b3b3', '&:hover': { color: 'white' } }}
          >
            {isMuted ? <MuteIcon fontSize="small" /> : <VolumeIcon fontSize="small" />}
          </IconButton>
          <Slider
            value={isMuted ? 0 : volume * 100}
            onChange={(_, value) => setVolume((value as number) / 100)}
            sx={{
              width: 100,
              color: '#1db954',
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
              },
              '& .MuiSlider-rail': {
                backgroundColor: '#535353',
              },
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};