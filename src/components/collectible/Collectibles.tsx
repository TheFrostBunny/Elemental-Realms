import React from 'react';
import { CollectibleData } from '../../game/types';
import { Collectible } from './Collectible';

interface CollectiblesProps {
  collectibles: CollectibleData[];
}

export function Collectibles({ collectibles }: CollectiblesProps) {
  return (
    <group>
      {collectibles.map(item => (
        <Collectible key={item.id} item={item} />
      ))}
    </group>
  );
}
