import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AttackEffect, ELEMENTS } from '../../game/types';

export function ProjectileEffect({ effect }: { effect: AttackEffect }) {
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
    // Move along direction
    const speed = 12;
    meshRef.current.position.set(
      effect.position[0] + effect.direction[0] * speed * t,
      effect.position[1] + 0.5,
      effect.position[2] + effect.direction[2] * speed * t,
    );
    meshRef.current.rotation.y += 0.2;
    meshRef.current.rotation.x += 0.15;
    const fade = 1 - t * t;
    (meshRef.current.material as THREE.MeshStandardMaterial).opacity = fade;
  });

  return (
    <mesh ref={meshRef} position={effect.position}>
      <icosahedronGeometry args={[0.2 + effect.combo * 0.05, 0]} />
      <meshStandardMaterial
        color={config.glowColor}
        emissive={config.glowColor}
        emissiveIntensity={3}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </mesh>
  );
}
