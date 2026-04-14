import React from 'react';

interface ScoreBoxProps {
  score: number;
  previousScore: number;
  bestScore: number;
  isNewBest: boolean;
  scoreDiff: number;
}

export const ScoreBox: React.FC<ScoreBoxProps> = ({ score, previousScore, bestScore, isNewBest, scoreDiff }) => (
  <div className="bg-card/70 rounded-xl p-6 border border-border/50 min-w-[300px]">
    <div className="text-center mb-4">
      <p className="text-3xl font-display text-primary mb-1">{score.toLocaleString()}</p>
      <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Final Score</p>
    </div>
    {previousScore > 0 && (
      <div className="text-center border-t border-border/30 pt-3">
        {isNewBest ? (
          <div className="text-green-400">
            <p className="text-sm font-display">🎉 New Personal Best!</p>
            <p className="text-xs text-muted-foreground">+{scoreDiff.toLocaleString()} points better</p>
          </div>
        ) : (
          <div className="text-orange-400">
            <p className="text-sm font-display">Previous: {previousScore.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{scoreDiff.toLocaleString()} points difference</p>
          </div>
        )}
      </div>
    )}
    <div className="text-center border-t border-border/30 pt-3 mt-3">
      <p className="text-xs text-muted-foreground">Best: {bestScore.toLocaleString()}</p>
    </div>
  </div>
);
