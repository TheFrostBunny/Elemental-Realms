export interface HighScoreEntry {
  score: number;
  level: number;
  kills: number;
  realms: number;
  date: string;
}

const STORAGE_KEY = 'elemental-realms-highscores';
const MAX_ENTRIES = 10;

export function getHighScores(): HighScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function addHighScore(entry: HighScoreEntry): { rank: number; isNew: boolean } {
  const scores = getHighScores();
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  const trimmed = scores.slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full or unavailable
  }

  const rank = trimmed.findIndex(
    (s) => s.score === entry.score && s.date === entry.date
  );
  return { rank: rank + 1, isNew: rank !== -1 };
}

export function clearHighScores(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Compute a score from raw game stats */
export function computeScore(kills: number, level: number, realmsVisited: number): number {
  return kills * 100 + level * 500 + realmsVisited * 250;
}
