import React from 'react';

export function EnemyHealthBar({ healthPercent }: { healthPercent: number }) {
  return (
    <group position={[0, 1, 0]}>
      <mesh>
        <planeGeometry args={[0.8, 0.08]} />
        <meshBasicMaterial color="#333" transparent opacity={0.8} />
      </mesh>
      <mesh position={[(healthPercent - 1) * 0.4, 0, 0.01]}>
        <planeGeometry args={[0.8 * healthPercent, 0.08]} />
        <meshBasicMaterial color={healthPercent > 0.5 ? '#4ade80' : healthPercent > 0.25 ? '#fbbf24' : '#ef4444'} />
      </mesh>
    </group>
  );
}
