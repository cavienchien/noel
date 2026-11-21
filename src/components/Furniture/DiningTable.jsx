import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getOakWoodTexture } from '../../assets/textures/proceduralTextures';

export default function DiningTable({
  candlesOn,
  hoveredObject,
  isGuidedHighlighted,
  mode,
  onInteract,
}) {
  const oakTex = useMemo(() => getOakWoodTexture(), []);
  const flapShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.118, 0.078);
    shape.lineTo(0.118, 0.078);
    shape.lineTo(0, -0.015);
    shape.closePath();
    return shape;
  }, []);

  const isHoveredCandles = hoveredObject?.id === 'candles';

  const candleInteractData = {
    interactable: true,
    id: 'candles',
    name: 'Nến Trang Trí Bàn Ăn',
    actionLabel: candlesOn ? 'Tắt Nến' : 'Thắp Nến',
    area: 'Khu vực Bàn ăn',
    position: [2.35, 0.92, 0.15],
  };

  const handleCandleClick = (e) => {
    e.stopPropagation();
    if (mode === 'FREE_EXPLORE') {
      onInteract('candles');
    }
  };

  return (
    <group position={[2.35, 0, 0.18]} rotation={[0, -0.07, 0]}>
      {/* ================= MODERN BRASS LINEAR GLOBE CHANDELIER ABOVE DINING TABLE (this year.jpe) ================= */}
      <group position={[0, 2.52, 0]}>
        {/* Ceiling Suspension Rods */}
        <mesh position={[-0.48, 0.54, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 1.08, 10]} />
          <meshStandardMaterial color="#D4AF6A" metalness={0.88} roughness={0.2} />
        </mesh>
        <mesh position={[0.48, 0.54, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 1.08, 10]} />
          <meshStandardMaterial color="#D4AF6A" metalness={0.88} roughness={0.2} />
        </mesh>
        {/* Horizontal Brass Light Bar */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 1.38, 16]} />
          <meshStandardMaterial color="#D4AF6A" metalness={0.88} roughness={0.18} />
        </mesh>
        {/* 4 Warm Frosted Glass Globe Bulbs */}
        {[-0.58, -0.18, 0.18, 0.58].map((gx, idx) => (
          <group key={idx} position={[gx, idx % 2 === 0 ? -0.08 : 0.08, 0]}>
            <mesh>
              <sphereGeometry args={[0.075, 18, 18]} />
              <meshStandardMaterial
                color="#FFF9EB"
                emissive="#FFE19C"
                emissiveIntensity={1.25}
                roughness={0.2}
              />
            </mesh>
          </group>
        ))}
        <pointLight
          position={[0, -0.2, 0]}
          color="#FFE8B5"
          intensity={0.95}
          distance={5.5}
          decay={2}
        />
      </group>

      {/* Light Oak Rectangular Tabletop */}
      <mesh
        position={[0, 0.75, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.82, 0.055, 0.96]} />
        <meshStandardMaterial
          map={oakTex}
          color={isGuidedHighlighted ? '#E5C49A' : '#D5B184'}
          roughness={0.44}
          emissive={isGuidedHighlighted ? '#E9C879' : '#000000'}
          emissiveIntensity={isGuidedHighlighted ? 0.08 : 0}
        />
      </mesh>

      {/* Under-Table Apron Rails */}
      <mesh position={[0, 0.69, 0]} castShadow>
        <boxGeometry args={[1.64, 0.065, 0.78]} />
        <meshStandardMaterial map={oakTex} color="#C7A072" roughness={0.5} />
      </mesh>

      {/* 4 Square Oak Legs */}
      {[
        [-0.8, 0.36, -0.38],
        [0.8, 0.36, -0.38],
        [-0.8, 0.36, 0.38],
        [0.8, 0.36, 0.38],
      ].map(([lx, ly, lz], idx) => (
        <mesh
          key={idx}
          position={[lx, ly, lz]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.075, 0.72, 0.075]} />
          <meshStandardMaterial map={oakTex} color="#C9A375" roughness={0.48} />
        </mesh>
      ))}

      {/* ================= WOODEN CENTERPIECE TRAY WITH WHITE FLOWERS & 3 CANDLES ================= */}
      <group position={[0.08, 0.78, -0.02]}>
        <mesh
          position={[0, 0.012, 0]}
          scale={[1.35, 1, 0.95]}
          castShadow
        >
          <cylinderGeometry args={[0.21, 0.21, 0.024, 28]} />
          <meshStandardMaterial color="#B58B5A" roughness={0.5} />
        </mesh>

        {/* Clear Glass Vase with White Winter Blossoms */}
        <group
          position={[0.1, 0.025, 0]}
        >
          <mesh position={[0, 0.11, 0]} castShadow>
            <cylinderGeometry args={[0.068, 0.082, 0.22, 20]} />
            <meshPhysicalMaterial
              color="#E5ECE9"
              transparent
              opacity={0.55}
              roughness={0.12}
              transmission={0.65}
            />
          </mesh>
          {[0, 1.2, 2.4, 3.6, 4.8].map((ang, i) => (
            <mesh
              key={i}
              position={[Math.cos(ang) * 0.08, 0.26, Math.sin(ang) * 0.08]}
              rotation={[0.25, ang, 0.35]}
              castShadow
            >
              <sphereGeometry args={[0.048, 10, 10]} />
              <meshStandardMaterial color="#2D5236" roughness={0.75} />
            </mesh>
          ))}
          {[
            [0, 0.34, 0, 0.055],
            [-0.07, 0.3, 0.05, 0.048],
            [0.07, 0.31, 0.04, 0.048],
            [-0.05, 0.31, -0.06, 0.05],
            [0.06, 0.29, -0.05, 0.048],
          ].map(([fx, fy, fz, r], idx) => (
            <mesh key={idx} position={[fx, fy, fz]} castShadow>
              <dodecahedronGeometry args={[r, 1]} />
              <meshStandardMaterial color="#FAF8F5" roughness={0.45} />
            </mesh>
          ))}
        </group>

        {/* 3 Glowing Pillar Candles on Tray */}
        {[
          [-0.12, 0.13, -0.04],
          [-0.04, 0.16, -0.09],
          [-0.06, 0.09, 0.06],
        ].map(([cx, h, cz], idx) => (
          <group
            key={idx}
            position={[cx, 0.025, cz]}
            userData={candleInteractData}
            onClick={handleCandleClick}
          >
            <mesh position={[0, h * 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.032, 0.032, h, 16]} />
              <meshStandardMaterial
                color={isHoveredCandles ? '#FFF9EB' : '#F9F6F0'}
                roughness={0.34}
              />
            </mesh>
            {candlesOn && (
              <mesh position={[0, h + 0.018, 0]}>
                <coneGeometry args={[0.012, 0.035, 8]} />
                <meshBasicMaterial color="#FFD15C" />
              </mesh>
            )}
          </group>
        ))}

        {candlesOn && (
          <pointLight
            position={[-0.08, 0.24, 0]}
            color="#FFC25E"
            intensity={0.55}
            distance={2.8}
            decay={2}
          />
        )}
      </group>

      {/* ================= UNOPENED SEALED ENVELOPE ON TABLE CORNER ================= */}
      <group position={[-0.52, 0.778, 0.22]} rotation={[0, 0.32, 0]}>
        {/* Envelope Base Body */}
        <mesh position={[0, 0.004, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.008, 0.16]} />
          <meshStandardMaterial color="#FBF5EA" roughness={0.42} />
        </mesh>

        {/* Closed Triangular Top Flap (Unopened) */}
        <mesh
          position={[0, 0.0085, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
        >
          <shapeGeometry args={[flapShape]} />
          <meshStandardMaterial color="#F3E7D3" roughness={0.4} />
        </mesh>

        {/* Left & Right Diagonal Flap Fold Lines Meeting at the Seal */}
        <mesh position={[-0.058, 0.0088, -0.0305]} rotation={[0, -0.665, 0]}>
          <boxGeometry args={[0.148, 0.001, 0.003]} />
          <meshStandardMaterial color="#D6C3A5" roughness={0.5} />
        </mesh>
        <mesh position={[0.058, 0.0088, -0.0305]} rotation={[0, 0.665, 0]}>
          <boxGeometry args={[0.148, 0.001, 0.003]} />
          <meshStandardMaterial color="#D6C3A5" roughness={0.5} />
        </mesh>

        {/* Thin Gold Trim Edge Along Top Fold */}
        <mesh position={[0, 0.0088, -0.078]}>
          <boxGeometry args={[0.236, 0.001, 0.0035]} />
          <meshStandardMaterial color="#D4AF6A" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Red Wax Seal Keeping the Envelope Closed */}
        <group position={[0, 0.01, 0.015]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.022, 0.024, 0.004, 24]} />
            <meshStandardMaterial
              color="#9E2222"
              roughness={0.32}
              metalness={0.15}
            />
          </mesh>
          <mesh position={[0, 0.0022, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.0015, 20]} />
            <meshStandardMaterial
              color="#B82929"
              roughness={0.28}
              metalness={0.2}
            />
          </mesh>
          {/* Tiny Gold Stamp Emblem on Wax Seal */}
          <mesh position={[0, 0.0032, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.001, 6]} />
            <meshStandardMaterial
              color="#E9C879"
              metalness={0.75}
              roughness={0.25}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
