import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getGiftWrapTexture } from '../../assets/textures/proceduralTextures';

export default function ChristmasTree({
  treeLightsOn,
  giftsOpened,
  hoveredObject,
  isGuidedHighlighted,
  mode,
  onInteract,
  isMobileDevice = false,
}) {
  const starRef = useRef();
  const lightsGroupRef = useRef();
  const giftsRingRef = useRef();
  const giftLidRefs = useRef([]);
  const giftSurpriseRefs = useRef([]);
  const ringAngleRef = useRef(0);
  const isDraggingRingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const didDragRingRef = useRef(false);

  const stripeTex = useMemo(() => getGiftWrapTexture('stripes'), []);
  const dotsTex = useMemo(() => getGiftWrapTexture('dots'), []);
  const kraftTex = useMemo(() => getGiftWrapTexture('kraft'), []);

  const isHoveredTree = hoveredObject?.id === 'christmas-tree';
  const isHoveredGifts = hoveredObject?.id === 'gift-boxes';

  // Generate spiral LED fairy lights, golden beaded garlands, star ornaments & baubles (noel.jpe + merry.jpe)
  const { fairyLights, ornaments, starOrnaments, beadGarlands } = useMemo(() => {
    const lights = [];
    const baubles = [];
    const stars = [];
    const beads = [];

    // Warm Golden LED Fairy Lights (lighter draw calls on mobile/iPad)
    const lightCount = isMobileDevice ? 58 : 110;
    for (let i = 0; i < lightCount; i++) {
      const t = i / (lightCount - 1);
      const y = 0.42 + t * 2.18;
      const maxR = (1 - t * 0.84) * 0.82;
      const angle = t * Math.PI * 20;
      lights.push({
        pos: [Math.cos(angle) * maxR, y, Math.sin(angle) * maxR],
        phase: i * 0.45,
      });
    }

    // Metallic & Matte Ornaments
    const palette = ['#B22222', '#E9C879', '#F9F6F0', '#D4A857', '#9E2222', '#EFE6D5'];
    const baubleCount = isMobileDevice ? 36 : 54;
    for (let i = 0; i < baubleCount; i++) {
      const t = (i + 0.4) / baubleCount;
      const y = 0.48 + t * 1.98;
      const r = (1 - t * 0.82) * 0.77;
      const angle = i * 2.39996;
      baubles.push({
        pos: [Math.cos(angle) * r, y, Math.sin(angle) * r],
        color: palette[i % palette.length],
        size: 0.044 + (i % 3) * 0.011,
        metalness: i % 2 === 0 ? 0.72 : 0.28,
        roughness: i % 2 === 0 ? 0.16 : 0.38,
      });
    }

    // Golden 3D Star Ornaments
    const starCount = isMobileDevice ? 6 : 10;
    for (let i = 0; i < starCount; i++) {
      const t = (i + 0.6) / (starCount + 1);
      const y = 0.65 + t * 1.65;
      const r = (1 - t * 0.78) * 0.74;
      const angle = i * 1.85 + 0.4;
      stars.push({
        pos: [Math.cos(angle) * r, y, Math.sin(angle) * r],
        rotY: -angle,
      });
    }

    // Golden Beaded Garland Drapes (lighter bead density on mobile)
    [0.72, 1.16, 1.6, 2.0].forEach((ringY, rIdx) => {
      const baseR = 0.74 - rIdx * 0.145;
      const beadCount = isMobileDevice ? 22 - rIdx * 3 : 46 - rIdx * 6;
      for (let b = 0; b < beadCount; b++) {
        const ang = (b / beadCount) * Math.PI * 2;
        const swoop = Math.sin(ang * 5) * 0.075;
        beads.push([
          Math.cos(ang) * (baseR + 0.02),
          ringY + swoop,
          Math.sin(ang) * (baseR + 0.02),
        ]);
      }
    });

    return {
      fairyLights: lights,
      ornaments: baubles,
      starOrnaments: stars,
      beadGarlands: beads,
    };
  }, [isMobileDevice]);

  // Bespoke Patterned Gift Boxes arranged in a circle around the Christmas Tree axis
  const giftConfigs = useMemo(() => {
    const items = [
      {
        size: [0.32, 0.28, 0.3],
        boxColor: '#FFFFFF',
        map: stripeTex,
        ribbonColor: '#B22222',
      },
      {
        size: [0.27, 0.22, 0.26],
        boxColor: '#FFFFFF',
        map: dotsTex,
        ribbonColor: '#B22222',
      },
      {
        size: [0.28, 0.24, 0.26],
        boxColor: '#A62424',
        map: null,
        ribbonColor: '#E9C879',
      },
      {
        size: [0.29, 0.26, 0.28],
        boxColor: '#FFFFFF',
        map: kraftTex,
        ribbonColor: '#F5EFE6',
      },
      {
        size: [0.25, 0.2, 0.24],
        boxColor: '#FFFFFF',
        map: kraftTex,
        ribbonColor: '#A62424',
      },
      {
        size: [0.26, 0.22, 0.25],
        boxColor: '#FFFFFF',
        map: stripeTex,
        ribbonColor: '#E9C879',
      },
    ];
    const radius = 0.85;
    return items.map((item, idx) => {
      const angle = (idx / items.length) * Math.PI * 2;
      return {
        ...item,
        pos: [
          Math.sin(angle) * radius,
          item.size[1] * 0.5 + 0.02,
          Math.cos(angle) * radius,
        ],
        rotY: angle,
      };
    });
  }, [stripeTex, dotsTex, kraftTex]);

  // Allow user from any position in the room to rotate the gift box circle around the tree axis when giftsOpened
  useEffect(() => {
    if (!giftsOpened) return;

    const handleWheel = (e) => {
      ringAngleRef.current += e.deltaY * 0.0025;
    };

    const handlePointerMove = (e) => {
      if (!isDraggingRingRef.current) return;
      const dx = e.clientX - dragStartXRef.current;
      if (Math.abs(dx) > 3) {
        didDragRingRef.current = true;
      }
      dragStartXRef.current = e.clientX;
      ringAngleRef.current += dx * 0.012;
    };

    const handlePointerUp = () => {
      isDraggingRingRef.current = false;
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      isDraggingRingRef.current = false;
    };
  }, [giftsOpened]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (starRef.current) {
      starRef.current.rotation.y = Math.sin(t * 0.8) * 0.22;
    }

    if (lightsGroupRef.current && treeLightsOn) {
      lightsGroupRef.current.children.forEach((mesh, idx) => {
        const s = 0.8 + Math.sin(t * 3.8 + idx * 0.65) * 0.3;
        mesh.scale.setScalar(s);
      });
    }

    if (giftsRingRef.current) {
      if (giftsOpened && !isDraggingRingRef.current) {
        ringAngleRef.current += delta * 0.55;
      }
      giftsRingRef.current.rotation.y = THREE.MathUtils.lerp(
        giftsRingRef.current.rotation.y,
        ringAngleRef.current,
        Math.min(1, delta * 8)
      );
    }

    giftConfigs.forEach((cfg, idx) => {
      const lid = giftLidRefs.current[idx];
      const surprise = giftSurpriseRefs.current[idx];
      if (lid) {
        const targetY = giftsOpened
          ? cfg.size[1] * 0.5 + 0.18
          : cfg.size[1] * 0.5 + 0.015;
        const targetRotX = giftsOpened ? -0.65 : 0;
        const targetZ = giftsOpened ? -0.12 : 0;
        lid.position.y = THREE.MathUtils.lerp(
          lid.position.y,
          targetY,
          Math.min(1, delta * 4.5)
        );
        lid.position.z = THREE.MathUtils.lerp(
          lid.position.z,
          targetZ,
          Math.min(1, delta * 4.5)
        );
        lid.rotation.x = THREE.MathUtils.lerp(
          lid.rotation.x,
          targetRotX,
          Math.min(1, delta * 4.5)
        );
      }
      if (surprise) {
        const targetSY = giftsOpened
          ? cfg.size[1] * 0.5 + 0.14 + Math.sin(t * 3 + idx) * 0.03
          : 0;
        const targetScale = giftsOpened ? 1 : 0.01;
        surprise.position.y = THREE.MathUtils.lerp(
          surprise.position.y,
          targetSY,
          Math.min(1, delta * 4.5)
        );
        surprise.scale.setScalar(
          THREE.MathUtils.lerp(
            surprise.scale.x,
            targetScale,
            Math.min(1, delta * 5)
          )
        );
        surprise.rotation.y += delta * 1.5;
      }
    });
  });

  const treeInteractData = {
    interactable: true,
    id: 'christmas-tree',
    name: 'Cây Thông Noel',
    actionLabel: treeLightsOn ? 'Tắt Đèn Cây Thông' : 'Bật Đèn Cây Thông',
    area: 'Cây thông Noel',
    position: [0.55, 1.4, -2.35],
  };

  const giftInteractData = {
    interactable: true,
    id: 'gift-boxes',
    name: 'Hộp Quà Giáng Sinh',
    actionLabel: giftsOpened ? 'Đóng Hộp Quà' : 'Mở Hộp Quà',
    area: 'Cây thông Noel',
    position: [0.55, 0.3, -1.85],
  };

  const handleTreeClick = (e) => {
    e.stopPropagation();
    if (mode === 'FREE_EXPLORE') onInteract('christmas-tree');
  };

  const handleGiftPointerDown = (e) => {
    if (mode !== 'FREE_EXPLORE' || !giftsOpened) return;
    e.stopPropagation();
    isDraggingRingRef.current = true;
    didDragRingRef.current = false;
    dragStartXRef.current = e.clientX;
  };

  const handleGiftClick = (e) => {
    e.stopPropagation();
    if (didDragRingRef.current) {
      didDragRingRef.current = false;
      return;
    }
    if (mode === 'FREE_EXPLORE') onInteract('gift-boxes');
  };

  const pineColor =
    isHoveredTree || isGuidedHighlighted ? '#2C5C40' : '#20452F';

  return (
    <group position={[0.55, 0, -2.35]}>
      {/* Plush Round Faux-Fur White Tree Skirt */}
      <mesh position={[0, 0.02, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.95, 0.99, 0.04, 36]} />
        <meshStandardMaterial color="#F6F1E9" roughness={0.92} />
      </mesh>

      {/* Pine Tree Trunk */}
      <mesh
        position={[0, 0.25, 0]}
        castShadow
        userData={treeInteractData}
        onClick={handleTreeClick}
      >
        <cylinderGeometry args={[0.09, 0.13, 0.5, 12]} />
        <meshStandardMaterial color="#4D3624" roughness={0.9} />
      </mesh>

      {/* 9 Lush Layered Evergreen Pine Foliage Tiers */}
      {[
        { y: 0.54, r: 0.86, h: 0.58 },
        { y: 0.82, r: 0.78, h: 0.54 },
        { y: 1.09, r: 0.7, h: 0.5 },
        { y: 1.34, r: 0.62, h: 0.48 },
        { y: 1.58, r: 0.53, h: 0.45 },
        { y: 1.81, r: 0.44, h: 0.42 },
        { y: 2.02, r: 0.35, h: 0.38 },
        { y: 2.22, r: 0.26, h: 0.35 },
        { y: 2.41, r: 0.17, h: 0.32 },
      ].map((tier, idx) => (
        <mesh
          key={idx}
          position={[0, tier.y, 0]}
          rotation={[0, idx * 0.38, 0]}
          castShadow
          receiveShadow
          userData={treeInteractData}
          onClick={handleTreeClick}
        >
          <coneGeometry args={[tier.r, tier.h, 14]} />
          <meshStandardMaterial
            color={pineColor}
            roughness={0.82}
            emissive={
              isHoveredTree || isGuidedHighlighted ? '#E9C879' : '#000000'
            }
            emissiveIntensity={
              isHoveredTree ? 0.12 : isGuidedHighlighted ? 0.07 : 0
            }
          />
        </mesh>
      ))}

      {/* Glowing Golden Star Topper */}
      <group
        ref={starRef}
        position={[0, 2.66, 0]}
        userData={treeInteractData}
        onClick={handleTreeClick}
      >
        <mesh castShadow>
          <octahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial
            color="#FFE699"
            emissive="#FFBA38"
            emissiveIntensity={treeLightsOn ? 2.5 : 0.15}
            metalness={0.78}
            roughness={0.18}
          />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <octahedronGeometry args={[0.115, 0]} />
          <meshStandardMaterial
            color="#FFF2C2"
            emissive="#FFD166"
            emissiveIntensity={treeLightsOn ? 2.2 : 0.1}
          />
        </mesh>
        {treeLightsOn && (
          <pointLight
            color="#FFD275"
            intensity={1.35}
            distance={4.8}
            decay={2}
          />
        )}
      </group>

      {/* Golden Beaded Garland Drapes (inspired by noel.jpe) */}
      {beadGarlands.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.013, 8, 8]} />
          <meshStandardMaterial
            color="#E9C879"
            metalness={0.88}
            roughness={0.16}
          />
        </mesh>
      ))}

      {/* 3D Golden Star Ornaments on Tree (inspired by noel.jpe) */}
      {starOrnaments.map((st, idx) => (
        <mesh
          key={idx}
          position={st.pos}
          rotation={[0, st.rotY, Math.PI / 4]}
          castShadow
        >
          <octahedronGeometry args={[0.055, 0]} />
          <meshStandardMaterial
            color="#F2D27C"
            metalness={0.86}
            roughness={0.16}
          />
        </mesh>
      ))}

      {/* 110 Warm Twinkling LED Fairy Lights */}
      <group ref={lightsGroupRef}>
        {fairyLights.map((light, idx) => (
          <mesh
            key={idx}
            position={light.pos}
            userData={treeInteractData}
            onClick={handleTreeClick}
          >
            <sphereGeometry args={[0.017, 8, 8]} />
            {treeLightsOn ? (
              <meshBasicMaterial color="#FFE694" />
            ) : (
              <meshStandardMaterial color="#8A7E6A" roughness={0.5} />
            )}
          </mesh>
        ))}
      </group>

      {treeLightsOn && (
        <>
          <pointLight
            position={[0, 1.38, 0.4]}
            color="#FFC252"
            intensity={1.45}
            distance={5.2}
            decay={1.8}
          />
          <pointLight
            position={[0, 0.48, 0.55]}
            color="#FFB042"
            intensity={1.35}
            distance={4.8}
            decay={1.65}
          />
        </>
      )}

      {/* Christmas Ornaments / Baubles */}
      {ornaments.map((b, idx) => (
        <mesh
          key={idx}
          position={b.pos}
          castShadow
          userData={treeInteractData}
          onClick={handleTreeClick}
        >
          <sphereGeometry args={[b.size, 14, 14]} />
          <meshStandardMaterial
            color={b.color}
            metalness={b.metalness}
            roughness={b.roughness}
          />
        </mesh>
      ))}

      {/* ================= INTERACTIVE PATTERNED GIFT BOXES UNDER TREE ================= */}
      <group ref={giftsRingRef}>
        {giftConfigs.map((cfg, idx) => {
          const [w, h, d] = cfg.size;
          return (
            <group
              key={idx}
              position={cfg.pos}
              rotation={[0, cfg.rotY, 0]}
              userData={giftInteractData}
              onPointerDown={handleGiftPointerDown}
              onClick={handleGiftClick}
            >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial
                color={cfg.boxColor}
                map={cfg.map}
                roughness={0.44}
                emissive={isHoveredGifts ? '#E9C879' : '#000000'}
                emissiveIntensity={isHoveredGifts ? 0.2 : 0}
              />
            </mesh>
            <mesh>
              <boxGeometry args={[w + 0.008, h + 0.004, 0.042]} />
              <meshStandardMaterial
                color={cfg.ribbonColor}
                metalness={0.42}
                roughness={0.28}
              />
            </mesh>
            <mesh>
              <boxGeometry args={[0.042, h + 0.004, d + 0.008]} />
              <meshStandardMaterial
                color={cfg.ribbonColor}
                metalness={0.42}
                roughness={0.28}
              />
            </mesh>

            {/* Animated Lid & Ribbon Bow */}
            <group
              ref={(el) => (giftLidRefs.current[idx] = el)}
              position={[0, h * 0.5 + 0.015, 0]}
            >
              <mesh castShadow>
                <boxGeometry args={[w + 0.02, 0.036, d + 0.02]} />
                <meshStandardMaterial
                  color={cfg.boxColor}
                  map={cfg.map}
                  roughness={0.42}
                />
              </mesh>
              <mesh position={[0, 0.004, 0]}>
                <boxGeometry args={[w + 0.026, 0.037, 0.044]} />
                <meshStandardMaterial
                  color={cfg.ribbonColor}
                  metalness={0.45}
                  roughness={0.25}
                />
              </mesh>
              <mesh position={[0, 0.004, 0]}>
                <boxGeometry args={[0.044, 0.037, d + 0.026]} />
                <meshStandardMaterial
                  color={cfg.ribbonColor}
                  metalness={0.45}
                  roughness={0.25}
                />
              </mesh>
              <mesh position={[-0.028, 0.036, 0]} rotation={[0, 0, 0.4]}>
                <torusGeometry args={[0.028, 0.01, 8, 16]} />
                <meshStandardMaterial
                  color={cfg.ribbonColor}
                  metalness={0.45}
                  roughness={0.25}
                />
              </mesh>
              <mesh position={[0.028, 0.036, 0]} rotation={[0, 0, -0.4]}>
                <torusGeometry args={[0.028, 0.01, 8, 16]} />
                <meshStandardMaterial
                  color={cfg.ribbonColor}
                  metalness={0.45}
                  roughness={0.25}
                />
              </mesh>
            </group>

            {/* Surprise Glowing Keepsake */}
            <group
              ref={(el) => (giftSurpriseRefs.current[idx] = el)}
              position={[0, 0, 0]}
              scale={[0.01, 0.01, 0.01]}
            >
              <mesh>
                <octahedronGeometry args={[0.068, 1]} />
                <meshStandardMaterial
                  color="#FFE494"
                  emissive="#FFB732"
                  emissiveIntensity={1.8}
                  metalness={0.82}
                  roughness={0.14}
                />
              </mesh>
            </group>
          </group>
        );
      })}
      </group>
    </group>
  );
}
