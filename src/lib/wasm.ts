
let spawnEnemiesInProgress = false;
export async function spawnEnemies(realm: string, count: number): Promise<any[]> {
  console.log('[wasm.ts] spawnEnemies called with:', { realm, count, typeof_realm: typeof realm, typeof_count: typeof count });
  console.trace('[wasm.ts] spawnEnemies call stack');
  
  // Validate inputs
  if (!realm || typeof realm !== 'string' || !['fire','water','earth','air'].includes(realm)) {
    console.error('[wasm.ts] Invalid realm:', realm, 'defaulting to fire');
    realm = 'fire';
  }
  if (!count || typeof count !== 'number' || count <= 0) {
    console.error('[wasm.ts] Invalid count:', count, 'defaulting to 8');
    count = 8;
  }
  
  // Prevent multiple simultaneous calls
  if (spawnEnemiesInProgress) {
    console.warn('[wasm.ts] spawnEnemies already in progress, ignoring call');
    return [];
  }
  
  spawnEnemiesInProgress = true;
  try {
    const w = await loadWasm();
    console.log('[wasm.ts] About to call w.spawn_enemies with:', { realm, count });
    console.log('[wasm.ts] WASM module state:', { loaded: !!w, hasFunction: !!(w && w.spawn_enemies) });
    const result = Array.from(w.spawn_enemies(realm, count));
    console.log('[wasm.ts] spawnEnemies result:', result);
    return result;
  } catch (error) {
    console.error('[wasm.ts] spawnEnemies error:', error);
    return [];
  } finally {
    spawnEnemiesInProgress = false;
  }
}


let spawnCollectiblesInProgress = false;
export async function spawnCollectibles(realm: string, count: number): Promise<any[]> {
  console.log('[wasm.ts] spawnCollectibles called with:', { realm, count });
  
  // Validate inputs
  if (!realm || typeof realm !== 'string' || !['fire','water','earth','air'].includes(realm)) {
    console.error('[wasm.ts] Invalid realm:', realm, 'defaulting to fire');
    realm = 'fire';
  }
  if (!count || typeof count !== 'number' || count <= 0) {
    console.error('[wasm.ts] Invalid count:', count, 'defaulting to 6');
    count = 6;
  }
  
  // Prevent multiple simultaneous calls
  if (spawnCollectiblesInProgress) {
    console.warn('[wasm.ts] spawnCollectibles already in progress, ignoring call');
    return [];
  }
  
  spawnCollectiblesInProgress = true;
  try {
    const w = await loadWasm();
    const result = Array.from(w.spawn_collectibles(realm, count));
    console.log('[wasm.ts] spawnCollectibles result:', result);
    return result;
  } catch (error) {
    console.error('[wasm.ts] spawnCollectibles error:', error);
    return [];
  } finally {
    spawnCollectiblesInProgress = false;
  }
}
// Loader for wasm-modulen bygget med wasm-pack
// Husk å bygge wasm først: kjør build-wasm.bat i wasm-mappen

let wasm: any = null;

export async function loadWasm() {
  if (wasm) return wasm;
  // Juster path hvis wasm-modulen havner et annet sted etter bygg
  const wasmModule = await import('../../wasm/pkg/game_logic');
  wasm = await wasmModule.default();
  return wasm;
}

export async function calcXpToNext(level: number): Promise<number> {
  const w = await loadWasm();
  return w.calc_xp_to_next(level);
}

export async function calcDamage(attackPower: number, attackerElement: string, defenderElement: string): Promise<number> {
  const w = await loadWasm();
  return w.calc_damage(attackPower, attackerElement, defenderElement);
}
