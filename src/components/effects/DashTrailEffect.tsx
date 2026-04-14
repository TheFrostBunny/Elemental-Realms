import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AttackEffect, ELEMENTS } from '../../game/types';

export function DashTrailEffect({ effect }: { effect: AttackEffect }) {
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
    meshRef.current.scale.set(1, 1 - t * 0.5, 1);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.4;
  });

  return (
    <mesh ref={meshRef} position={effect.position}>
      <capsuleGeometry args={[0.15, 0.4, 4, 8]} />
      <meshBasicMaterial
        color={config.glowColor}
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </mesh>
  );
}
