import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { audioManager, SfxType } from '@/game/audio';
import { AudioBackground, AudioBackgroundMulti } from '@/components/Audio/AudioBackground';

export const BACKGROUND_MUSIC_OPTIONS = [
  { id: '1', name: 'Background Music 1', src: '/audio/Backgound/1.mp3' },
  { id: '2', name: 'Background Music 2', src: '/audio/Backgound/2.mp3' },
  { id: '3', name: 'Background Music 3', src: '/audio/Backgound/3.mp3' },
  { id: '4', name: 'Background Music 4', src: '/audio/Backgound/4.mp3' },
  { id: '5', name: 'Background Music 5', src: '/audio/Backgound/5.mp3' },
];

export type BackgroundMusicId = '1' | '2' | '3' | '4' | '5';

interface AudioContext {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  musicVolume: number;
  setMusicVolume: (volume: number) => void;
  sfxEnabled: boolean;
  setSfxEnabled: (enabled: boolean) => void;
  sfxVolume: number;
  setSfxVolume: (volume: number) => void;
  selectedBackgroundMusic: BackgroundMusicId;
  setSelectedBackgroundMusic: (musicId: BackgroundMusicId) => void;
  playSfx: (type: SfxType) => void;
  unlock: () => void;
}

const AudioManagerContext = createContext<AudioContext | null>(null);

interface AudioManagerProviderProps {
  children: ReactNode;
  defaultMusicEnabled?: boolean;
  defaultMusicVolume?: number;
  defaultSfxEnabled?: boolean;
  defaultSfxVolume?: number;
  defaultBackgroundMusic?: BackgroundMusicId;
}

export const AudioManagerProvider: React.FC<AudioManagerProviderProps> = ({
  children,
  defaultMusicEnabled = true,
  defaultMusicVolume = 0.7,
  defaultSfxEnabled = true,
  defaultSfxVolume = 0.8,
  defaultBackgroundMusic = '1',
}) => {
  const [musicEnabled, setMusicEnabled] = useState(defaultMusicEnabled);
  const [musicVolume, setMusicVolume] = useState(defaultMusicVolume);
  const [sfxEnabled, setSfxEnabled] = useState(defaultSfxEnabled);
  const [sfxVolume, setSfxVolume] = useState(defaultSfxVolume);
  const [selectedBackgroundMusic, setSelectedBackgroundMusic] = useState<BackgroundMusicId>(defaultBackgroundMusic);

  useEffect(() => {
    audioManager.setMusicEnabled(musicEnabled);
  }, [musicEnabled]);

  useEffect(() => {
    audioManager.setMusicVolume(musicVolume);
  }, [musicVolume]);

  useEffect(() => {
    audioManager.setSfxEnabled(sfxEnabled);
  }, [sfxEnabled]);

  useEffect(() => {
    audioManager.setSfxVolume(sfxVolume);
  }, [sfxVolume]);

  const playSfx = (type: SfxType) => {
    audioManager.playSfx(type);
  };

  const unlock = () => {
    audioManager.unlock();
  };

  return (
    <AudioManagerContext.Provider
      value={{
        musicEnabled,
        setMusicEnabled,
        musicVolume,
        setMusicVolume,
        sfxEnabled,
        setSfxEnabled,
        sfxVolume,
        setSfxVolume,
        selectedBackgroundMusic,
        setSelectedBackgroundMusic,
        playSfx,
        unlock,
      }}
    >
      {children}
    </AudioManagerContext.Provider>
  );
};

export const useAudioManager = (): AudioContext => {
  const context = useContext(AudioManagerContext);
  if (!context) {
    throw new Error('useAudioManager must be used within an AudioManagerProvider');
  }
  return context;
};

// Komponent för att hantera bakgrundsmusik baserat på spelläge
interface GameAudioManagerProps {
  gameState: 'menu' | 'playing' | 'gameover' | 'loading';
  currentRealm?: 'fire' | 'water' | 'earth' | 'air';
}

export const GameAudioManager: React.FC<GameAudioManagerProps> = ({
  gameState,
  currentRealm = 'fire'
}) => {
  const { musicEnabled, musicVolume, selectedBackgroundMusic } = useAudioManager();

  const getSelectedMusicSrc = () => {
    const selectedMusic = BACKGROUND_MUSIC_OPTIONS.find(option => option.id === selectedBackgroundMusic);
    return selectedMusic?.src || BACKGROUND_MUSIC_OPTIONS[0].src;
  };

  const getAudioSources = () => {
    switch (gameState) {
      case 'menu':
        return [
          {
            src: getSelectedMusicSrc(),
            volume: 0.6,
            loop: true,
            fadeIn: true,
            fadeInDuration: 3,
          }
        ];
      case 'playing':
        return [
          {
            src: getSelectedMusicSrc(),
            volume: 0.7,
            loop: true,
            fadeIn: true,
            fadeInDuration: 2,
          }
        ];
      case 'gameover':
        return [
          {
            src: '/audio/music/boss-theme.mp3',
            volume: 0.5,
            loop: false,
          }
        ];
      case 'loading':
        return [];
      default:
        return [];
    }
  };

  const sources = getAudioSources();

  if (!sources.length) return null;

  return (
    <AudioBackgroundMulti
      sources={sources}
      musicEnabled={musicEnabled}
      musicVolume={musicVolume}
      onLoad={() => console.log(`Audio loaded for ${gameState} state`)}
      onError={(error) => console.warn(`Audio error for ${gameState}:`, error)}
    />
  );
};

// För enklare användning - bara en ljudfil
interface SimpleAudioProps {
  src: string;
  volume?: number;
  loop?: boolean;
  fadeIn?: boolean;
}

export const SimpleAudio: React.FC<SimpleAudioProps> = (props) => {
  const { musicEnabled, musicVolume } = useAudioManager();

  return (
    <AudioBackground
      {...props}
      musicEnabled={musicEnabled}
      musicVolume={musicVolume}
    />
  );
};