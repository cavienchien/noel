import React from 'react';

export default function Plants({ isGuidedHighlighted }) {
  // Large Potted Monstera Deliciosa Plant in Front-Left Corner next to Sofa (matching noel_demo.png)
  const leaves = [
    { pos: [0, 0.85, 0], rot: [0.25, 0, 0], scale: [1.1, 1, 1.25] },
    { pos: [-0.28, 0.78, -0.15], rot: [0.35, 0.8, 0.25], scale: [1.05, 1, 1.2] },
    { pos: [0.3, 0.82, -0.18], rot: [0.3, -0.75, -0.2], scale: [1.1, 1, 1.25] },
    { pos: [-0.34, 0.66, 0.2], rot: [0.45, 2.1, 0.3], scale: [1.0, 1, 1.15] },
    { pos: [0.32, 0.68, 0.22], rot: [0.42, -2.0, -0.25], scale: [1.05, 1, 1.2] },
    { pos: [0.05, 0.96, -0.28], rot: [-0.35, 0.2, 0.1], scale: [1.15, 1, 1.3] },
    { pos: [-0.22, 0.95, 0.08], rot: [0.2, 1.3, 0.35], scale: [1.1, 1, 1.2] },
    { pos: [0.24, 0.94, 0.06], rot: [0.22, -1.2, -0.32], scale: [1.05, 1, 1.2] },
    { pos: [0, 0.62, 0.34], rot: [0.55, 0, 0], scale: [0.95, 1, 1.1] },
  ];

  return (
    <group position={[-3.38, 0, 1.85]}>
      {/* White Matte Ceramic Cylindrical Planter Pot */}
      <mesh position={[0, 0.23, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.2, 0.46, 24]} />
        <meshStandardMaterial
          color={isGuidedHighlighted ? '#FFFFFF' : '#F4EFE6'}
          roughness={0.42}
        />
      </mesh>
      {/* Dark Potting Soil */}
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.225, 0.225, 0.03, 24]} />
        <meshStandardMaterial color="#2D221B" roughness={0.95} />
      </mesh>

      {/* Monstera Stems & Large Fenestrated Tropical Leaves */}
      {leaves.map((leaf, idx) => (
        <group key={idx}>
          {/* Arching Green Stem */}
          <mesh
            position={[
              leaf.pos[0] * 0.5,
              0.42 + (leaf.pos[1] - 0.42) * 0.5,
              leaf.pos[2] * 0.5,
            ]}
            rotation={[leaf.rot[0] * 0.5, leaf.rot[1], leaf.rot[2] * 0.5]}
            castShadow
          >
            <cylinderGeometry args={[0.011, 0.015, 0.48, 8]} />
            <meshStandardMaterial color="#34562B" roughness={0.7} />
          </mesh>

          {/* Sculpted Monstera Leaf Blade with Fenestration Ribs */}
          <group
            position={leaf.pos}
            rotation={leaf.rot}
            scale={leaf.scale}
          >
            {/* Central Leaf Vein */}
            <mesh castShadow>
              <boxGeometry args={[0.025, 0.014, 0.36]} />
              <meshStandardMaterial color="#3D6432" roughness={0.55} />
            </mesh>
            {/* Left & Right Fenestrated Leaf Lobes */}
            {[-0.13, -0.05, 0.03, 0.11].map((lz, li) => {
              const lobeW = 0.28 - Math.abs(lz) * 0.65;
              return (
                <mesh
                  key={li}
                  position={[0, 0, lz]}
                  castShadow
                  receiveShadow
                >
                  <boxGeometry args={[lobeW, 0.012, 0.055]} />
                  <meshStandardMaterial
                    color="#2D4F25"
                    roughness={0.52}
                  />
                </mesh>
              );
            })}
          </group>
        </group>
      ))}
    </group>
  );
}
