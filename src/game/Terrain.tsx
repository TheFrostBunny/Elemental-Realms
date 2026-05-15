import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Realm, REALM_CONFIGS } from './types';


// Terrain generation constants
const TERRAIN_SIZE = 60; // Increased size slightly
const TERRAIN_SEGMENTS = 64; // Increased resolution for better detail
const TERRAIN_HEIGHT_MULTIPLIER = 1.2;

// Animation constants
const FLOATING_ISLAND_ROTATION_SPEED = 0.015;
const ISLAND_COUNT = 8;
const BASE_ISLAND_RADIUS = 7;
const MAX_ISLAND_DISTANCE = 18;

// Decoration constants
const DECORATION_COUNT = 15;
const MIN_DECORATION_DISTANCE = 8;
const MAX_DECORATION_DISTANCE = 18;

interface TerrainProps {
  currentRealm: Realm;
}

// Improved Fractional Brownian Motion (FBM) noise
function fbm(x: number, z: number, octaves: number = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 0.1;
  
  for (let i = 0; i < octaves; i++) {
    // Using a more varied pseudo-random noise base
    value += amplitude * (
      Math.sin(x * frequency + i * 1.5) * 
      Math.cos(z * frequency + i * 2.1) + 
      Math.sin(x * frequency * 0.5 + z * frequency * 0.8) * 0.5
    );
    frequency *= 2.2;
    amplitude *= 0.45;
  }
  return value;
}

// Realm-specific height modifications with more character
function applyRealmModifications(baseHeight: number, realm: Realm, x: number, z: number): number {
  const d = Math.sqrt(x*x + z*z) / (TERRAIN_SIZE / 2); // Normalized distance from center
  const edgeSoftening = Math.pow(1.0 - Math.min(1.0, d), 0.5);

  switch (realm) {
    case 'ice':
      return baseHeight * 0.3 * edgeSoftening; // Very flat, frozen plains
    case 'crystal':
      // Spiky, sharp formations
      const crystalNoise = Math.pow(Math.abs(fbm(x * 2, z * 2, 2)), 0.5);
      return (baseHeight * 0.5 + crystalNoise * 1.5) * edgeSoftening;
    case 'shadow':
      return (baseHeight * 0.1 - 0.2) * edgeSoftening; // Sunken, dark void
    case 'lightning':
      // Jagged, extreme peaks
      const jagged = Math.abs(fbm(x * 0.5, z * 0.5, 5)) * 2.5;
      return (baseHeight * 0.5 + jagged) * edgeSoftening;
    case 'water':
      // Rolling hills that look like waves
      return (baseHeight * 0.8 + Math.sin(x * 0.4) * Math.cos(z * 0.4) * 0.6) * edgeSoftening;
    case 'fire':
      // Volcanic ridges with sharp drops
      const volcano = Math.max(0, fbm(x * 0.2, z * 0.2, 3)) * 2.0;
      return (baseHeight * 1.5 + volcano) * edgeSoftening;
    case 'earth':
      return (baseHeight * 1.2 + fbm(x * 0.8, z * 0.8, 2) * 0.3) * edgeSoftening;
    case 'air':
      // Floating, wispy terrain
      return (baseHeight * 0.6 + Math.sin(x * 0.3 + z * 0.3) * 1.0) * edgeSoftening;
    default:
      return baseHeight * edgeSoftening;
  }
}

export function Terrain({ currentRealm }: TerrainProps) {
  const config = REALM_CONFIGS[currentRealm];
  const geometryRef = useRef<THREE.PlaneGeometry | null>(null);

  const geometry = useMemo(() => {
    if (geometryRef.current) geometryRef.current.dispose();
    const geo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
    const pos = geo.attributes.position;
    const colors = [];
    
    // Create a temporary vector for normal calculations
    const normal = new THREE.Vector3();
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const baseHeight = fbm(x, y, 4) * TERRAIN_HEIGHT_MULTIPLIER;
      const finalHeight = applyRealmModifications(baseHeight, currentRealm, x, y);
      pos.setZ(i, finalHeight);
    }
    
    // Compute normals first to use for slope-based coloring
    geo.computeVertexNormals();
    const normals = geo.attributes.normal;

    for (let i = 0; i < pos.count; i++) {
      const finalHeight = pos.getZ(i);
      normal.set(normals.getX(i), normals.getY(i), normals.getZ(i));
      const slope = 1.0 - normal.z; // Higher value means steeper slope (since Z is up in PlaneGeometry before rotation)

      let color = new THREE.Color(config.groundColor);
      
      // Slope-based coloring (rocky cliffs)
      if (slope > 0.4) {
        color.lerp(new THREE.Color('#555555'), Math.min(1, (slope - 0.4) * 2));
      }

      // Height-based variations
      if (finalHeight > 1.5) {
        color.offsetHSL(0, -0.1, 0.2); // Peaks
      } else if (finalHeight < -0.8) {
        color.offsetHSL(0, -0.1, -0.2); // Valleys
      }

      // Realm-specific detail coloring
      if (currentRealm === 'ice') {
        color.lerp(new THREE.Color('#e0f7ff'), 0.3);
      } else if (currentRealm === 'fire' && finalHeight > 0.8) {
        color.lerp(new THREE.Color('#ff4400'), 0.5); // Lava-like peaks
      } else if (currentRealm === 'earth' && slope < 0.3) {
        color.lerp(new THREE.Color('#2d5a27'), 0.4); // Grassier flat areas
      } else if (currentRealm === 'crystal') {
        color.offsetHSL(Math.sin(finalHeight) * 0.1, 0.2, 0.1);
      }
      
      colors.push(color.r, color.g, color.b);
    }
    
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometryRef.current = geo;
    return geo;
  }, [currentRealm, config.groundColor]);

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: currentRealm === 'ice' ? 0.05 : currentRealm === 'crystal' ? 0.1 : 0.8,
      metalness: currentRealm === 'crystal' || currentRealm === 'lightning' ? 0.4 : 0.0,
      emissive: config.ambientColor,
      emissiveIntensity: 0.1,
    });
    return mat;
  }, [config.ambientColor, currentRealm]);

  useEffect(() => {
    return () => {
      if (geometryRef.current) geometryRef.current.dispose();
      material.dispose();
    };
  }, [material]);

  return (
    <group>
      <mesh 
        geometry={geometry} 
        material={material} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow 
      />
      
      {/* Water / Floor plane for specific realms */}
      {(currentRealm === 'water' || currentRealm === 'ice' || currentRealm === 'shadow') && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[TERRAIN_SIZE, TERRAIN_SIZE]} />
          <meshStandardMaterial 
            color={currentRealm === 'water' ? '#004488' : currentRealm === 'ice' ? '#88ccff' : '#050010'}
            transparent
            opacity={0.6}
            roughness={0.1}
            metalness={0.5}
          />
        </mesh>
      )}
    </group>
  );
}

export function FloatingIslands({ currentRealm }: { currentRealm: Realm }) {
  const groupRef = useRef<THREE.Group>(null);
  const config = REALM_CONFIGS[currentRealm];

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * FLOATING_ISLAND_ROTATION_SPEED;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  const islands = useMemo(() => {
    const islandPositions: Array<[number, number, number, number]> = [];
    
    for (let i = 0; i < ISLAND_COUNT; i++) {
      const angle = (i / ISLAND_COUNT) * Math.PI * 2;
      const distance = BASE_ISLAND_RADIUS + ((i * 7919) % 100) / 100 * (MAX_ISLAND_DISTANCE - BASE_ISLAND_RADIUS);
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const y = (5 + ((i * 1337) % 100) / 100 * 6) * config.gravity;
      const scale = 0.6 + ((i * 4127) % 100) / 100 * 1.2;
      
      islandPositions.push([x, y, z, scale]);
    }
    
    return islandPositions;
  }, [config.gravity]);

  const islandGeometry = useMemo(() => new THREE.DodecahedronGeometry(1, 0), []);
  
  const islandMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: config.groundColor,
    roughness: 0.8,
    emissive: config.ambientColor,
    emissiveIntensity: 0.2,
    metalness: currentRealm === 'crystal' || currentRealm === 'lightning' ? 0.5 : 0.1,
  }), [config.groundColor, config.ambientColor, currentRealm]);

  return (
    <group ref={groupRef}>
      {islands.map(([x, y, z, scale], i) => (
        <mesh 
          key={i} 
          position={[x, y, z]} 
          scale={scale}
          geometry={islandGeometry}
          material={islandMaterial}
          castShadow
        />
      ))}
    </group>
  );
}

// Decoration creation functions
const createFireDecoration = (scale: number) => (
  <mesh position={[0, scale / 2, 0]} castShadow>
    <coneGeometry args={[0.3, scale, 6]} />
    <meshStandardMaterial 
      color="#4a1a0a" 
      emissive="#ff4400" 
      emissiveIntensity={0.3} 
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
      emissiveIntensity={0.4} 
      transparent 
      opacity={0.8} 
      roughness={0.1} 
    />
  </mesh>
);

const createEarthDecoration = (scale: number) => (
  <group>
    <mesh position={[0, scale * 0.4, 0]} castShadow>
      <cylinderGeometry args={[0.05, 0.1, scale * 0.8, 5]} />
      <meshStandardMaterial color="#3d2b1f" roughness={0.9} />
    </mesh>
    <mesh position={[0, scale * 0.8, 0]} castShadow>
      <sphereGeometry args={[scale * 0.3, 8, 8]} />
      <meshStandardMaterial color="#2a4a1a" roughness={1.0} />
    </mesh>
  </group>
);

const createAirDecoration = (scale: number) => (
  <mesh position={[0, scale, 0]}>
    <sphereGeometry args={[0.2 + scale * 0.2, 12, 12]} />
    <meshStandardMaterial 
      color="#ffffff" 
      emissive="#aabbcc" 
      emissiveIntensity={0.5} 
      transparent 
      opacity={0.3} 
    />
  </mesh>
);

const createShadowDecoration = (scale: number) => (
  <group>
    <mesh position={[0, scale * 0.5, 0]}>
      <octahedronGeometry args={[0.3 + scale * 0.2, 0]} />
      <meshStandardMaterial 
        color="#000000" 
        emissive="#4b0082" 
        emissiveIntensity={0.6} 
        transparent 
        opacity={0.7} 
      />
    </mesh>
    <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.5, 1.2 + scale * 0.5, 8]} />
      <meshStandardMaterial 
        color="#1a0030" 
        emissive="#6600aa" 
        emissiveIntensity={0.4} 
        transparent 
        opacity={0.2} 
        side={THREE.DoubleSide} 
      />
    </mesh>
  </group>
);

const createLightningDecoration = (scale: number, seed: number) => (
  <group>
    <mesh position={[0, scale * 0.6, 0]} castShadow>
      <cylinderGeometry args={[0.02, 0.1, scale * 1.2, 4]} />
      <meshStandardMaterial 
        color="#222233" 
        emissive="#ffff00" 
        emissiveIntensity={0.8} 
        metalness={1.0} 
      />
    </mesh>
    <mesh position={[0, scale * 1.2, 0]}>
      <dodecahedronGeometry args={[0.15, 0]} />
      <meshStandardMaterial 
        color="#ffff88" 
        emissive="#ffff00" 
        emissiveIntensity={1.5} 
      />
    </mesh>
  </group>
);

const createIceDecoration = (scale: number, seed: number) => (
  <group>
    <mesh position={[0, scale * 0.5, 0]} castShadow rotation={[0.2, seed, 0.1]}>
      <boxGeometry args={[0.2, scale, 0.2]} />
      <meshStandardMaterial 
        color="#b3e6ff" 
        emissive="#00bbff" 
        emissiveIntensity={0.3} 
        transparent 
        opacity={0.8} 
        metalness={0.2} 
        roughness={0.0} 
      />
    </mesh>
  </group>
);

const createCrystalDecoration = (scale: number, seed: number) => (
  <group>
    <mesh position={[0, scale * 0.5, 0]} castShadow rotation={[0.1, seed * 1.2, 0.15]}>
      <coneGeometry args={[0.25, scale, 4]} />
      <meshStandardMaterial 
        color="#ff00ff" 
        emissive="#ff00ff" 
        emissiveIntensity={0.6} 
        metalness={0.9} 
        roughness={0.1} 
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
        scale: 0.8 + ((i * 3571) % 100) / 100 * 2.0,
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
