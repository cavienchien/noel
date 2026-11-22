import React, { useMemo } from 'react';
import { getOakWoodTexture } from '../../assets/textures/proceduralTextures';

export default function CoffeeTable({
  candlesOn,
  hoveredObject,
  isGuidedHighlighted,
  mode,
  onInteract,
}) {
  const oakTex = useMemo(() => getOakWoodTexture(), []);
  const isHoveredCandles = hoveredObject?.id === 'candles';

  const candleInteractData = {
    interactable: true,
    id: 'candles',
    name: 'Nến Thơm Bàn Trà',
    actionLabel: candlesOn ? 'Tắt Nến' : 'Thắp Nến',
    area: 'Khu vực Sofa',
    position: [-1.05, 0.55, 0.58],
  };

  const handleCandleClick = (e) => {
    e.stopPropagation();
    if (mode === 'FREE_EXPLORE') {
      onInteract('candles');
    }
  };

  const tableColor = isGuidedHighlighted ? '#FAF6EE' : '#EFE7DA';

  return (
    <group position={[-1.25, 0, 0.58]}>
      {/* Cylindrical Pedestal Base (matching noel_demo.png round drum coffee table) */}
      <mesh
        position={[0, 0.18, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.28, 0.3, 0.36, 32]} />
        <meshStandardMaterial color="#E6DDD0" roughness={0.5} />
      </mesh>

      {/* Round Cream Tabletop */}
      <mesh
        position={[0, 0.38, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.58, 0.58, 0.045, 40]} />
        <meshStandardMaterial
          color={tableColor}
          roughness={0.4}
          emissive={isGuidedHighlighted ? '#E9C879' : '#000000'}
          emissiveIntensity={isGuidedHighlighted ? 0.08 : 0}
        />
      </mesh>

      {/* ================= 1. WHITE ROSE BOUQUET IN GLASS VASE ================= */}
      <group
        position={[-0.14, 0.4, -0.06]}
      >
        {/* Rounded Ceramic/Tinted Glass Vase */}
        <mesh position={[0, 0.09, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.095, 0.18, 20]} />
          <meshStandardMaterial
            color="#D8CFC2"
            roughness={0.25}
            metalness={0.1}
          />
        </mesh>

        {/* Green Foliage Leaves Base */}
        {[0, 1.04, 2.09, 3.14, 4.18, 5.23].map((ang, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(ang) * 0.11,
              0.2,
              Math.sin(ang) * 0.11,
            ]}
            rotation={[0.3, ang, 0.4]}
            castShadow
          >
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial color="#2D5236" roughness={0.75} />
          </mesh>
        ))}

        {/* Cluster of Lush White Roses (matching noel_demo.png) */}
        {[
          [0, 0.28, 0, 0.062],
          [-0.08, 0.25, 0.05, 0.055],
          [0.08, 0.25, 0.04, 0.055],
          [-0.05, 0.25, -0.07, 0.055],
          [0.06, 0.25, -0.06, 0.054],
          [0, 0.23, 0.09, 0.05],
          [-0.1, 0.22, -0.02, 0.048],
          [0.1, 0.22, -0.01, 0.048],
        ].map(([rx, ry, rz, r], idx) => (
          <mesh key={idx} position={[rx, ry, rz]} castShadow>
            <dodecahedronGeometry args={[r, 1]} />
            <meshStandardMaterial color="#FAF8F3" roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* ================= 2. STACKED ART BOOKS & LIT PILLAR CANDLE ================= */}
      <group position={[0.18, 0.4, 0.05]}>
        {/* Bottom Hardcover Book */}
        <mesh
          position={[0, 0.018, 0]}
          rotation={[0, 0.22, 0]}
          castShadow
        >
          <boxGeometry args={[0.24, 0.032, 0.18]} />
          <meshStandardMaterial color="#D9CEBF" roughness={0.6} />
        </mesh>
        {/* Top Hardcover Book */}
        <mesh
          position={[0, 0.046, 0]}
          rotation={[0, 0.08, 0]}
          castShadow
        >
          <boxGeometry args={[0.21, 0.026, 0.15]} />
          <meshStandardMaterial color="#EFE9DF" roughness={0.55} />
        </mesh>

        {/* Scented Pillar Candle on Top of Books */}
        <group
          position={[0, 0.06, 0]}
          userData={candleInteractData}
          onClick={handleCandleClick}
        >
          <mesh position={[0, 0.045, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.09, 16]} />
            <meshStandardMaterial
              color={isHoveredCandles ? '#FFF9EB' : '#F6EFE2'}
              roughness={0.35}
            />
          </mesh>
          {candlesOn && (
            <>
              <mesh position={[0, 0.105, 0]}>
                <coneGeometry args={[0.012, 0.036, 8]} />
                <meshBasicMaterial color="#FFD15C" />
              </mesh>
              <pointLight
                position={[0, 0.14, 0]}
                color="#FFA938"
                intensity={2.1}
                distance={6.2}
                decay={1.55}
              />
            </>
          )}
        </group>
      </group>

      {/* ================= 3. SCANDINAVIAN TABLETOP PHOTO FRAME WITH EASEL STAND ================= */}
      <group position={[-0.16, 0.402, 0.25]} rotation={[0, -0.38, 0]}>
        {/* Tilted Frame Body */}
        <group position={[0, 0.112, 0]} rotation={[-0.18, 0, 0]}>
          {/* Warm Oak Outer Frame */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.19, 0.23, 0.016]} />
            <meshStandardMaterial
              map={oakTex}
              color="#C9A26E"
              roughness={0.38}
              metalness={0.18}
            />
          </mesh>

          {/* Brushed Brass Inner Trim */}
          <mesh position={[0, 0, 0.0085]}>
            <planeGeometry args={[0.162, 0.202]} />
            <meshStandardMaterial
              color="#D4AF6A"
              metalness={0.82}
              roughness={0.22}
            />
          </mesh>

          {/* Cream Passe-Partout Matting */}
          <mesh position={[0, 0, 0.009]}>
            <planeGeometry args={[0.154, 0.194]} />
            <meshStandardMaterial color="#F9F6F0" roughness={0.62} />
          </mesh>

          {/* Gold Bevel Border around Photo Slot */}
          <mesh position={[0, 0, 0.0095]}>
            <planeGeometry args={[0.126, 0.166]} />
            <meshStandardMaterial
              color="#C8A25A"
              metalness={0.65}
              roughness={0.3}
            />
          </mesh>

          {/* Placeholder Photo Canvas */}
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.12, 0.16]} />
            <meshStandardMaterial color="#E6D8C5" roughness={0.55} />
          </mesh>
        </group>

        {/* Rear Folding Easel Support Stand */}
        <mesh
          position={[0, 0.072, -0.042]}
          rotation={[0.36, 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.036, 0.155, 0.01]} />
          <meshStandardMaterial
            map={oakTex}
            color="#B58B5A"
            roughness={0.48}
          />
        </mesh>
      </group>
    </group>
  );
}
