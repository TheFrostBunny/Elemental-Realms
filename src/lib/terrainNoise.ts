import { Realm } from '../game/types';

export function getTerrainHeight(x: number, z: number, realm: Realm): number {
  // Mer avansert terrengfunksjon med flere lag og variasjon
  let h = 0;
  h += Math.sin(x * 0.23 + Math.cos(z * 0.19)) * 1.1;
  h += Math.cos(z * 0.31 + Math.sin(x * 0.17)) * 0.7;
  h += Math.sin(x * 0.7 + 1) * Math.cos(z * 0.5 + 2) * 0.5;
  h += Math.sin((x + z) * 0.11) * 0.4;
  h += Math.cos((x - z) * 0.13) * 0.3;
  h += Math.sin(x * 0.045) * Math.cos(z * 0.045) * 1.2;

  // Realm-spesifikke variasjoner
  if (realm === 'ice') h *= 0.35;
  if (realm === 'crystal') h = Math.abs(h) * 1.9;
  if (realm === 'shadow') h *= 0.13;
  if (realm === 'lightning') h += Math.sin(x * 2.2) * 0.45;

  return h;
}
