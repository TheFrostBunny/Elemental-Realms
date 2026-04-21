import { describe, it, expect } from 'vitest';
import {
  calcXpToNext,
  calcDamage,
  ELEMENTS,
  ALL_REALMS,
  REALM_CONFIGS,
  REALM_BASE_ELEMENT,
  Element,
} from '../types';

describe('calcXpToNext', () => {
  it('returns 80 for level 1', () => {
    expect(calcXpToNext(1)).toBe(80);
  });

  it('scales exponentially with level', () => {
    const xp1 = calcXpToNext(1);
    const xp2 = calcXpToNext(2);
    const xp3 = calcXpToNext(3);
    expect(xp2).toBeGreaterThan(xp1);
    expect(xp3).toBeGreaterThan(xp2);
  });

  it('uses 1.4x growth factor', () => {
    // level 2: floor(80 * 1.4^1) = floor(112) = 112
    expect(calcXpToNext(2)).toBe(112);
    // level 3: floor(80 * 1.4^2) = floor(156.8) = 156
    expect(calcXpToNext(3)).toBe(156);
  });
});

describe('calcDamage', () => {
  it('returns base damage for neutral matchup', () => {
    // fire vs air — neither strength nor weakness
    expect(calcDamage(100, 'fire', 'air')).toBe(100);
  });

  it('doubles damage when attacker has strength advantage', () => {
    // fire is strong against earth
    expect(calcDamage(100, 'fire', 'earth')).toBe(200);
  });

  it('halves damage when attacker has weakness', () => {
    // fire is weak against water
    expect(calcDamage(100, 'fire', 'water')).toBe(50);
  });

  it('floors the result', () => {
    expect(calcDamage(33, 'fire', 'water')).toBe(16); // floor(33 * 0.5) = 16
  });

  it('works for all element matchups', () => {
    const elements: Element[] = ['fire', 'water', 'earth', 'air'];
    for (const attacker of elements) {
      for (const defender of elements) {
        const dmg = calcDamage(100, attacker, defender);
        expect(dmg).toBeGreaterThan(0);
        if (ELEMENTS[attacker].strength === defender) {
          expect(dmg).toBe(200);
        } else if (ELEMENTS[attacker].weakness === defender) {
          expect(dmg).toBe(50);
        } else {
          expect(dmg).toBe(100);
        }
      }
    }
  });
});

describe('ELEMENTS', () => {
  const elementNames: Element[] = ['fire', 'water', 'earth', 'air'];

  it('contains all 4 elements', () => {
    expect(Object.keys(ELEMENTS)).toHaveLength(4);
    for (const el of elementNames) {
      expect(ELEMENTS[el]).toBeDefined();
    }
  });

  it('each element has valid strength and weakness', () => {
    for (const el of elementNames) {
      const config = ELEMENTS[el];
      expect(elementNames).toContain(config.strength);
      expect(elementNames).toContain(config.weakness);
      expect(config.strength).not.toBe(el);
      expect(config.weakness).not.toBe(el);
    }
  });

  it('each element has required fields', () => {
    for (const el of elementNames) {
      const config = ELEMENTS[el];
      expect(config.name).toBeTruthy();
      expect(config.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(config.glowColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(config.key).toBeTruthy();
      expect(config.icon).toBeTruthy();
      expect(config.ability).toBeTruthy();
    }
  });
});

describe('ALL_REALMS', () => {
  it('contains 8 realms', () => {
    expect(ALL_REALMS).toHaveLength(8);
  });

  it('includes all base and extended realms', () => {
    expect(ALL_REALMS).toContain('fire');
    expect(ALL_REALMS).toContain('water');
    expect(ALL_REALMS).toContain('earth');
    expect(ALL_REALMS).toContain('air');
    expect(ALL_REALMS).toContain('shadow');
    expect(ALL_REALMS).toContain('lightning');
    expect(ALL_REALMS).toContain('ice');
    expect(ALL_REALMS).toContain('crystal');
  });
});

describe('REALM_CONFIGS', () => {
  it('has config for every realm in ALL_REALMS', () => {
    for (const realm of ALL_REALMS) {
      expect(REALM_CONFIGS[realm]).toBeDefined();
    }
  });

  it('each realm config has required properties', () => {
    for (const realm of ALL_REALMS) {
      const config = REALM_CONFIGS[realm];
      expect(config.name).toBeTruthy();
      expect(config.description).toBeTruthy();
      expect(config.groundColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(typeof config.enemySpeedMult).toBe('number');
      expect(typeof config.enemyHealthMult).toBe('number');
      expect(typeof config.enemyDamageMult).toBe('number');
      expect(typeof config.gravity).toBe('number');
    }
  });
});

describe('REALM_BASE_ELEMENT', () => {
  it('maps every realm to a valid base element', () => {
    const validElements: Element[] = ['fire', 'water', 'earth', 'air'];
    for (const realm of ALL_REALMS) {
      expect(validElements).toContain(REALM_BASE_ELEMENT[realm]);
    }
  });

  it('base realms map to themselves', () => {
    expect(REALM_BASE_ELEMENT['fire']).toBe('fire');
    expect(REALM_BASE_ELEMENT['water']).toBe('water');
    expect(REALM_BASE_ELEMENT['earth']).toBe('earth');
    expect(REALM_BASE_ELEMENT['air']).toBe('air');
  });
});
