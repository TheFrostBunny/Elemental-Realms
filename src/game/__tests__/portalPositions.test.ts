import { describe, it, expect } from 'vitest';
import { PORTAL_POSITIONS, REALM_PORTAL_COLORS } from '../portalPositions';
import { ALL_REALMS } from '../types';

describe('PORTAL_POSITIONS', () => {
  it('has a position for every realm', () => {
    for (const realm of ALL_REALMS) {
      expect(PORTAL_POSITIONS[realm]).toBeDefined();
    }
  });

  it('each position is a 3-element number array', () => {
    for (const realm of ALL_REALMS) {
      const pos = PORTAL_POSITIONS[realm];
      expect(pos).toHaveLength(3);
      pos.forEach((coord) => {
        expect(typeof coord).toBe('number');
      });
    }
  });

  it('all positions are unique', () => {
    const posStrings = ALL_REALMS.map((r) => PORTAL_POSITIONS[r].join(','));
    const unique = new Set(posStrings);
    expect(unique.size).toBe(ALL_REALMS.length);
  });
});

describe('REALM_PORTAL_COLORS', () => {
  it('has colors for every realm', () => {
    for (const realm of ALL_REALMS) {
      expect(REALM_PORTAL_COLORS[realm]).toBeDefined();
    }
  });

  it('each realm has valid hex color and glow', () => {
    const hexRegex = /^#[0-9a-fA-F]{6}$/;
    for (const realm of ALL_REALMS) {
      const { color, glow } = REALM_PORTAL_COLORS[realm];
      expect(color).toMatch(hexRegex);
      expect(glow).toMatch(hexRegex);
    }
  });
});
