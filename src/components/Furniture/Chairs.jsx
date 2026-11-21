import React, { useMemo } from 'react';
import { getOakWoodTexture } from '../../assets/textures/proceduralTextures';

export default function Chairs({ isGuidedHighlighted }) {
  const oakTex = useMemo(() => getOakWoodTexture(), []);

  // Two Scandinavian Oak Dining Chairs behind the dining table (matching noel_demo.png)
  const chairPositions = [
    [1.92, 0, -0.35],
    [2.78, 0, -0.41],
  ];

  return (
    <group>
      {chairPositions.map(([cx, cy, cz], idx) => (
        <group
          key={idx}
          position={[cx, cy, cz]}
          rotation={[0, -0.07, 0]}
        >
          {/* 4 Chair Legs */}
          {[
            [-0.21, 0.23, -0.2],
            [0.21, 0.23, -0.2],
            [-0.21, 0.23, 0.2],
            [0.21, 0.23, 0.2],
          ].map(([lx, ly, lz], li) => (
            <mesh key={li} position={[lx, ly, lz]} castShadow receiveShadow>
              <cylinderGeometry args={[0.022, 0.018, 0.46, 12]} />
              <meshStandardMaterial
                map={oakTex}
                color="#B88E5E"
                roughness={0.52}
              />
            </mesh>
          ))}

          {/* Warm Tan Seat Pad */}
          <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.46, 0.04, 0.44]} />
            <meshStandardMaterial
              color={isGuidedHighlighted ? '#D4AC7D' : '#C19666'}
              roughness={0.55}
            />
          </mesh>

          {/* Rear Backrest Posts */}
          {[-0.21, 0.21].map((bx, bi) => (
            <mesh
              key={bi}
              position={[bx, 0.69, -0.2]}
              rotation={[-0.06, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.02, 0.022, 0.48, 12]} />
              <meshStandardMaterial
                map={oakTex}
                color="#B88E5E"
                roughness={0.52}
              />
            </mesh>
          ))}

          {/* Two Curved Horizontal Backrest Slats (matching noel_demo.png) */}
          {[0.72, 0.86].map((sy, si) => (
            <mesh key={si} position={[0, sy, -0.21]} castShadow>
              <boxGeometry args={[0.44, 0.065, 0.025]} />
              <meshStandardMaterial
                map={oakTex}
                color="#C49A6A"
                roughness={0.5}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
