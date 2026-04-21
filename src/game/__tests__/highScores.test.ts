import { describe, it, expect, beforeEach } from 'vitest';
import { computeScore, getHighScores, addHighScore, clearHighScores } from '../highScores';

describe('computeScore', () => {
  it('returns 0 for zero stats', () => {
    expect(computeScore(0, 0, 0)).toBe(0);
  });

  it('weights kills, level, and realms correctly', () => {
    // kills*100 + level*500 + realms*250
    expect(computeScore(10, 5, 3)).toBe(10 * 100 + 5 * 500 + 3 * 250);
  });

  it('increases with more kills', () => {
    expect(computeScore(20, 1, 1)).toBeGreaterThan(computeScore(10, 1, 1));
  });
});

describe('high scores persistence', () => {
  beforeEach(() => {
    clearHighScores();
  });

  it('starts with empty scores', () => {
    expect(getHighScores()).toEqual([]);
  });

  it('adds and retrieves a score', () => {
    addHighScore({ score: 1000, level: 5, kills: 10, realms: 2, date: '2025-01-01T00:00:00Z' });
    const scores = getHighScores();
    expect(scores).toHaveLength(1);
    expect(scores[0].score).toBe(1000);
  });

  it('sorts scores descending', () => {
    addHighScore({ score: 500, level: 2, kills: 5, realms: 1, date: '2025-01-01T00:00:00Z' });
    addHighScore({ score: 1500, level: 8, kills: 15, realms: 3, date: '2025-01-02T00:00:00Z' });
    addHighScore({ score: 800, level: 4, kills: 8, realms: 2, date: '2025-01-03T00:00:00Z' });
    const scores = getHighScores();
    expect(scores[0].score).toBe(1500);
    expect(scores[1].score).toBe(800);
    expect(scores[2].score).toBe(500);
  });

  it('returns correct rank', () => {
    addHighScore({ score: 500, level: 2, kills: 5, realms: 1, date: '2025-01-01T00:00:00Z' });
    const result = addHighScore({ score: 1000, level: 5, kills: 10, realms: 2, date: '2025-01-02T00:00:00Z' });
    expect(result.rank).toBe(1); // 1000 > 500, so rank 1
    expect(result.isNew).toBe(true);
  });

  it('limits to 10 entries', () => {
    for (let i = 0; i < 15; i++) {
      addHighScore({ score: i * 100, level: i, kills: i, realms: 1, date: `2025-01-${(i + 1).toString().padStart(2, '0')}T00:00:00Z` });
    }
    const scores = getHighScores();
    expect(scores.length).toBeLessThanOrEqual(10);
  });

  it('clearHighScores empties the list', () => {
    addHighScore({ score: 1000, level: 5, kills: 10, realms: 2, date: '2025-01-01T00:00:00Z' });
    clearHighScores();
    expect(getHighScores()).toEqual([]);
  });
});
