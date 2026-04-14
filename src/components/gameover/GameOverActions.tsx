import React from 'react';

interface GameOverActionsProps {
  onRestart: () => void;
  onMenu: () => void;
}

export const GameOverActions: React.FC<GameOverActionsProps> = ({ onRestart, onMenu }) => (
  <div className="flex gap-4">
    <button
      onClick={onRestart}
      className="font-display text-sm tracking-[0.2em] uppercase px-8 py-3 rounded-lg border border-primary/40 text-primary hover:border-primary/70 transition-all active:scale-95"
      style={{ background: 'linear-gradient(135deg, hsl(42 90% 55% / 0.1), transparent)' }}
    >
      Try Again
    </button>
    <button
      onClick={onMenu}
      className="font-body text-sm px-6 py-3 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground transition-all active:scale-95"
    >
      Main Menu
    </button>
  </div>
);
