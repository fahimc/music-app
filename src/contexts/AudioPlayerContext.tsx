import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import type { Song } from '../types';

interface AudioPlayerContextType {
  // Player state
  currentSong: Song | null;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  isShuffling: boolean;
  isRepeating: boolean;
  queue: Song[];
  currentIndex: number;
  
  // Player controls
  playSong: (song: Song) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setQueue: (songs: Song[], currentIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  stop: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ children }) => {
  const audioPlayer = useAudioPlayer();

  return (
    <AudioPlayerContext.Provider value={audioPlayer}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayerContext = (): AudioPlayerContextType => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayerContext must be used within an AudioPlayerProvider');
  }
  return context;
};