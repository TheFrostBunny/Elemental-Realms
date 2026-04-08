import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AttackEffect, ELEMENTS } from '../../game/types';

export function AoeEffect({ effect }: { effect: AttackEffect }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const config = ELEMENTS[effect.element];
  const startTime = useRef(effect.startTime);

  useFrame(() => {
    if (!meshRef.current) return;
    const elapsed = Date.now() - startTime.current;
    const t = elapsed / effect.duration;
    if (t > 1) {
      meshRef.current.visible = false;
      return;
    }
    const radius = t * (4 + effect.combo);
    meshRef.current.scale.set(radius, radius, 1);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.5;
  });

  return (
    <mesh ref={meshRef} position={[effect.position[0], 0.1, effect.position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.8, 1.0, 24]} />
      <meshBasicMaterial
        color={config.glowColor}
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
