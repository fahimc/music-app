import { useState, useEffect, useRef, useCallback } from 'react';
import type { Song, AudioPlayerState } from '../types';
import { offlineStorageService } from '../services/offlineStorage';

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    currentSong: null,
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    duration: 0,
    currentTime: 0,
    volume: 1,
    isMuted: false,
    isShuffling: false,
    isRepeating: false,
    queue: [],
    currentIndex: -1,
  });

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    // Audio event listeners
    const handleLoadStart = () => {
      setPlayerState(prev => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      setPlayerState(prev => ({ 
        ...prev, 
        isLoading: false,
        duration: audio.duration || 0 
      }));
    };

    const handleTimeUpdate = () => {
      setPlayerState(prev => ({ 
        ...prev, 
        currentTime: audio.currentTime 
      }));
    };

    const handleEnded = () => {
      setPlayerState(prev => ({ 
        ...prev, 
        isPlaying: false,
        isPaused: false 
      }));
      // Auto-play next song if in queue
      playNext();
    };

    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      setPlayerState(prev => ({ 
        ...prev, 
        isPlaying: false,
        isPaused: false,
        isLoading: false 
      }));
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Load and play a song
  const playSong = useCallback(async (song: Song) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    
    try {
      setPlayerState(prev => ({ 
        ...prev, 
        currentSong: song,
        isLoading: true 
      }));

      let audioUrl: string;

      // Check if song is downloaded offline
      const isOffline = await offlineStorageService.isSongDownloaded(song.id);
      
      if (isOffline) {
        // Play from offline storage
        const offlineUrl = await offlineStorageService.createSongURL(song.id);
        if (!offlineUrl) {
          throw new Error('Failed to create offline audio URL');
        }
        audioUrl = offlineUrl;
      } else {
        // Stream from Google Drive
        if (!song.downloadUrl) {
          throw new Error('No download URL available for streaming');
        }
        audioUrl = song.downloadUrl;
      }

      audio.src = audioUrl;
      audio.load();
      
      await audio.play();
      
      setPlayerState(prev => ({ 
        ...prev, 
        isPlaying: true,
        isPaused: false,
        isLoading: false 
      }));

    } catch (error) {
      console.error('Error playing song:', error);
      setPlayerState(prev => ({ 
        ...prev, 
        isPlaying: false,
        isPaused: false,
        isLoading: false 
      }));
    }
  }, []);

  // Play/pause toggle
  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current || !playerState.currentSong) return;

    const audio = audioRef.current;

    try {
      if (playerState.isPlaying) {
        audio.pause();
        setPlayerState(prev => ({ 
          ...prev, 
          isPlaying: false,
          isPaused: true 
        }));
      } else {
        await audio.play();
        setPlayerState(prev => ({ 
          ...prev, 
          isPlaying: true,
          isPaused: false 
        }));
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  }, [playerState.isPlaying, playerState.currentSong]);

  // Seek to specific time
  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = time;
    setPlayerState(prev => ({ ...prev, currentTime: time }));
  }, []);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current) return;
    
    const clampedVolume = Math.max(0, Math.min(1, volume));
    audioRef.current.volume = clampedVolume;
    setPlayerState(prev => ({ 
      ...prev, 
      volume: clampedVolume,
      isMuted: clampedVolume === 0 
    }));
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    
    if (playerState.isMuted) {
      audioRef.current.volume = playerState.volume;
      setPlayerState(prev => ({ ...prev, isMuted: false }));
    } else {
      audioRef.current.volume = 0;
      setPlayerState(prev => ({ ...prev, isMuted: true }));
    }
  }, [playerState.isMuted, playerState.volume]);

  // Set queue and current index
  const setQueue = useCallback((songs: Song[], currentIndex: number = 0) => {
    setPlayerState(prev => ({ 
      ...prev, 
      queue: songs,
      currentIndex 
    }));
  }, []);

  // Play next song in queue
  const playNext = useCallback(() => {
    if (playerState.queue.length === 0) return;

    let nextIndex: number;
    
    if (playerState.isShuffling) {
      // Random next song
      nextIndex = Math.floor(Math.random() * playerState.queue.length);
    } else if (playerState.currentIndex < playerState.queue.length - 1) {
      // Next song in order
      nextIndex = playerState.currentIndex + 1;
    } else if (playerState.isRepeating) {
      // Repeat queue from beginning
      nextIndex = 0;
    } else {
      // End of queue
      return;
    }

    const nextSong = playerState.queue[nextIndex];
    if (nextSong) {
      setPlayerState(prev => ({ ...prev, currentIndex: nextIndex }));
      playSong(nextSong);
    }
  }, [playerState.queue, playerState.currentIndex, playerState.isShuffling, playerState.isRepeating, playSong]);

  // Play previous song in queue
  const playPrevious = useCallback(() => {
    if (playerState.queue.length === 0) return;

    let prevIndex: number;
    
    if (playerState.isShuffling) {
      // Random previous song
      prevIndex = Math.floor(Math.random() * playerState.queue.length);
    } else if (playerState.currentIndex > 0) {
      // Previous song in order
      prevIndex = playerState.currentIndex - 1;
    } else if (playerState.isRepeating) {
      // Go to end of queue
      prevIndex = playerState.queue.length - 1;
    } else {
      // Beginning of queue
      return;
    }

    const prevSong = playerState.queue[prevIndex];
    if (prevSong) {
      setPlayerState(prev => ({ ...prev, currentIndex: prevIndex }));
      playSong(prevSong);
    }
  }, [playerState.queue, playerState.currentIndex, playerState.isShuffling, playerState.isRepeating, playSong]);

  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isShuffling: !prev.isShuffling }));
  }, []);

  // Toggle repeat
  const toggleRepeat = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isRepeating: !prev.isRepeating }));
  }, []);

  // Stop playback and clear current song
  const stop = useCallback(() => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    
    setPlayerState(prev => ({ 
      ...prev, 
      currentSong: null,
      isPlaying: false,
      isPaused: false,
      currentTime: 0 
    }));
  }, []);

  return {
    ...playerState,
    playSong,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    setQueue,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
    stop,
  };
};