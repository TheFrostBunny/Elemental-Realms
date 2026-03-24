
let spawnEnemiesInProgress = false;
export async function spawnEnemies(realm: string, count: number): Promise<any[]> {
  console.log('[wasm.ts] spawnEnemies called with:', { realm, count, typeof_realm: typeof realm, typeof_count: typeof count });
  console.trace('[wasm.ts] spawnEnemies call stack');
  
  // Create safe copies to prevent memory corruption
  const safeRealm = String(realm).slice(); // Force string copy
  const safeCount = Number(count) >>> 0;   // Convert to unsigned 32-bit integer
  
  console.log('[wasm.ts] Safe copies:', { safeRealm, safeCount, originalRealm: realm, originalCount: count });
  
  // Validate inputs after copying
  if (!safeRealm || typeof safeRealm !== 'string' || !['fire','water','earth','air'].includes(safeRealm)) {
    console.error('[wasm.ts] Invalid realm after copy:', safeRealm, 'returning empty array');
    return []; // Return empty instead of calling WASM with corrupted data
  }
  if (!safeCount || typeof safeCount !== 'number' || safeCount <= 0) {
    console.error('[wasm.ts] Invalid count after copy:', safeCount, 'returning empty array');
    return []; // Return empty instead of calling WASM with corrupted data
  }
  
  // Prevent multiple simultaneous calls
  if (spawnEnemiesInProgress) {
    console.warn('[wasm.ts] spawnEnemies already in progress, ignoring call');
    return [];
  }
  
  spawnEnemiesInProgress = true;
  try {
    const w = await loadWasm();
    console.log('[wasm.ts] About to call w.spawn_enemies with safe copies:', { safeRealm, safeCount });
    console.log('[wasm.ts] WASM module state:', { loaded: !!w, hasFunction: !!(w && w.spawn_enemies) });
    
    // Defer WASM call to next tick to ensure string allocation is complete
    const result = await new Promise<any[]>((resolve, reject) => {
      setTimeout(async () => {
        try {
          // Use safe copies for WASM call with explicit string literal
          const realmLiteral = safeRealm === 'fire' ? 'fire' : 
                              safeRealm === 'water' ? 'water' :
                              safeRealm === 'earth' ? 'earth' :
                              safeRealm === 'air' ? 'air' : 'fire';
          console.log('[wasm.ts] Using realm literal:', realmLiteral);
          const wasmResult = Array.from(w.spawn_enemies(realmLiteral, safeCount));
          resolve(wasmResult);
        } catch (error) {
          reject(error);
        }
      }, 0);
    });
    
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
  
  // Create safe copies to prevent memory corruption
  const safeRealm = String(realm).slice(); // Force string copy
  const safeCount = Number(count) >>> 0;   // Convert to unsigned 32-bit integer
  
  console.log('[wasm.ts] Safe copies for collectibles:', { safeRealm, safeCount, originalRealm: realm, originalCount: count });
  
  // Validate inputs after copying
  if (!safeRealm || typeof safeRealm !== 'string' || !['fire','water','earth','air'].includes(safeRealm)) {
    console.error('[wasm.ts] Invalid realm for collectibles:', safeRealm, 'returning empty array');
    return []; // Return empty instead of calling WASM with corrupted data
  }
  if (!safeCount || typeof safeCount !== 'number' || safeCount <= 0) {
    console.error('[wasm.ts] Invalid count for collectibles:', safeCount, 'returning empty array');
    return []; // Return empty instead of calling WASM with corrupted data
  }
  
  // Prevent multiple simultaneous calls
  if (spawnCollectiblesInProgress) {
    console.warn('[wasm.ts] spawnCollectibles already in progress, ignoring call');
    return [];
  }
  
  spawnCollectiblesInProgress = true;
  try {
    const w = await loadWasm();
    console.log('[wasm.ts] About to call w.spawn_collectibles with safe copies:', { safeRealm, safeCount });
    
    // Defer WASM call to next tick to ensure string allocation is complete
    const result = await new Promise<any[]>((resolve, reject) => {
      setTimeout(async () => {
        try {
          // Use safe copies for WASM call with explicit string literal
          const realmLiteral = safeRealm === 'fire' ? 'fire' : 
                              safeRealm === 'water' ? 'water' :
                              safeRealm === 'earth' ? 'earth' :
                              safeRealm === 'air' ? 'air' : 'fire';
          console.log('[wasm.ts] Using collectibles realm literal:', realmLiteral);
          const wasmResult = Array.from(w.spawn_collectibles(realmLiteral, safeCount));
          resolve(wasmResult);
        } catch (error) {
          reject(error);
        }
      }, 0);
    });
    
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
