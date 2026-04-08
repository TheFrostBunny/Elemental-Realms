import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AttackEffect, ELEMENTS } from '../../game/types';

export function SlashEffect({ effect }: { effect: AttackEffect }) {
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
    const scale = 1 + t * (1 + effect.combo * 0.3);
    meshRef.current.scale.set(scale, scale, 0.1);
    meshRef.current.rotation.z += 0.3;
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.8;
  });

  return (
    <mesh ref={meshRef} position={effect.position} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.8 + effect.combo * 0.2, 6 + effect.combo * 2]} />
      <meshBasicMaterial
        color={config.glowColor}
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
