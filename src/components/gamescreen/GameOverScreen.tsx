import { GameStats } from '../../game/types';
import { ScoreBox } from '../gameover/ScoreBox';
import { GameStatsBox } from '../gameover/GameStatsBox';
import { UiText } from '../ui/UiText';
import { GameOverActions } from '../gameover/GameOverActions';

interface GameOverScreenProps {
  stats: GameStats;
  previousScore: number;
  onRestart: () => void;
  onMenu: () => void;
}

export function GameOverScreen({ stats, previousScore, onRestart, onMenu }: GameOverScreenProps) {
  const scoreDiff = stats.score - previousScore;
  const isNewBest = stats.score > previousScore;
  const bestScore = Math.max(stats.score, Number(localStorage.getItem('bestScore') || '0'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="flex flex-col items-center gap-8 text-center">
        <div>
          <h2 className="font-display text-4xl md:text-6xl text-destructive tracking-tight">
            Fallen
          </h2>
          <UiText size="sm" color="muted" className="mt-3">
            The elements have overwhelmed you...
          </UiText>
        </div>
        
        <ScoreBox
          score={stats.score}
          previousScore={previousScore}
          bestScore={bestScore}
          isNewBest={isNewBest}
          scoreDiff={scoreDiff}
        />

        <GameStatsBox stats={stats} />

        <GameOverActions onRestart={onRestart} onMenu={onMenu} />
      </div>
    </div>
  );
}
