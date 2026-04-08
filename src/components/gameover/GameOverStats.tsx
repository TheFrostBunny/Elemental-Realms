import React from 'react';
import { GameStats } from '../../game/types';
import { GameOverStatBox } from '../ui/gameoverstatbox';

export function GameOverStats({ stats }: { stats: GameStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 bg-card/50 rounded-xl p-6 border border-border/50 min-w-[280px]">
      <GameOverStatBox value={stats.level} label="Level" />
      <GameOverStatBox value={stats.kills} label="Kills" />
      <div className="text-center">
        <p className="text-2xl font-display text-primary">{stats.realmsVisited.size}</p>
        <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Realms</p>
      </div>
      <GameOverStatBox value={stats.attackPower} label="ATK Power" />
    </div>
  );
}
