import React from 'react';
import { GameStats } from '../../game/types';

interface GameStatsBoxProps {
  stats: GameStats;
}

export const GameStatsBox: React.FC<GameStatsBoxProps> = ({ stats }) => (
  <div className="grid grid-cols-2 gap-4 bg-card/50 rounded-xl p-6 border border-border/50 min-w-[280px]">
    <div className="text-center">
      <p className="text-2xl font-display text-primary">{stats.level}</p>
      <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Level</p>
    </div>
    <div className="text-center">
      <p className="text-2xl font-display text-primary">{stats.kills}</p>
      <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Kills</p>
    </div>
    <div className="text-center">
      <p className="text-2xl font-display text-primary">{stats.realmsVisited.size}</p>
      <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Realms</p>
    </div>
    <div className="text-center">
      <p className="text-2xl font-display text-primary">{stats.attackPower}</p>
      <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">ATK Power</p>
    </div>
  </div>
);
