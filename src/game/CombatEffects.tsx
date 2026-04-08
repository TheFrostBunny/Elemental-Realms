import { Element, AttackEffect } from './types';
import { SlashEffect } from '../components/effects/SlashEffect';
import { ProjectileEffect } from '../components/effects/ProjectileEffect';
import { AoeEffect } from '../components/effects/AoeEffect';
import { DashTrailEffect } from '../components/effects/DashTrailEffect';


export type { AttackEffect };

interface CombatEffectsProps {
  effects: AttackEffect[];
}

export function CombatEffects({ effects }: CombatEffectsProps) {
  return (
    <group>
      {effects.map((effect) => {
        switch (effect.type) {
          case 'slash':
            return <SlashEffect key={effect.id} effect={effect} />;
          case 'projectile':
            return <ProjectileEffect key={effect.id} effect={effect} />;
          case 'aoe':
            return <AoeEffect key={effect.id} effect={effect} />;
          case 'dash_trail':
            return <DashTrailEffect key={effect.id} effect={effect} />;
          default:
            return null;
        }
      })}
    </group>
  );
}