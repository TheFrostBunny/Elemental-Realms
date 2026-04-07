type MusicTrack = 'menu' | 'game';
type SfxName =
  | 'click'
  | 'hover'
  | 'attack'
  | 'damage'
  | 'levelUp'
  | 'gameOver'
  | 'notification'
  | 'gameStart'
  | 'elementSwitch';

const MUSIC_PATHS: Record<MusicTrack, string[]> = {
  // Softer/shorter loop for menu.
  menu: ['/audio/music/gen_261_miyj6tfjb0o44.mp3'],
  // Longer tracks rotated during gameplay.
  game: [
    '/audio/music/gen_267_afhbdkyz4uwgx.mp3',
    '/audio/music/untitled-variant-2.mp3',
    '/audio/music/game-ambient.mp3',
    '/audio/music/boss-theme.mp3',
    '/audio/music/intense-battle.mp3',
  ],
};

const SFX_PATHS: Record<SfxName, string[]> = {
  click: ['/audio/sfx/ui-click.mp3'],
  hover: ['/audio/sfx/ui-hover.mp3'],
  attack: ['/audio/sfx/attack.mp3', '/audio/sfx/power-cast.mp3'],
  damage: ['/audio/sfx/damage.mp3'],
  levelUp: ['/audio/sfx/level-up.mp3', '/audio/sfx/pickup.mp3'],
  gameOver: ['/audio/sfx/game-over.mp3', '/audio/sfx/victory.mp3'],
  notification: ['/audio/sfx/notification.mp3', '/audio/sfx/realm-shift.mp3'],
  gameStart: ['/audio/sfx/game-start.mp3'],
  elementSwitch: ['/audio/sfx/element-switch.mp3'],
};

class AudioManager {
  private static readonly SFX_COOLDOWN_MS = 120;
  private unlocked = false;
  private currentMusic: HTMLAudioElement | null = null;
  private currentMusicSrc: string | null = null;
  private lastSfxSrc: Partial<Record<SfxName, string>> = {};
  private sfxLastPlayedAt: Partial<Record<SfxName, number>> = {};
  private sfxPlaying: Partial<Record<SfxName, boolean>> = {};
  private preloadedAudio = new Map<string, HTMLAudioElement>();
  private preloaded = false;
  private musicVolume = 0.35;
  private sfxVolume = 0.7;

  unlock() {
    this.unlocked = true;
    this.preloadAll();
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume = this.musicVolume;
    }
  }

  setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  stopMusic() {
    if (!this.currentMusic) return;
    this.currentMusic.pause();
    this.currentMusic.currentTime = 0;
    this.currentMusic = null;
    this.currentMusicSrc = null;
  }

  playMusic(track: MusicTrack) {
    if (!this.unlocked) return;

    const candidates = MUSIC_PATHS[track];
    if (candidates.length === 0) return;

    const pool = candidates.length > 1
      ? candidates.filter((src) => src !== this.currentMusicSrc)
      : candidates;
    const src = pool[Math.floor(Math.random() * pool.length)];

    if (this.currentMusic?.src.endsWith(src)) {
      return;
    }

    this.stopMusic();

    const audio = this.createAudioInstance(src);
    audio.loop = true;
    audio.volume = this.musicVolume;

    audio.play().catch(() => {
      // Ignore autoplay/file errors; game should continue without sound.
    });

    this.currentMusic = audio;
    this.currentMusicSrc = src;
  }

  playSfx(name: SfxName) {
    if (!this.unlocked) return;

    // Prevent stacking the same SFX rapidly or on top of itself.
    if (this.sfxPlaying[name]) return;
    const now = Date.now();
    const lastPlayedAt = this.sfxLastPlayedAt[name] ?? 0;
    if (now - lastPlayedAt < AudioManager.SFX_COOLDOWN_MS) return;

    const candidates = SFX_PATHS[name];
    if (candidates.length === 0) return;
    const pool = candidates.length > 1
      ? candidates.filter((src) => src !== this.lastSfxSrc[name])
      : candidates;
    const src = pool[Math.floor(Math.random() * pool.length)];
    const audio = this.createAudioInstance(src);
    audio.volume = this.sfxVolume;
    this.sfxPlaying[name] = true;
    this.sfxLastPlayedAt[name] = now;
    audio.addEventListener(
      'ended',
      () => {
        this.sfxPlaying[name] = false;
      },
      { once: true },
    );
    audio.addEventListener(
      'error',
      () => {
        this.sfxPlaying[name] = false;
      },
      { once: true },
    );
    audio.play().catch(() => {
      // Ignore missing file / decode issues.
      this.sfxPlaying[name] = false;
    });
    this.lastSfxSrc[name] = src;
  }

  preloadAll() {
    if (this.preloaded) return;
    this.preloaded = true;
    const allSources = new Set<string>([
      ...Object.values(MUSIC_PATHS).flat(),
      ...Object.values(SFX_PATHS).flat(),
    ]);
    for (const src of allSources) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.load();
      this.preloadedAudio.set(src, audio);
    }
  }

  private createAudioInstance(src: string) {
    const preloaded = this.preloadedAudio.get(src);
    if (!preloaded) {
      return new Audio(src);
    }
    const cloned = preloaded.cloneNode(true);
    if (cloned instanceof HTMLAudioElement) {
      return cloned;
    }
    return new Audio(src);
  }
}

export const audioManager = new AudioManager();
export type { MusicTrack, SfxName };
