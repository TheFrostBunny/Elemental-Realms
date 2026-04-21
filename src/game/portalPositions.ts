import { Realm } from './types';

// 8 portals: cardinals + diagonals
export const PORTAL_POSITIONS: Record<Realm, [number, number, number]> = {
  fire: [15, 1.5, 0],
  water: [-15, 1.5, 0],
  earth: [0, 1.5, 15],
  air: [0, 1.5, -15],
  shadow: [11, 1.5, 11],
  lightning: [-11, 1.5, -11],
  ice: [-11, 1.5, 11],
  crystal: [11, 1.5, -11],
};

// Visual configs for extended realms
export const REALM_PORTAL_COLORS: Record<Realm, { color: string; glow: string }> = {
  fire: { color: '#e8541a', glow: '#ff8533' },
  water: { color: '#0ea5c9', glow: '#38bdf8' },
  earth: { color: '#22915a', glow: '#4ade80' },
  air: { color: '#94a8be', glow: '#bfcfdf' },
  shadow: { color: '#6b00b3', glow: '#9b30ff' },
  lightning: { color: '#cccc00', glow: '#ffff44' },
  ice: { color: '#44aadd', glow: '#88ddff' },
  crystal: { color: '#cc22cc', glow: '#ff66ff' },
};
