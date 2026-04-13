type SfxType = 'click' | 'hover' | 'attack' | 'damage' | 'levelup' | 'collect' | 'portal';

interface AudioSettings {
  musicVolume: number;
  sfxVolume: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

class AudioManager {
  private settings: AudioSettings = {
    musicVolume: 0.7,
    sfxVolume: 0.8,
    musicEnabled: true,
    sfxEnabled: true,
  };

  private audioContext: AudioContext | null = null;
  private musicAudio: HTMLAudioElement | null = null;
  private sfxAudios: Map<SfxType, HTMLAudioElement> = new Map();
  private isUnlocked = false;

  constructor() {
    this.initializeSfxAudios();
  }

  private initializeSfxAudios() {
    const sfxFiles: Record<SfxType, string> = {
      click: '/audio/sfx/click.wav',
      hover: '/audio/sfx/hover.wav', 
      attack: '/audio/sfx/attack.wav',
      damage: '/audio/sfx/damage.wav',
      levelup: '/audio/sfx/levelup.wav',
      collect: '/audio/sfx/collect.wav',
      portal: '/audio/sfx/portal.wav',
    };

    Object.entries(sfxFiles).forEach(([key, path]) => {
      const audio = new Audio();
      audio.src = path;
      audio.preload = 'auto';
      audio.volume = this.settings.sfxVolume;
      this.sfxAudios.set(key as SfxType, audio);
    });
  }

  async unlock() {
    if (this.isUnlocked) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Play silent sound to unlock audio
      const buffer = this.audioContext.createBuffer(1, 1, 22050);
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start();

      this.isUnlocked = true;
      console.log('Audio unlocked');
    } catch (error) {
      console.warn('Could not unlock audio:', error);
    }
  }

  playSfx(type: SfxType) {
    if (!this.settings.sfxEnabled || !this.isUnlocked) return;
    
    const audio = this.sfxAudios.get(type);
    if (audio) {
      audio.currentTime = 0;
      audio.volume = this.settings.sfxVolume;
      audio.play().catch(error => {
        console.warn(`Could not play ${type} sound:`, error);
      });
    }
  }

  setMusicVolume(volume: number) {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicAudio) {
      this.musicAudio.volume = this.settings.musicVolume;
    }
  }

  setSfxVolume(volume: number) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    this.sfxAudios.forEach(audio => {
      audio.volume = this.settings.sfxVolume;
    });
  }

  setMusicEnabled(enabled: boolean) {
    this.settings.musicEnabled = enabled;
    if (!enabled && this.musicAudio) {
      this.musicAudio.pause();
    }
  }

  setSfxEnabled(enabled: boolean) {
    this.settings.sfxEnabled = enabled;
  }

  playMusic(src: string, loop: boolean = true) {
    if (!this.settings.musicEnabled || !this.isUnlocked) return;

    this.stopMusic();
    
    this.musicAudio = new Audio(src);
    this.musicAudio.loop = loop;
    this.musicAudio.volume = this.settings.musicVolume;
    
    this.musicAudio.play().catch(error => {
      console.warn('Could not play music:', error);
    });
  }

  stopMusic() {
    if (this.musicAudio) {
      this.musicAudio.pause();
      this.musicAudio.currentTime = 0;
      this.musicAudio = null;
    }
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }
}

export const audioManager = new AudioManager();
export type { SfxType };