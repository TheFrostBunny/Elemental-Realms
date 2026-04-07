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
  private unlocked = false;
  private currentMusic: HTMLAudioElement | null = null;
  private currentMusicSrc: string | null = null;
  private lastSfxSrc: Partial<Record<SfxName, string>> = {};
  private musicVolume = 0.35;
  private sfxVolume = 0.7;

  unlock() {
    this.unlocked = true;
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

    const audio = new Audio(src);
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
    const candidates = SFX_PATHS[name];
    if (candidates.length === 0) return;
    const pool = candidates.length > 1
      ? candidates.filter((src) => src !== this.lastSfxSrc[name])
      : candidates;
    const src = pool[Math.floor(Math.random() * pool.length)];
    const audio = new Audio(src);
    audio.volume = this.sfxVolume;
    audio.play().catch(() => {
      // Ignore missing file / decode issues.
    });
    this.lastSfxSrc[name] = src;
  }
}

export const audioManager = new AudioManager();
export type { MusicTrack, SfxName };
