import React from 'react';
import { EnemyData } from '../../game/types';
import { Enemy } from './Enemy';

interface EnemiesProps {
  enemies: EnemyData[];
}

export default function Enemies({ enemies }: EnemiesProps) {
  return (
    <group>
      {enemies.map(enemy => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}
    </group>
  );
}
