import { useState, useEffect } from 'react';
import { ELEMENTS, Element } from './types';
import { audioManager } from './audio';
import { getHighScores } from './highScores';

interface MainMenuProps {
  onStart: () => void;
}

export function MainMenu({ onStart }: MainMenuProps) {
  const [visible, setVisible] = useState(false);
  const [hoveredEl, setHoveredEl] = useState<Element | null>(null);
  const [showScores, setShowScores] = useState(false);
  const highScores = getHighScores();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const elements: Element[] = ['fire', 'water', 'earth', 'air'];
  const onStartClick = () => {
    audioManager.unlock();
    audioManager.playSfx('click');
    onStart();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background">
      <div
        className="relative z-10 flex flex-col items-center gap-8 md:gap-12 transition-all duration-1000 w-full max-w-2xl px-4 md:px-0"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        <div className="text-center">
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[0.9]">
            Elemental
          </h1>
          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl font-normal tracking-[0.2em] text-primary mt-1">
            REALMS
          </h1>
          <p className="mt-4 md:mt-6 text-muted-foreground font-body text-xs md:text-sm tracking-widest uppercase">
            Master the Elements · Restore Balance
          </p>
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 justify-center">
          {elements.map((el) => {
            const config = ELEMENTS[el];
            const isHovered = hoveredEl === el;
            return (
              <div
                key={el}
                className="flex flex-col items-center gap-2 cursor-default transition-transform duration-300"
                style={{ transform: isHovered ? 'translateY(-4px)' : 'translateY(0)' }}
                onMouseEnter={() => {
                  setHoveredEl(el);
                  audioManager.playSfx('hover');
                }}
                onMouseLeave={() => setHoveredEl(null)}
              >
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm sm:text-lg md:text-xl transition-all duration-300"
                  style={{
                    backgroundColor: config.color + '22',
                    boxShadow: isHovered ? `0 0 24px ${config.glowColor}50` : `0 0 8px ${config.glowColor}20`,
                  }}
                >
                  {config.icon}
                </div>
                <span
                  className="text-[8px] sm:text-[9px] md:text-[10px] font-body uppercase tracking-widest transition-colors duration-300"
                  style={{ color: isHovered ? config.color : '#555' }}
                >
                  {config.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* High Scores / Features toggle */}
        {!showScores ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 md:gap-x-8 gap-y-2 text-[9px] sm:text-[10px] md:text-[11px] font-body text-muted-foreground/70 w-full max-w-md">
              <span>⚔ Dynamic combat with elemental weaknesses</span>
              <span>🌍 8 unique realms to explore</span>
              <span>📈 Level up and grow stronger</span>
              <span>✨ Collect shards, orbs, and health</span>
            </div>
            {highScores.length > 0 && (
              <button
                onClick={() => setShowScores(true)}
                className="text-[10px] font-body text-muted-foreground/50 hover:text-primary/80 transition-colors uppercase tracking-widest"
              >
                🏆 View Leaderboard ({highScores.length})
              </button>
            )}
          </>
        ) : (
          <div className="w-full max-w-[340px] animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm tracking-[0.2em] uppercase text-muted-foreground">
                🏆 Leaderboard
              </h3>
              <button
                onClick={() => setShowScores(false)}
                className="text-[9px] font-body text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                ✕ Close
              </button>
            </div>
            <div className="bg-card/30 rounded-xl border border-border/40 overflow-hidden">
              <table className="w-full text-[11px] font-body">
                <thead>
                  <tr className="border-b border-border/30 text-muted-foreground/70">
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-right">Score</th>
                    <th className="px-3 py-2 text-right">Lv</th>
                    <th className="px-3 py-2 text-right">Kills</th>
                    <th className="px-3 py-2 text-right">Realms</th>
                  </tr>
                </thead>
                <tbody>
                  {highScores.map((entry, i) => (
                    <tr key={i} className="border-b border-border/20 text-muted-foreground hover:bg-card/40 transition-colors">
                      <td className="px-3 py-1.5 text-left">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                      </td>
                      <td className="px-3 py-1.5 text-right font-display">{entry.score.toLocaleString()}</td>
                      <td className="px-3 py-1.5 text-right">{entry.level}</td>
                      <td className="px-3 py-1.5 text-right">{entry.kills}</td>
                      <td className="px-3 py-1.5 text-right">{entry.realms}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button
          onClick={onStartClick}
          className="group relative font-display text-sm sm:text-base md:text-lg tracking-[0.3em] uppercase px-6 sm:px-8 md:px-12 py-2 sm:py-3 md:py-4 rounded-lg transition-all duration-300 active:scale-95 border border-primary/30 text-primary hover:border-primary/60"
          style={{
            background: 'linear-gradient(135deg, hsl(42 90% 55% / 0.08), hsl(42 90% 55% / 0.02))',
          }}
        >
          <span className="relative z-10">Begin Adventure</span>
          <div
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: '0 0 30px hsl(42 90% 55% / 0.2), 0 0 60px hsl(42 90% 55% / 0.1)' }}
          />
        </button>

        <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 text-[8px] sm:text-[9px] md:text-[10px] font-body text-muted-foreground/40 uppercase tracking-wider justify-center">
          <span>WASD to move</span>
          <span>1-4 switch elements</span>
          <span>Space to attack</span>
        </div>
      </div>
    </div>
  );
}
