import initWasm, {
  init_game,
  switch_element as wasm_switch_element,
  move_player as wasm_move_player,
  player_attack as wasm_player_attack,
  tick as wasm_tick,
  get_state,
  drain_events,
  Element as WasmElement,
} from '@/lib/wasm/elemental-realms/elemental_realms';
import type { Element, Realm, EnemyData, CollectibleData, EnemyArchetype } from './types';

let wasmReady = false;

export async function initializeWasm(): Promise<void> {
  if (wasmReady) return;
  await initWasm();
  wasmReady = true;
}

export function isWasmReady(): boolean {
  return wasmReady;
}

// Element mapping
const ELEMENT_TO_WASM: Record<Element, number> = {
  fire: WasmElement.Fire,
  water: WasmElement.Water,
  earth: WasmElement.Earth,
  air: WasmElement.Air,
};

const WASM_TO_ELEMENT: Record<number, Element> = {
  [WasmElement.Fire]: 'fire',
  [WasmElement.Water]: 'water',
  [WasmElement.Earth]: 'earth',
  [WasmElement.Air]: 'air',
};

const CTYPE_MAP: Record<number, 'health' | 'xp' | 'element_shard'> = {
  0: 'health',
  1: 'xp',
  2: 'element_shard',
};

const ENEMY_ARCHETYPES: EnemyArchetype[] = ['scout', 'brute', 'striker', 'tank', 'mystic'];
const MINIBOSS_HEALTH_MULTIPLIER = 1.35;
const MINIBOSS_DAMAGE_MULTIPLIER = 1.25;
const MINIBOSS_SPEED_MULTIPLIER = 1.1;

type RawEnemy = {
  id?: string;
  element?: number;
  x?: number;
  y?: number;
  z?: number;
  health?: number;
  max_health?: number;
  speed?: number;
  damage?: number;
  xp_reward?: number;
  dead?: boolean;
  death_time?: number;
  attack_cooldown?: number;
  last_attack_time?: number;
};

type RawCollectible = {
  id?: string;
  ctype?: number;
  element?: number;
  x?: number;
  y?: number;
  z?: number;
  collected?: boolean;
};

type RawState = {
  player_x?: number;
  player_y?: number;
  player_z?: number;
  player_health?: number;
  player_max_health?: number;
  player_attack_power?: number;
  player_element?: number;
  player_level?: number;
  player_xp?: number;
  player_xp_to_next?: number;
  player_kills?: number;
  current_realm?: number;
  realms_visited?: number;
  enemies?: RawEnemy[];
  collectibles?: RawCollectible[];
};

type RawEventPayload = {
  level?: number;
  msg?: string;
  id?: string;
  ctype?: number;
};

type RawEvent = string | {
  LevelUp?: RawEventPayload;
  Notification?: RawEventPayload;
  EnemyKilled?: RawEventPayload;
  ItemCollected?: RawEventPayload;
};

function hashEnemyId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function classifyEnemyArchetype(e: RawEnemy): EnemyArchetype {
  const healthScore = (e.max_health || 0) * 0.7 + (e.health || 0) * 0.3;
  const damageScore = (e.damage || 0) * 10;
  const speedScore = (e.speed || 0) * 120;

  const weighted = [
    { type: 'tank' as const, score: healthScore * 1.25 + damageScore * 0.2 },
    { type: 'striker' as const, score: damageScore * 1.2 + speedScore * 0.35 },
    { type: 'scout' as const, score: speedScore * 1.3 + damageScore * 0.15 },
    { type: 'brute' as const, score: healthScore * 0.9 + damageScore * 0.95 },
    { type: 'mystic' as const, score: damageScore * 0.65 + speedScore * 0.65 + healthScore * 0.35 },
  ];

  weighted.sort((a, b) => b.score - a.score);
  if (Math.abs(weighted[0].score - weighted[1].score) > 8) {
    return weighted[0].type;
  }

  const hash = hashEnemyId(e.id || '');
  return ENEMY_ARCHETYPES[hash % ENEMY_ARCHETYPES.length];
}

function diversifyArchetype(primary: EnemyArchetype, id: string, idx: number): EnemyArchetype {
  const hash = hashEnemyId(`${id}-${idx}`);
  // Keep stat-based role in most cases, but inject variety often enough.
  if (hash % 100 < 60) return primary;
  return ENEMY_ARCHETYPES[hash % ENEMY_ARCHETYPES.length];
}

function applyArchetypeStats(enemy: EnemyData): EnemyData {
  const multipliers: Record<Exclude<EnemyArchetype, 'miniBoss'>, { hp: number; dmg: number; speed: number; xp: number }> = {
    scout: { hp: 0.8, dmg: 0.9, speed: 1.25, xp: 1.0 },
    brute: { hp: 1.2, dmg: 1.15, speed: 0.9, xp: 1.1 },
    striker: { hp: 0.95, dmg: 1.3, speed: 1.1, xp: 1.1 },
    tank: { hp: 1.35, dmg: 1.05, speed: 0.85, xp: 1.15 },
    mystic: { hp: 1.0, dmg: 1.15, speed: 1.05, xp: 1.1 },
  };
  const m = multipliers[enemy.archetype as Exclude<EnemyArchetype, 'miniBoss'>];
  if (!m) return enemy;
  return {
    ...enemy,
    health: Math.max(1, Math.floor(enemy.health * m.hp)),
    maxHealth: Math.max(1, Math.floor(enemy.maxHealth * m.hp)),
    damage: Math.max(1, Math.floor(enemy.damage * m.dmg)),
    speed: Number((enemy.speed * m.speed).toFixed(2)),
    xpReward: Math.max(1, Math.floor(enemy.xpReward * m.xp)),
  };
}

function enemyPowerScore(e: EnemyData): number {
  return e.maxHealth * 0.8 + e.health * 0.4 + e.damage * 14 + e.speed * 130;
}

export function wasmInitGame(): void {
  init_game();
}

export function wasmSwitchElement(el: Element): void {
  wasm_switch_element(ELEMENT_TO_WASM[el]);
}

export function wasmMovePlayer(dx: number, dz: number, delta: number): void {
  wasm_move_player(dx, dz, delta);
}

export function wasmPlayerAttack(): void {
  wasm_player_attack();
}

export function wasmTick(now: number, delta: number): void {
  wasm_tick(now, delta);
}

export interface WasmGameState {
  playerX: number;
  playerY: number;
  playerZ: number;
  playerHealth: number;
  playerMaxHealth: number;
  playerAttackPower: number;
  playerElement: Element;
  playerLevel: number;
  playerXp: number;
  playerXpToNext: number;
  playerKills: number;
  currentRealm: Realm;
  enemies: EnemyData[];
  collectibles: CollectibleData[];
  realmsVisited: Set<Realm>;
}

export function wasmGetState(): WasmGameState {
  const raw = get_state() as RawState;

  const enemies: EnemyData[] = (raw.enemies || []).map((e, idx) => {
    const id = e.id || `enemy-${idx}`;
    const primaryArchetype = classifyEnemyArchetype(e);
    const archetype = diversifyArchetype(primaryArchetype, id, idx);
    const mapped: EnemyData = {
      id,
      element: WASM_TO_ELEMENT[e.element] || 'fire',
      archetype,
      position: [e.x || 0, e.y || 0, e.z || 0] as [number, number, number],
      health: e.health || 0,
      maxHealth: e.max_health || 1,
      speed: e.speed || 0,
      damage: e.damage || 0,
      xpReward: e.xp_reward || 0,
      dead: !!e.dead,
      deathTime: e.death_time || undefined,
      attackCooldown: e.attack_cooldown || 0,
      lastAttackTime: e.last_attack_time || 0,
    };
    return applyArchetypeStats(mapped);
  });

  // Promote one currently alive enemy to mini-boss for extra encounter variety.
  const miniBossCandidateIndex = enemies.reduce((bestIdx, enemy, idx, arr) => {
    if (enemy.dead) return bestIdx;
    if (bestIdx === -1) return idx;
    return enemyPowerScore(enemy) > enemyPowerScore(arr[bestIdx]) ? idx : bestIdx;
  }, -1);

  if (miniBossCandidateIndex >= 0) {
    const base = enemies[miniBossCandidateIndex];
    enemies[miniBossCandidateIndex] = {
      ...base,
      archetype: 'miniBoss',
      health: Math.floor(base.health * MINIBOSS_HEALTH_MULTIPLIER),
      maxHealth: Math.floor(base.maxHealth * MINIBOSS_HEALTH_MULTIPLIER),
      damage: Math.floor(base.damage * MINIBOSS_DAMAGE_MULTIPLIER),
      speed: Number((base.speed * MINIBOSS_SPEED_MULTIPLIER).toFixed(2)),
      xpReward: Math.floor(base.xpReward * 1.4),
    };
  }

  const collectibles: CollectibleData[] = (raw.collectibles || []).map((c, idx) => ({
    id: c.id || `collectible-${idx}`,
    type: CTYPE_MAP[c.ctype] || 'xp',
    element: WASM_TO_ELEMENT[c.element],
    position: [c.x || 0, c.y || 0, c.z || 0] as [number, number, number],
    collected: !!c.collected,
  }));

  // Decode realms visited bitmask
  const visited = new Set<Realm>();
  const elements: Realm[] = ['fire', 'water', 'earth', 'air'];
  for (let i = 0; i < 4; i++) {
    if ((raw.realms_visited || 0) & (1 << i)) {
      visited.add(elements[i]);
    }
  }

  return {
    playerX: raw.player_x || 0,
    playerY: raw.player_y || 0,
    playerZ: raw.player_z || 0,
    playerHealth: raw.player_health || 100,
    playerMaxHealth: raw.player_max_health || 100,
    playerAttackPower: raw.player_attack_power || 20,
    playerElement: WASM_TO_ELEMENT[raw.player_element] || 'fire',
    playerLevel: raw.player_level || 1,
    playerXp: raw.player_xp || 0,
    playerXpToNext: raw.player_xp_to_next || 80,
    playerKills: raw.player_kills || 0,
    currentRealm: WASM_TO_ELEMENT[raw.current_realm] as Realm || 'fire',
    enemies,
    collectibles,
    realmsVisited: visited,
  };
}

export interface GameEvent {
  type: 'DamageFlash' | 'LevelUp' | 'Notification' | 'GameOver' | 'EnemyKilled' | 'ItemCollected';
  level?: number;
  msg?: string;
  id?: string;
  ctype?: number;
}

export function wasmDrainEvents(): GameEvent[] {
  const raw = drain_events() as unknown;
  if (!Array.isArray(raw)) return [];
  return (raw as RawEvent[]).map((e) => {
    if (typeof e === 'string') {
      return { type: e } as GameEvent;
    }
    // Serde serializes enums with data as { VariantName: { fields } }
    if (e.LevelUp) return { type: 'LevelUp' as const, level: e.LevelUp.level };
    if (e.Notification) return { type: 'Notification' as const, msg: e.Notification.msg };
    if (e.EnemyKilled) return { type: 'EnemyKilled' as const, id: e.EnemyKilled.id };
    if (e.ItemCollected) return { type: 'ItemCollected' as const, id: e.ItemCollected.id, ctype: e.ItemCollected.ctype };
    return { type: 'Notification', msg: 'Unknown event' } as GameEvent;
  });
}
