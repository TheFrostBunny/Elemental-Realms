# 🎵 Elemental Realms - Audio System

## ✨ NEW FEATURE: User Selectable Background Music!

Användarna kan nu välja sin egen bakgrundsmusik från 5 olika alternativ!

### 📁 Background Music Options
Ligger i `/public/audio/Backgound/` mappen:
- `1.mp3` - Background Music Option 1 ✅
- `2.mp3` - Background Music Option 2 ✅
- `3.mp3` - Background Music Option 3 ✅
- `4.mp3` - Background Music Option 4 ✅
- `5.mp3` - Background Music Option 5 ✅

### 🎮 Hur det fungerar:
1. **Gå till Inställningar** - Via spel menyn
2. **Välj din musik** - Under "Välj Bakgrundsmusikk" sektionen
3. **Preview** - Tryck "Preview" för att höra en 10-sekunders förhandsvisning
4. **Automatisk applicering** - Valet sparas och används direkt

### 🔧 Funktioner:
- **🎵 Music Preview**: Förhandsvisning av varje låt
- **🔄 Real-time byte**: Musiken byts omedelbart när du väljer
- **💾 Sparad inställning**: Ditt val sparas mellan sessioner
- **🎮 Kontext-medveten**: Vald musik spelas under både meny och gameplay
- **🎛️ Volymkontroll**: Separat volymkontroll för musik och ljudeffekter

### 🎯 Teknisk Implementation:
- Använder `AudioManagerProvider` för global state
- `GameAudioManager` spelar vald musik baserat på spelläge
- Preview funktion med automatisk stopp efter 10 sekunder
- Responsiv design för olika skärmstorlekar

## 📂 Komplett Audio Struktur

### Bakgrundsmusik (User Selectable)
```
/public/audio/Backgound/
├── 1.mp3 ✅ (Används som standard)
├── 2.mp3 ✅
├── 3.mp3 ✅
├── 4.mp3 ✅
└── 5.mp3 ✅
```

### Övrig musik
```
/public/audio/music/
├── menu-theme.mp3 ✅
├── game-theme.mp3 ✅
└── boss-theme.mp3 ✅ (Används för game over)
```

### Ljudeffekter (För framtida utbyggnad)
```
/public/audio/sfx/
├── click.wav (behöver skapas)
├── hover.wav (behöver skapas)
├── attack.wav (behöver skapas)
├── damage.wav (behöver skapas)
├── levelup.wav (behöver skapas)
├── collect.wav (behöver skapas)
└── portal.wav (behöver skapas)
```

## 🚀 Användning för utvecklare

### Lägga till fler bakgrundsmusik alternativ:
1. Lägg till filen i `/public/audio/Backgound/` (t.ex. `6.mp3`)
2. Uppdatera `BACKGROUND_MUSIC_OPTIONS` i `AudioManager.tsx`
3. Lägg till ny entry: `{ id: '6', name: 'Background Music 6', src: '/audio/Backgound/6.mp3' }`

### Ändra default musik:
I `App.tsx`, ändra `defaultBackgroundMusic` prop:
```tsx
<AudioManagerProvider
  defaultBackgroundMusic="2"  // Ändra från "1" till önskat alternativ
  ...
/>
```

Detta system ger användrna full kontroll över sin musikupplevelse och är enkelt att utöka med fler alternativ!