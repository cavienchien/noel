import React, { useMemo } from 'react';
import { getFloorTileTexture } from '../../assets/textures/proceduralTextures';

export default function Floor() {
  const floorTex = useMemo(() => getFloorTileTexture(), []);

  return (
    <group>
      {/* Main Room Large-Format Cream Porcelain Tile Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0.1]}
        receiveShadow
      >
        <planeGeometry args={[9.6, 7.2]} />
        <meshStandardMaterial
          map={floorTex}
          color="#F6F1E7"
          roughness={0.34}
          metalness={0.06}
        />
      </mesh>

      {/* Exterior / Entrance Hallway Floor Outside the Main Door (Z = 3.6 to 6.8) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0.4, -0.005, 5.2]}
        receiveShadow
      >
        <planeGeometry args={[4.6, 3.4]} />
        <meshStandardMaterial
          map={floorTex}
          color="#EAE1D3"
          roughness={0.45}
          metalness={0.04}
        />
      </mesh>

      {/* Coir / Wood Welcome Mat Outside Main Entrance Door */}
      <mesh position={[0.4, 0.012, 4.18]} receiveShadow castShadow>
        <boxGeometry args={[1.15, 0.024, 0.68]} />
        <meshStandardMaterial color="#B58B5A" roughness={0.85} />
      </mesh>
      <mesh position={[0.4, 0.025, 4.18]} receiveShadow>
        <boxGeometry args={[1.02, 0.005, 0.56]} />
        <meshStandardMaterial color="#9A7246" roughness={0.9} />
      </mesh>
    </group>
  );
}
