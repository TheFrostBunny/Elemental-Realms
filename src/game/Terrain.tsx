import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Realm, REALM_CONFIGS } from './types';


// Terrain generation constants
const TERRAIN_SIZE = 50;
const TERRAIN_SEGMENTS = 40;
const NOISE_SCALE = 0.3;
const TERRAIN_HEIGHT_MULTIPLIER = 0.8;

// Animation constants
const FLOATING_ISLAND_ROTATION_SPEED = 0.015;
const ISLAND_COUNT = 8;
const BASE_ISLAND_RADIUS = 7;
const MAX_ISLAND_DISTANCE = 15;

// Decoration constants
const DECORATION_COUNT = 12;
const MIN_DECORATION_DISTANCE = 7;
const MAX_DECORATION_DISTANCE = 15;

interface TerrainProps {
  currentRealm: Realm;
}



// Enkel pseudo-støy for terreng (erstatter simplex-noise)
function generateNoise(x: number, z: number): number {
  // Kombiner flere trig-funksjoner for "fleroktav" effekt
  const base = Math.sin(x * 0.13 + z * 0.11) * 0.7;
  const detail = Math.sin(x * 0.7 + 2) * Math.cos(z * 0.5 + 1.5) * 0.3;
  const micro = Math.sin(x * 1.9 + z * 1.7) * 0.12;
  return base + detail + micro;
}

// Realm-specific height modifications
function applyRealmModifications(baseHeight: number, realm: Realm, x: number, z: number): number {
  switch (realm) {
    case 'ice':
      return baseHeight * 0.4; // Flatter icy terrain
    case 'crystal':
      return Math.abs(baseHeight) * 1.5 + Math.sin(x * 3) * 0.2; // Spiky crystals with extra detail
    case 'shadow':
      return baseHeight * 0.2 - 0.1; // Nearly flat void, slightly depressed
    case 'lightning':
      return baseHeight + Math.sin(x * 2) * 0.3 + Math.cos(z * 2.5) * 0.2; // Jagged peaks
    case 'water':
      return baseHeight * 0.6 + Math.sin(x * 0.8) * Math.sin(z * 0.8) * 0.3; // Gentle waves
    case 'fire':
      return baseHeight * 1.2 + Math.abs(Math.sin(x * 1.5)) * 0.4; // Volcanic ridges
    case 'earth':
      return baseHeight * 0.9 + (Math.random() - 0.5) * 0.1; // Natural variation
    case 'air':
      return baseHeight * 0.7 + Math.sin(x * 0.4 + z * 0.4) * 0.5; // Flowing patterns
    default:
      return baseHeight;
  }
}

export function Terrain({ currentRealm }: TerrainProps) {
  const config = REALM_CONFIGS[currentRealm];
  const geometryRef = useRef<THREE.PlaneGeometry | null>(null);


  const geometry = useMemo(() => {
    if (geometryRef.current) geometryRef.current.dispose();
    const geo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
    const pos = geo.attributes.position;
    // Legg til vertex colors for varierende bakke
    const colors = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      const baseHeight = generateNoise(x, z) * TERRAIN_HEIGHT_MULTIPLIER;
      const finalHeight = applyRealmModifications(baseHeight, currentRealm, x, z);
      pos.setZ(i, finalHeight);

      // Farge basert på høyde og realm
      let color = new THREE.Color(config.groundColor);
      if (finalHeight > 0.7) {
        // Høyere topper får lysere farge
        color.offsetHSL(0, -0.1, 0.18);
      } else if (finalHeight < -0.5) {
        // Daler får mørkere farge
        color.offsetHSL(0, -0.05, -0.15);
      } else if (currentRealm === 'ice') {
        color.lerp(new THREE.Color('#b3e6ff'), 0.4);
      } else if (currentRealm === 'fire' && finalHeight > 0.3) {
        color.lerp(new THREE.Color('#ffb347'), 0.3);
      } else if (currentRealm === 'earth' && finalHeight > 0.2) {
        color.lerp(new THREE.Color('#44ff00'), 0.2);
      } else if (currentRealm === 'crystal' && finalHeight > 0.5) {
        color.lerp(new THREE.Color('#ff44ff'), 0.3);
      }
      colors.push(color.r, color.g, color.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    geometryRef.current = geo;
    return geo;
  }, [currentRealm]);

  // Materiale med vertexColors
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: currentRealm === 'ice' ? 0.1 : currentRealm === 'crystal' ? 0.05 : 0.9,
      metalness: currentRealm === 'crystal' || currentRealm === 'lightning' ? 0.8 : 0.1,
      emissive: config.ambientColor,
      emissiveIntensity: 0.05,
    });
    if (currentRealm === 'ice' || currentRealm === 'crystal') {
      mat.transparent = true;
      mat.opacity = 0.85;
    }
    return mat;
  }, [config.ambientColor, currentRealm]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (geometryRef.current) {
        geometryRef.current.dispose();
      }
      material.dispose();
    };
  }, [material]);

  return (
    <mesh geometry={geometry} material={material} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    </mesh>
  );
}

export function FloatingIslands({ currentRealm }: { currentRealm: Realm }) {
  const groupRef = useRef<THREE.Group>(null);
  const config = REALM_CONFIGS[currentRealm];

  // Enhanced animation with floating motion
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * FLOATING_ISLAND_ROTATION_SPEED;
      // Add subtle vertical floating motion
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  const islands = useMemo(() => {
    const islandPositions: Array<[number, number, number]> = [];
    
    for (let i = 0; i < ISLAND_COUNT; i++) {
      const angle = (i / ISLAND_COUNT) * Math.PI * 2;
      // Use better distribution
      const distance = BASE_ISLAND_RADIUS + ((i * 7919) % 100) / 100 * (MAX_ISLAND_DISTANCE - BASE_ISLAND_RADIUS);
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const y = (4 + ((i * 1337) % 100) / 100 * 4) * config.gravity;
      
      islandPositions.push([x, y, z]);
    }
    
    return islandPositions;
  }, [config.gravity]);

  const islandGeometry = useMemo(() => new THREE.DodecahedronGeometry(0.5, 0), []);
  
  const islandMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: config.groundColor,
    roughness: 0.7,
    emissive: config.ambientColor,
    emissiveIntensity: 0.2,
    metalness: currentRealm === 'crystal' || currentRealm === 'lightning' ? 0.6 : 0.1,
  }), [config.groundColor, config.ambientColor, currentRealm]);

  return (
    <group ref={groupRef}>
      {islands.map(([x, y, z], i) => (
        <mesh 
          key={i} 
          position={[x, y, z]} 
          scale={0.8 + (i * 0.15)}
          geometry={islandGeometry}
          material={islandMaterial}
          castShadow
        />
      ))}
    </group>
  );
}

// Decoration creation functions for each realm
const createFireDecoration = (scale: number) => (
  <mesh position={[0, scale / 2, 0]} castShadow>
    <coneGeometry args={[0.3, scale, 6]} />
    <meshStandardMaterial 
      color="#4a1a0a" 
      emissive="#ff4400" 
      emissiveIntensity={0.15} 
      roughness={0.8} 
    />
  </mesh>
);

const createWaterDecoration = (scale: number) => (
  <mesh position={[0, scale * 0.3, 0]} castShadow>
    <cylinderGeometry args={[0.15, 0.4, scale * 0.6, 6]} />
    <meshStandardMaterial 
      color="#1a4a6a" 
      emissive="#0088ff" 
      emissiveIntensity={0.2} 
      transparent 
      opacity={0.7} 
      roughness={0.2} 
    />
  </mesh>
);

const createEarthDecoration = (scale: number) => (
  <mesh position={[0, scale * 0.4, 0]} castShadow>
    <cylinderGeometry args={[0.1, 0.15, scale * 0.8, 5]} />
    <meshStandardMaterial color="#2a4a1a" roughness={0.95} />
  </mesh>
);

const createAirDecoration = (scale: number) => (
  <mesh position={[0, scale, 0]}>
    <sphereGeometry args={[0.2 + scale * 0.1, 8, 8]} />
    <meshStandardMaterial 
      color="#8899aa" 
      emissive="#aabbcc" 
      emissiveIntensity={0.3} 
      transparent 
      opacity={0.4} 
    />
  </mesh>
);

const createShadowDecoration = (scale: number) => (
  <group>
    <mesh position={[0, scale * 0.5, 0]}>
      <octahedronGeometry args={[0.3 + scale * 0.2, 0]} />
      <meshStandardMaterial 
        color="#1a0030" 
        emissive="#8b00ff" 
        emissiveIntensity={0.4} 
        transparent 
        opacity={0.6} 
      />
    </mesh>
    <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.5, 0.8 + scale * 0.3, 6]} />
      <meshStandardMaterial 
        color="#2a0050" 
        emissive="#6600aa" 
        emissiveIntensity={0.3} 
        transparent 
        opacity={0.3} 
        side={THREE.DoubleSide} 
      />
    </mesh>
  </group>
);

const createLightningDecoration = (scale: number, seed: number) => (
  <group>
    <mesh position={[0, scale * 0.6, 0]} castShadow>
      <cylinderGeometry args={[0.05, 0.2, scale * 1.2, 4]} />
      <meshStandardMaterial 
        color="#3a3a50" 
        emissive="#ffff00" 
        emissiveIntensity={0.5} 
        metalness={0.8} 
        roughness={0.2} 
      />
    </mesh>
    <mesh position={[0, scale * 1.2, 0]}>
      <sphereGeometry args={[0.12, 8, 8]} />
      <meshStandardMaterial 
        color="#ffff44" 
        emissive="#ffff00" 
        emissiveIntensity={1.0} 
      />
    </mesh>
  </group>
);

const createIceDecoration = (scale: number, seed: number) => (
  <group>
    <mesh position={[0, scale * 0.4, 0]} castShadow rotation={[0, seed * 0.8, 0.1]}>
      <boxGeometry args={[0.3, scale * 0.8, 0.2]} />
      <meshStandardMaterial 
        color="#88ccee" 
        emissive="#44aadd" 
        emissiveIntensity={0.15} 
        transparent 
        opacity={0.7} 
        metalness={0.3} 
        roughness={0.1} 
      />
    </mesh>
    <mesh position={[0.15, scale * 0.3, 0.1]} castShadow rotation={[0.2, seed, -0.15]}>
      <boxGeometry args={[0.15, scale * 0.5, 0.12]} />
      <meshStandardMaterial 
        color="#aaddff" 
        emissive="#88ddff" 
        emissiveIntensity={0.1} 
        transparent 
        opacity={0.6} 
      />
    </mesh>
  </group>
);

const createCrystalDecoration = (scale: number, seed: number) => (
  <group>
    <mesh position={[0, scale * 0.5, 0]} castShadow rotation={[0.1, seed * 1.2, 0.15]}>
      <coneGeometry args={[0.2, scale, 5]} />
      <meshStandardMaterial 
        color="#cc22cc" 
        emissive="#ff44ff" 
        emissiveIntensity={0.4} 
        metalness={0.9} 
        roughness={0.05} 
      />
    </mesh>
    <mesh position={[-0.2, scale * 0.3, 0.1]} castShadow rotation={[-0.2, seed * 0.7, -0.3]}>
      <coneGeometry args={[0.12, scale * 0.6, 5]} />
      <meshStandardMaterial 
        color="#aa11aa" 
        emissive="#dd33dd" 
        emissiveIntensity={0.3} 
        metalness={0.9} 
        roughness={0.05} 
      />
    </mesh>
  </group>
);

interface DecorationStructure {
  pos: [number, number, number];
  scale: number;
  seed: number;
}

export function RealmDecorations({ currentRealm }: { currentRealm: Realm }) {
  const structures = useMemo<DecorationStructure[]>(() => {
    const items: DecorationStructure[] = [];
    for (let i = 0; i < DECORATION_COUNT; i++) {
      const angle = (i / DECORATION_COUNT) * Math.PI * 2;
      const dist = MIN_DECORATION_DISTANCE + ((i * 7919) % 100) / 100 * (MAX_DECORATION_DISTANCE - MIN_DECORATION_DISTANCE);
      items.push({
        pos: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist],
        scale: 0.5 + ((i * 3571) % 100) / 100 * 1.5,
        seed: i,
      });
    }
    return items;
  }, []);

  const renderDecoration = (structure: DecorationStructure) => {
    const { scale, seed } = structure;
    
    switch (currentRealm) {
      case 'fire': return createFireDecoration(scale);
      case 'water': return createWaterDecoration(scale);
      case 'earth': return createEarthDecoration(scale);
      case 'air': return createAirDecoration(scale);
      case 'shadow': return createShadowDecoration(scale);
      case 'lightning': return createLightningDecoration(scale, seed);
      case 'ice': return createIceDecoration(scale, seed);
      case 'crystal': return createCrystalDecoration(scale, seed);
      default: return null;
    }
  };

  return (
    <group>
      {structures.map((structure, i) => (
        <group key={i} position={structure.pos}>
          {renderDecoration(structure)}
        </group>
      ))}
    </group>
  );
}
