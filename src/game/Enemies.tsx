import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnemyData, ELEMENTS } from './types';

interface EnemiesProps {
  enemies: EnemyData[];
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 33 + id.charCodeAt(i)) >>> 0;
  return h;
}

function Enemy({ enemy }: { enemy: EnemyData }) {
  const meshRef = useRef<THREE.Group>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const orbitRefA = useRef<THREE.Group>(null);
  const orbitRefB = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const config = ELEMENTS[enemy.element];
  const isTank = enemy.archetype === 'tank';
  const isScout = enemy.archetype === 'scout';
  const isStriker = enemy.archetype === 'striker';
  const isBrute = enemy.archetype === 'brute';
  const isMystic = enemy.archetype === 'mystic';
  const isMiniBoss = enemy.archetype === 'miniBoss';
  const variantHash = hashId(enemy.id);
  const variantScale = 0.92 + (variantHash % 25) / 100;
  const variantOpacity = 0.55 + (variantHash % 30) / 100;

  useFrame((_, delta) => {
    if (!meshRef.current || enemy.dead) return;
    meshRef.current.position.set(enemy.position[0], enemy.position[1], enemy.position[2]);
    meshRef.current.rotation.y += delta * (isMiniBoss ? 1.5 : isScout ? 2.3 : isStriker ? 1.8 : 1.0);
    if (torusRef.current) {
      torusRef.current.rotation.x += delta * (isScout ? 2.5 : isTank ? 0.8 : 1.2);
      torusRef.current.rotation.y += delta * (isMiniBoss ? 1.4 : isStriker ? 2.2 : 0.8);
      torusRef.current.scale.setScalar(isMiniBoss ? 1.18 : isTank ? 1.1 : isScout ? 0.9 : 1);
    }
    if (orbitRefA.current) {
      orbitRefA.current.rotation.y += delta * 2.4;
      orbitRefA.current.rotation.x += delta * 0.8;
    }
    if (orbitRefB.current) {
      orbitRefB.current.rotation.y -= delta * 1.9;
      orbitRefB.current.rotation.z += delta * 0.9;
    }
    if (pulseRef.current) {
      const pulse = 1 + Math.sin(Date.now() * 0.01 + variantHash * 0.002) * (isMiniBoss ? 0.11 : 0.06);
      pulseRef.current.scale.setScalar(pulse);
    }
  });

  if (enemy.dead) {
    const elapsed = Date.now() - (enemy.deathTime || Date.now());
    if (elapsed > 1500) return null;
    const fade = 1 - elapsed / 1500;
    return (
      <mesh position={enemy.position}>
        <sphereGeometry args={[0.5 + (1 - fade) * 2, 6, 6]} />
        <meshStandardMaterial color={config.glowColor} emissive={config.glowColor} emissiveIntensity={3 * fade} transparent opacity={fade * 0.5} />
      </mesh>
    );
  }

  const healthPercent = enemy.health / enemy.maxHealth;
  const hpBarWidth = isMiniBoss ? 1.25 : isTank ? 1.0 : isBrute ? 0.9 : 0.8;
  const coreScale = (isMiniBoss ? 0.62 : isTank ? 0.52 : isBrute ? 0.5 : isScout ? 0.34 : isMystic ? 0.4 : 0.44) * variantScale;

  return (
    <group ref={meshRef} position={enemy.position}>
      <mesh ref={pulseRef} castShadow>
        {isScout && <tetrahedronGeometry args={[coreScale, 0]} />}
        {isBrute && <dodecahedronGeometry args={[coreScale, 0]} />}
        {isStriker && <octahedronGeometry args={[coreScale, 0]} />}
        {isTank && <icosahedronGeometry args={[coreScale, 0]} />}
        {isMystic && <sphereGeometry args={[coreScale, 12, 12]} />}
        {isMiniBoss && <icosahedronGeometry args={[coreScale, 1]} />}
        <meshStandardMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={isMiniBoss ? 1.25 : isStriker ? 0.95 : isTank ? 0.5 : 0.7}
          roughness={isMiniBoss ? 0.18 : isTank ? 0.25 : 0.45}
          metalness={isMiniBoss ? 0.75 : isScout ? 0.2 : 0.55}
        />
      </mesh>

      {!isMystic && (
        <mesh ref={torusRef}>
          <torusGeometry args={[isTank ? 0.72 : 0.6, isTank ? 0.07 : 0.05, 8, 18]} />
          <meshStandardMaterial color={config.glowColor} emissive={config.glowColor} emissiveIntensity={1} transparent opacity={isScout ? 0.9 : variantOpacity} />
        </mesh>
      )}

      {isStriker && (
        <group>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.9, 0.08, 0.08]} />
            <meshStandardMaterial color={config.glowColor} emissive={config.glowColor} emissiveIntensity={1.3} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.9, 0.08, 0.08]} />
            <meshStandardMaterial color={config.glowColor} emissive={config.glowColor} emissiveIntensity={1.3} />
          </mesh>
        </group>
      )}

      {isMystic && (
        <>
          <group ref={orbitRefA}>
            <mesh position={[0.65, 0, 0]}>
              <sphereGeometry args={[0.07, 10, 10]} />
              <meshStandardMaterial color={config.glowColor} emissive={config.glowColor} emissiveIntensity={1.4} />
            </mesh>
          </group>
          <group ref={orbitRefB}>
            <mesh position={[-0.65, 0.16, 0]}>
              <sphereGeometry args={[0.06, 10, 10]} />
              <meshStandardMaterial color={config.glowColor} emissive={config.glowColor} emissiveIntensity={1.4} />
            </mesh>
          </group>
        </>
      )}

      {isMiniBoss && (
        <>
          <mesh rotation={[0, 0, Math.PI / 5]}>
            <torusGeometry args={[0.92, 0.06, 10, 30]} />
            <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={1.8} transparent opacity={0.75} />
          </mesh>
          <mesh position={[0, 0.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.15, 0.28, 16]} />
            <meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={1.7} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

      <group position={[0, 1, 0]}>
        <mesh>
          <planeGeometry args={[hpBarWidth, 0.08]} />
          <meshBasicMaterial color="#333" transparent opacity={0.8} />
        </mesh>
        <mesh position={[(healthPercent - 1) * hpBarWidth * 0.5, 0, 0.01]}>
          <planeGeometry args={[hpBarWidth * healthPercent, 0.08]} />
          <meshBasicMaterial color={healthPercent > 0.5 ? '#4ade80' : healthPercent > 0.25 ? '#fbbf24' : '#ef4444'} />
        </mesh>
      </group>
    </group>
  );
}

export function Enemies({ enemies }: EnemiesProps) {
  return (
    <group>
      {enemies.map(enemy => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}
    </group>
  );
}
