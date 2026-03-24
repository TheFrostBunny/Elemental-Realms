import React, { useRef, useCallback, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnemyData, ELEMENTS } from './types';

interface EnemiesProps {
  enemies: EnemyData[];
  playerRef: React.MutableRefObject<THREE.Group | null>;
  onEnemyAttackPlayer: (damage: number) => void;
  setEnemies: React.Dispatch<React.SetStateAction<EnemyData[]>>;
  onAttackEnemy: (id: string) => void;
}
const Enemy = React.memo(function Enemy({ enemy, playerRef, onEnemyAttackPlayer, updateEnemy, onAttackEnemy }: {
  enemy: EnemyData;
  playerRef: React.MutableRefObject<THREE.Group | null>;
  onEnemyAttackPlayer: (damage: number) => void;
  updateEnemy: (id: string, updates: Partial<EnemyData>) => void;
  onAttackEnemy: (id: string) => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const config = ELEMENTS[enemy.element];

  const [ringRotation, setRingRotation] = useState(0);
  const [deathAnim, setDeathAnim] = useState({ elapsed: 0, fade: 1 });

  useFrame((_, delta) => {
    if (!meshRef.current || !playerRef.current) return;

    // Animate ring
    setRingRotation(r => r + delta * 1.2);

    if (enemy.dead) {
      // Death animation
      if (enemy.deathTime) {
        const elapsed = Date.now() - enemy.deathTime;
        if (elapsed > 1500) return;
        setDeathAnim({ elapsed, fade: 1 - elapsed / 1500 });
      }
      return;
    }

    const playerPos = playerRef.current.position;
    const enemyPos = meshRef.current.position;
    const dir = new THREE.Vector3().subVectors(playerPos, enemyPos);
    const dist = dir.length();

    // Chase player if within range
    if (dist < 12 && dist > 1.5) {
      dir.normalize().multiplyScalar(enemy.speed * delta);
      dir.y = 0;
      meshRef.current.position.add(dir);
      meshRef.current.lookAt(playerPos.x, meshRef.current.position.y, playerPos.z);
    }

    // Attack player if close
    if (dist < 2) {
      const now = Date.now();
      if (now - enemy.lastAttackTime > enemy.attackCooldown) {
        onEnemyAttackPlayer(enemy.damage);
        updateEnemy(enemy.id, { lastAttackTime: now });
      }
    }

    // Bobbing
    meshRef.current.position.y = 0.6 + Math.sin(performance.now() * 0.004 + enemy.position[0]) * 0.15;
  });

  if (enemy.dead) {
    // Death particles - show briefly then remove
    if (deathAnim.elapsed > 1500) return null;
    return (
      <mesh position={enemy.position}>
        <sphereGeometry args={[0.5 + (1 - deathAnim.fade) * 2, 8, 8]} />
        <meshStandardMaterial
          color={config.glowColor}
          emissive={config.glowColor}
          emissiveIntensity={3 * deathAnim.fade}
          transparent
          opacity={deathAnim.fade * 0.5}
        />
      </mesh>
    );
  }

  const healthPercent = enemy.health / enemy.maxHealth;

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (!enemy.dead) {
      onAttackEnemy(enemy.id);
    }
  };

  return (
    <group ref={meshRef} position={enemy.position} onPointerDown={handlePointerDown}>
      {/* Body - spiky for enemies */}
      <mesh castShadow>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={0.4}
          roughness={0.4}
          metalness={0.5}
        />
      </mesh>
      {/* Rotating ring */}
      <mesh rotation={[Math.PI / 4, ringRotation, 0]}>
        <torusGeometry args={[0.6, 0.05, 8, 16]} />
        <meshStandardMaterial color={config.glowColor} emissive={config.glowColor} emissiveIntensity={1} transparent opacity={0.6} />
      </mesh>
      {/* Health bar */}
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
      {/* Element indicator */}
      <mesh position={[0, -0.5, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={config.glowColor} emissive={config.glowColor} emissiveIntensity={2} />
      </mesh>
      <pointLight color={config.glowColor} intensity={0.8} distance={4} />
    </group>
  );
});

export const Enemies = React.memo(function Enemies({ enemies, playerRef, onEnemyAttackPlayer, setEnemies, onAttackEnemy }: EnemiesProps) {
  const memoUpdateEnemy = useCallback((id: string, updates: Partial<EnemyData>) => {
    setEnemies(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, [setEnemies]);

  return (
    <group>
      {enemies.map(enemy => (
        <Enemy
          key={enemy.id}
          enemy={enemy}
          playerRef={playerRef}
          onEnemyAttackPlayer={onEnemyAttackPlayer}
          updateEnemy={memoUpdateEnemy}
          onAttackEnemy={onAttackEnemy}
        />
      ))}
    </group>
  );
});

