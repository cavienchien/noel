import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  getWinterPaintingTexture,
  getOakWoodTexture,
  getWhiteBrickTexture,
} from '../../assets/textures/proceduralTextures';

export default function Fireplace({
  fireplaceOn,
  candlesOn,
  hoveredObject,
  isGuidedHighlighted,
  mode,
  onInteract,
  isMobileDevice = false,
}) {
  const flameGroupRef = useRef();
  const fireLightRef = useRef();
  const paintingTex = useMemo(() => getWinterPaintingTexture(), []);
  const oakTex = useMemo(() => getOakWoodTexture(), []);
  const whiteBrickTex = useMemo(() => getWhiteBrickTexture(), []);

  const isHoveredFireplace = hoveredObject?.id === 'fireplace';
  const isHoveredCandles = hoveredObject?.id === 'candles';

  // Lush Cascading Pine Garland along top & draping down both sides (inspired by ong.jpe)
  const { garlandClusters, garlandLights } = useMemo(() => {
    const clusters = [];
    const lights = [];

    // Top mantel sweep
    for (let i = 0; i < 19; i++) {
      const t = i / 18;
      const x = -1.1 + t * 2.2;
      const y = 1.44 + Math.sin(t * Math.PI * 3) * 0.025;
      clusters.push({ pos: [x, y, 0.25], r: 0.095 });
      if (i % 1 === 0) {
        lights.push({
          pos: [x, y + 0.02, 0.33],
          isBerry: i % 3 === 0,
        });
      }
    }

    // Left & Right graceful cascading drapes down the mantel sides (ong.jpe)
    [-1.12, 1.12].forEach((sideX) => {
      for (let j = 1; j <= 7; j++) {
        const dy = 1.44 - j * 0.115;
        const dx = sideX + (sideX < 0 ? -0.02 : 0.02) * Math.sin(j * 0.7);
        clusters.push({ pos: [dx, dy, 0.25], r: 0.082 - j * 0.004 });
        if (j % 2 === 1) {
          lights.push({
            pos: [dx, dy, 0.32],
            isBerry: j % 4 === 1,
          });
        }
      }
    });

    return { garlandClusters: clusters, garlandLights: lights };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (flameGroupRef.current && fireplaceOn) {
      flameGroupRef.current.children.forEach((flame, idx) => {
        const speed = 5.5 + idx * 1.3;
        flame.scale.y = 0.85 + Math.sin(t * speed + idx) * 0.28;
        flame.scale.x = 0.9 + Math.cos(t * (speed * 0.8) + idx * 2) * 0.14;
        flame.rotation.z = Math.sin(t * 3.8 + idx) * 0.14;
      });
    }
    if (fireLightRef.current) {
      if (fireplaceOn) {
        fireLightRef.current.intensity =
          2.35 + Math.sin(t * 11) * 0.28 + Math.cos(t * 7.3) * 0.2;
      } else {
        fireLightRef.current.intensity = 0;
      }
    }
  });

  const fireplaceInteractData = {
    interactable: true,
    id: 'fireplace',
    name: 'Lò Sưởi Phong Cách Bắc Âu',
    actionLabel: fireplaceOn ? 'Tắt Lửa Lò Sưởi' : 'Thắp Lửa Lò Sưởi',
    area: 'Lò sưởi',
    position: [-2.15, 0.9, -2.75],
  };

  const candleInteractData = {
    interactable: true,
    id: 'candles',
    name: 'Nến Bệ Lò Sưởi & Đèn Lồng',
    actionLabel: candlesOn ? 'Tắt Nến' : 'Thắp Nến',
    area: 'Lò sưởi',
    position: [-2.85, 1.65, -2.85],
  };

  const handleFireplaceClick = (e) => {
    e.stopPropagation();
    if (mode === 'FREE_EXPLORE') onInteract('fireplace');
  };

  const handleCandleClick = (e) => {
    e.stopPropagation();
    if (mode === 'FREE_EXPLORE') onInteract('candles');
  };

  const mantelColor =
    isHoveredFireplace || isGuidedHighlighted ? '#FFFDF9' : '#F6F1E7';
  const mantelEmissive =
    isHoveredFireplace || isGuidedHighlighted ? '#E9C879' : '#000000';
  const mantelEmissiveIntensity = isHoveredFireplace
    ? 0.14
    : isGuidedHighlighted
    ? 0.08
    : 0;

  return (
    <group position={[-2.15, 0, -3.02]}>
      {/* ================= 1. FIREPLACE ARCHITECTURAL MANTEL WITH WHITE BRICK SURROUND ================= */}
      {/* Low Hearth Floor Base Slab */}
      <mesh
        position={[0, 0.055, 0.22]}
        castShadow
        receiveShadow
        userData={fireplaceInteractData}
        onClick={handleFireplaceClick}
      >
        <boxGeometry args={[2.32, 0.11, 0.58]} />
        <meshStandardMaterial
          color={mantelColor}
          roughness={0.4}
          emissive={mantelEmissive}
          emissiveIntensity={mantelEmissiveIntensity}
        />
      </mesh>

      {/* Left & Right Pilaster Columns */}
      {[-0.86, 0.86].map((px, idx) => (
        <group key={idx} position={[px, 0.72, 0.16]}>
          <mesh
            castShadow
            receiveShadow
            userData={fireplaceInteractData}
            onClick={handleFireplaceClick}
          >
            <boxGeometry args={[0.42, 1.24, 0.34]} />
            <meshStandardMaterial
              color={mantelColor}
              roughness={0.44}
              emissive={mantelEmissive}
              emissiveIntensity={mantelEmissiveIntensity}
            />
          </mesh>
          <mesh position={[0, 0, 0.175]}>
            <boxGeometry args={[0.26, 0.96, 0.02]} />
            <meshStandardMaterial color="#EFE8DC" roughness={0.48} />
          </mesh>
        </group>
      ))}

      {/* Upper Frieze Beam above Firebox */}
      <mesh
        position={[0, 1.14, 0.16]}
        castShadow
        receiveShadow
        userData={fireplaceInteractData}
        onClick={handleFireplaceClick}
      >
        <boxGeometry args={[1.36, 0.38, 0.32]} />
        <meshStandardMaterial
          color={mantelColor}
          roughness={0.44}
          emissive={mantelEmissive}
          emissiveIntensity={mantelEmissiveIntensity}
        />
      </mesh>

      {/* Textured White Brick Inner Surround Framing the Firebox (noel.jpe + ong.jpe) */}
      <mesh
        position={[0, 0.54, 0.14]}
        receiveShadow
        userData={fireplaceInteractData}
        onClick={handleFireplaceClick}
      >
        <boxGeometry args={[1.38, 0.92, 0.24]} />
        <meshStandardMaterial
          map={whiteBrickTex}
          color="#F5EFE6"
          roughness={0.78}
        />
      </mesh>

      {/* Stepped Top Mantelpiece Shelf */}
      <mesh
        position={[0, 1.35, 0.18]}
        castShadow
        receiveShadow
        userData={fireplaceInteractData}
        onClick={handleFireplaceClick}
      >
        <boxGeometry args={[2.28, 0.06, 0.4]} />
        <meshStandardMaterial color={mantelColor} roughness={0.38} />
      </mesh>
      <mesh
        position={[0, 1.4, 0.2]}
        castShadow
        receiveShadow
        userData={fireplaceInteractData}
        onClick={handleFireplaceClick}
      >
        <boxGeometry args={[2.38, 0.06, 0.44]} />
        <meshStandardMaterial color={mantelColor} roughness={0.36} />
      </mesh>

      {/* ================= 2. INNER CAST-IRON FIREBOX & ANIMATED FLAMES ================= */}
      <group
        position={[0, 0.52, 0.17]}
        userData={fireplaceInteractData}
        onClick={handleFireplaceClick}
      >
        <mesh castShadow>
          <boxGeometry args={[1.18, 0.8, 0.22]} />
          <meshStandardMaterial
            color="#1E1C1A"
            roughness={0.5}
            metalness={0.4}
          />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[1.04, 0.66, 0.18]} />
          <meshStandardMaterial color="#12100E" roughness={0.9} />
        </mesh>

        {/* Birch Firewood Logs & Glowing Embers */}
        <mesh
          position={[-0.18, -0.22, 0.06]}
          rotation={[0, 0.25, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.055, 0.055, 0.52, 12]} />
          <meshStandardMaterial color="#3A2518" roughness={0.9} />
        </mesh>
        <mesh
          position={[0.16, -0.21, 0.07]}
          rotation={[0, -0.3, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.05, 0.05, 0.5, 12]} />
          <meshStandardMaterial color="#422B1D" roughness={0.9} />
        </mesh>
        <mesh
          position={[0, -0.16, 0.08]}
          rotation={[0.15, 0.05, Math.PI / 2 - 0.12]}
        >
          <cylinderGeometry args={[0.048, 0.048, 0.62, 12]} />
          <meshStandardMaterial
            color="#2E1D12"
            roughness={0.88}
            emissive={fireplaceOn ? '#D9531E' : '#000000'}
            emissiveIntensity={fireplaceOn ? 0.55 : 0}
          />
        </mesh>

        {/* Glowing Ember Bed */}
        <mesh position={[0, -0.27, 0.07]}>
          <boxGeometry args={[0.78, 0.04, 0.14]} />
          <meshStandardMaterial
            color={fireplaceOn ? '#FF6A1A' : '#2A221E'}
            emissive={fireplaceOn ? '#FF4500' : '#000000'}
            emissiveIntensity={fireplaceOn ? 2.1 : 0}
          />
        </mesh>

        {/* Animated Multi-Tongue 3D Flames */}
        {fireplaceOn && (
          <group ref={flameGroupRef} position={[0, -0.18, 0.08]}>
            {[
              [-0.28, 0.11, 0, 0.19, '#FF5500'],
              [-0.14, 0.17, 0.02, 0.27, '#FF8C1A'],
              [0, 0.22, 0, 0.34, '#FFB833'],
              [0.14, 0.16, -0.01, 0.26, '#FF7B14'],
              [0.27, 0.11, 0.01, 0.18, '#FF4D00'],
              [-0.06, 0.13, 0.03, 0.21, '#FFE066'],
              [0.08, 0.14, 0.03, 0.2, '#FFD24C'],
            ].map(([fx, fy, fz, h, col], i) => (
              <mesh key={i} position={[fx, fy, fz]}>
                <coneGeometry args={[0.075, h, 10]} />
                <meshBasicMaterial color={col} transparent opacity={0.9} />
              </mesh>
            ))}
          </group>
        )}

        {/* Dynamic Fire PointLight Reflecting onto Floor & Surroundings (disable 6-pass cube shadow on mobile GPUs) */}
        <pointLight
          ref={fireLightRef}
          position={[0, 0.06, 0.48]}
          color="#FF9636"
          intensity={fireplaceOn ? 2.35 : 0}
          distance={7.0}
          decay={1.8}
          castShadow={!isMobileDevice}
        />
      </group>

      {/* ================= 3. LUSH CASCADING PINE GARLAND, CANDLESTICKS & DECOR ================= */}
      {garlandClusters.map((c, idx) => (
        <mesh
          key={idx}
          position={c.pos}
          rotation={[0.2, idx * 0.45, 0.3]}
          castShadow
        >
          <dodecahedronGeometry args={[c.r, 1]} />
          <meshStandardMaterial color="#214630" roughness={0.84} />
        </mesh>
      ))}

      {garlandLights.map((item, idx) => (
        <mesh key={idx} position={item.pos}>
          <sphereGeometry args={[item.isBerry ? 0.019 : 0.015, 8, 8]} />
          {item.isBerry ? (
            <meshStandardMaterial color="#B22222" roughness={0.3} />
          ) : (
            <meshBasicMaterial color="#FFE594" />
          )}
        </mesh>
      ))}

      {/* 4 Brass & Wood Candlesticks on Left of Mantel */}
      {[
        [-0.92, 0.28],
        [-0.81, 0.26],
        [-0.68, 0.18],
        [-0.57, 0.16],
      ].map(([cx, h], idx) => (
        <group
          key={idx}
          position={[cx, 1.43, 0.18]}
          userData={candleInteractData}
          onClick={handleCandleClick}
        >
          <mesh position={[0, h * 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.036, h * 0.9, 14]} />
            <meshStandardMaterial
              color={isHoveredCandles ? '#F5D78E' : '#C59E5B'}
              metalness={0.78}
              roughness={0.22}
            />
          </mesh>
          <mesh position={[0, h * 0.9 + 0.09, 0]} castShadow>
            <cylinderGeometry args={[0.011, 0.012, 0.18, 12]} />
            <meshStandardMaterial color="#F9F6F0" roughness={0.38} />
          </mesh>
          {candlesOn && (
            <mesh position={[0, h * 0.9 + 0.2, 0]}>
              <coneGeometry args={[0.012, 0.038, 8]} />
              <meshBasicMaterial color="#FFD15C" />
            </mesh>
          )}
        </group>
      ))}

      {/* Mini Decorative Gold & Silver Cone Trees on Mantel (inspired by merry.jpe) */}
      <group position={[0.42, 1.43, 0.16]}>
        <mesh position={[0, 0.13, 0]} castShadow>
          <coneGeometry args={[0.045, 0.26, 16]} />
          <meshStandardMaterial color="#E5C170" metalness={0.72} roughness={0.26} />
        </mesh>
        <mesh position={[0.09, 0.09, 0.02]} castShadow>
          <coneGeometry args={[0.036, 0.18, 16]} />
          <meshStandardMaterial color="#EAE6DF" metalness={0.35} roughness={0.32} />
        </mesh>
      </group>

      {/* Cute 3D Snowman Figurine & Pillar Candle on Right of Mantel */}
      <group position={[0.8, 1.43, 0.18]}>
        <mesh position={[0, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.105, 18, 18]} />
          <meshStandardMaterial color="#FAF8F5" roughness={0.38} />
        </mesh>
        <mesh position={[0, 0.24, 0]} castShadow>
          <sphereGeometry args={[0.072, 18, 18]} />
          <meshStandardMaterial color="#FAF8F5" roughness={0.38} />
        </mesh>
        <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.062, 0.018, 10, 20]} />
          <meshStandardMaterial color="#A82424" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.31, 0]}>
          <cylinderGeometry args={[0.068, 0.068, 0.012, 16]} />
          <meshStandardMaterial color="#2D2520" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.075, 16]} />
          <meshStandardMaterial color="#2D2520" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.24, 0.078]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.012, 0.04, 8]} />
          <meshStandardMaterial color="#E06D2B" />
        </mesh>
        <group
          position={[-0.18, 0, 0.02]}
          userData={candleInteractData}
          onClick={handleCandleClick}
        >
          <mesh position={[0, 0.06, 0]} castShadow>
            <cylinderGeometry args={[0.032, 0.032, 0.12, 14]} />
            <meshStandardMaterial color="#F9F6F0" roughness={0.38} />
          </mesh>
          {candlesOn && (
            <mesh position={[0, 0.135, 0]}>
              <coneGeometry args={[0.014, 0.038, 8]} />
              <meshBasicMaterial color="#FFD15C" />
            </mesh>
          )}
        </group>
      </group>

      {candlesOn && (
        <pointLight
          position={[-0.35, 1.72, 0.35]}
          color="#FFA938"
          intensity={1.75}
          distance={5.6}
          decay={1.6}
        />
      )}

      {/* ================= 4. FRAMED WINTER LANDSCAPE PAINTING & BRASS PICTURE LIGHT ================= */}
      <group position={[0, 2.26, 0.02]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.42, 1.08, 0.045]} />
          <meshStandardMaterial
            map={oakTex}
            color="#C9A26E"
            roughness={0.38}
            metalness={0.22}
          />
        </mesh>
        <mesh position={[0, 0, 0.024]}>
          <planeGeometry args={[1.34, 1.0]} />
          <meshStandardMaterial color="#F9F6F0" roughness={0.58} />
        </mesh>
        <mesh position={[0, 0, 0.026]}>
          <planeGeometry args={[1.28, 0.94]} />
          <meshStandardMaterial map={paintingTex} roughness={0.5} />
        </mesh>

        {/* Brass Picture Light Mounted Above Frame */}
        <group position={[0, 0.67, 0.05]}>
          <mesh position={[0, 0.02, -0.03]}>
            <boxGeometry args={[0.16, 0.045, 0.04]} />
            <meshStandardMaterial
              color="#D4AF6A"
              metalness={0.88}
              roughness={0.18}
            />
          </mesh>
          <mesh position={[0, 0, 0.06]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.64, 16]} />
            <meshStandardMaterial
              color="#D4AF6A"
              metalness={0.88}
              roughness={0.18}
            />
          </mesh>
          <pointLight
            position={[0, -0.08, 0.14]}
            color="#FFE5A3"
            intensity={0.85}
            distance={2.4}
            decay={2}
          />
        </group>
      </group>

      {/* ================= 5. LEFT FLOOR DECOR: RED WINTERBERRY VASE & BRASS LANTERN ================= */}
      <group position={[-1.58, 0, 0.24]}>
        <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.105, 0.125, 0.48, 20]} />
          <meshStandardMaterial color="#DFD3C3" roughness={0.45} />
        </mesh>
        {[
          [-0.08, 0.65, -0.04, -0.18],
          [-0.03, 0.75, 0.03, -0.08],
          [0.02, 0.78, -0.02, 0.05],
          [0.07, 0.7, 0.04, 0.16],
          [0, 0.72, 0.06, 0.02],
        ].map(([bx, by, bz, rotZ], i) => (
          <group key={i} position={[bx, by, bz]} rotation={[0, i * 0.6, rotZ]}>
            <mesh>
              <cylinderGeometry args={[0.006, 0.009, 0.56, 8]} />
              <meshStandardMaterial color="#4A3228" roughness={0.9} />
            </mesh>
            {[-0.12, -0.04, 0.04, 0.12, 0.2].map((ry, ri) => (
              <mesh
                key={ri}
                position={[
                  Math.sin(ri * 2.1) * 0.045,
                  ry,
                  Math.cos(ri * 2.1) * 0.045,
                ]}
              >
                <sphereGeometry args={[0.018, 8, 8]} />
                <meshStandardMaterial color="#A82222" roughness={0.3} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Brass & Glass Floor Candle Lantern */}
      <group
        position={[-1.24, 0, 0.34]}
        userData={candleInteractData}
        onClick={handleCandleClick}
      >
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.26, 0.04, 0.26]} />
          <meshStandardMaterial
            color="#C49A5A"
            metalness={0.8}
            roughness={0.22}
          />
        </mesh>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.26, 0.035, 0.26]} />
          <meshStandardMaterial
            color="#C49A5A"
            metalness={0.8}
            roughness={0.22}
          />
        </mesh>
        {[
          [-0.11, -0.11],
          [0.11, -0.11],
          [-0.11, 0.11],
          [0.11, 0.11],
        ].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0.22, lz]} castShadow>
            <boxGeometry args={[0.018, 0.38, 0.018]} />
            <meshStandardMaterial
              color="#C49A5A"
              metalness={0.82}
              roughness={0.2}
            />
          </mesh>
        ))}
        <mesh position={[0, 0.5, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.17, 0.14, 4]} />
          <meshStandardMaterial
            color="#C49A5A"
            metalness={0.8}
            roughness={0.22}
          />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <torusGeometry args={[0.04, 0.008, 10, 20]} />
          <meshStandardMaterial
            color="#C49A5A"
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.16, 16]} />
          <meshStandardMaterial color="#F9F6F0" roughness={0.35} />
        </mesh>
        {candlesOn && (
          <>
            <mesh position={[0, 0.22, 0]}>
              <coneGeometry args={[0.018, 0.048, 10]} />
              <meshBasicMaterial color="#FFD15C" />
            </mesh>
            <pointLight
              position={[0, 0.22, 0]}
              color="#FFA630"
              intensity={1.55}
              distance={5.0}
              decay={1.6}
            />
          </>
        )}
      </group>

      {/* Small Golden Reindeer Figurine on Right Floor of Fireplace */}
      <group position={[1.28, 0, 0.34]} rotation={[0, -0.45, 0]}>
        <mesh position={[0, 0.12, 0]}>
          <capsuleGeometry args={[0.025, 0.09, 8, 8]} />
          <meshStandardMaterial
            color="#E9C879"
            metalness={0.88}
            roughness={0.18}
            emissive="#E9C879"
            emissiveIntensity={0.38}
          />
        </mesh>
        <mesh position={[0, 0.22, 0.04]}>
          <sphereGeometry args={[0.024, 10, 10]} />
          <meshStandardMaterial
            color="#E9C879"
            metalness={0.88}
            roughness={0.18}
            emissive="#E9C879"
            emissiveIntensity={0.42}
          />
        </mesh>
      </group>
    </group>
  );
}
