import { GameStats } from './types';
import { getHighScores, HighScoreEntry } from './highScores';

interface GameOverScreenProps {
  stats: GameStats;
  lastScore: { score: number; rank: number };
  onRestart: () => void;
  onMenu: () => void;
}

export function GameOverScreen({ stats, lastScore, onRestart, onMenu }: GameOverScreenProps) {
  const highScores = getHighScores();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6 text-center max-h-[90vh] overflow-y-auto px-4">
        <div>
          <h2 className="font-display text-4xl md:text-6xl text-destructive tracking-tight">
            Fallen
          </h2>
          <p className="mt-3 text-muted-foreground font-body text-sm">
            The elements have overwhelmed you...
          </p>
        </div>

        {/* Final score */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-3xl md:text-4xl font-display text-primary">{lastScore.score.toLocaleString()}</p>
          <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Final Score</p>
          {lastScore.rank > 0 && lastScore.rank <= 3 && (
            <p className="text-xs font-display text-yellow-400 mt-1 animate-pulse">
              🏆 #{lastScore.rank} on Leaderboard!
            </p>
          )}
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-4 bg-card/50 rounded-xl p-5 border border-border/50 min-w-[280px]">
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

        {/* High Scores Table */}
        {highScores.length > 0 && (
          <div className="w-full max-w-[320px]">
            <h3 className="font-display text-sm tracking-[0.2em] uppercase text-muted-foreground mb-3">
              🏆 Top Scores
            </h3>
            <div className="bg-card/30 rounded-xl border border-border/40 overflow-hidden">
              <table className="w-full text-[11px] font-body">
                <thead>
                  <tr className="border-b border-border/30 text-muted-foreground/70">
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-right">Score</th>
                    <th className="px-3 py-2 text-right">Lv</th>
                    <th className="px-3 py-2 text-right">Kills</th>
                    <th className="px-3 py-2 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {highScores.map((entry, i) => {
                    const isCurrentRun = entry.score === lastScore.score && i === lastScore.rank - 1;
                    return (
                      <tr
                        key={i}
                        className={`border-b border-border/20 transition-colors ${
                          isCurrentRun
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-card/40'
                        }`}
                      >
                        <td className="px-3 py-1.5 text-left">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                        </td>
                        <td className="px-3 py-1.5 text-right font-display">{entry.score.toLocaleString()}</td>
                        <td className="px-3 py-1.5 text-right">{entry.level}</td>
                        <td className="px-3 py-1.5 text-right">{entry.kills}</td>
                        <td className="px-3 py-1.5 text-right text-[9px] text-muted-foreground/50">
                          {formatDate(entry.date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
  } catch {
    return '';
  }
}
