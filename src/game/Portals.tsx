import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Realm, REALM_CONFIGS, ALL_REALMS } from './types';
import { PORTAL_POSITIONS, REALM_PORTAL_COLORS } from './portalPositions';

function Portal({ realm, position, isCurrent }: {
  realm: Realm;
  position: [number, number, number];
  isCurrent: boolean;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const colors = REALM_PORTAL_COLORS[realm];
  const config = REALM_CONFIGS[realm];

  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.02;
      ringRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y += 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.2, 0.1, 16, 32]} />
        <meshStandardMaterial
          color={colors.color}
          emissive={colors.glow}
          emissiveIntensity={isCurrent ? 0.3 : 1.5}
          transparent
          opacity={isCurrent ? 0.3 : 0.9}
        />
      </mesh>
      <mesh ref={innerRef}>
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial
          color={colors.glow}
          emissive={colors.glow}
          emissiveIntensity={isCurrent ? 0.2 : 2}
          transparent
          opacity={isCurrent ? 0.1 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {!isCurrent && (
        <pointLight color={colors.glow} intensity={3} distance={8} />
      )}
    </group>
  );
}

export function Portals({ currentRealm }: { currentRealm: Realm }) {
  return (
    <group>
      {ALL_REALMS.map(realm => (
        <Portal
          key={realm}
          realm={realm}
          position={PORTAL_POSITIONS[realm]}
          isCurrent={realm === currentRealm}
        />
      ))}
    </group>
  );
}
