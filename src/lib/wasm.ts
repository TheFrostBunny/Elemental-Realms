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
