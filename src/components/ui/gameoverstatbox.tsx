import React from 'react';

interface GameOverStatBoxProps {
  value: React.ReactNode;
  label: string;
}

export function GameOverStatBox({ value, label }: GameOverStatBoxProps) {
  return (
    <div className="text-center">
      <p className="text-2xl font-display text-primary">{value}</p>
      <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}
