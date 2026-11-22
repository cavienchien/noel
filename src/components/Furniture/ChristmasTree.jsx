import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { getGiftWrapTexture } from '../../assets/textures/proceduralTextures';
import { MEMORY_PHOTOS } from '../../data/memoriesData';

const dummy = new THREE.Object3D();

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
  const lightsMeshRef = useRef();
  const ornamentsMeshRef = useRef();
  const beadsMeshRef = useRef();
  const giftCarouselRef = useRef();
  const giftSpinSpeedRef = useRef(0);
  const giftLidRefs = useRef([]);
  const giftSurpriseRefs = useRef([]);

  const stripeTex = useMemo(() => getGiftWrapTexture('stripes'), []);
  const dotsTex = useMemo(() => getGiftWrapTexture('dots'), []);
  const kraftTex = useMemo(() => getGiftWrapTexture('kraft'), []);
  const memoryTextures = useTexture([
    './memories/chibi-1.jpg',
    './memories/chibi-2.jpg',
    './memories/chibi-3.jpg',
    './memories/chibi-4.jpg',
  ]);

  const isHoveredTree = hoveredObject?.id === 'christmas-tree';
  const isHoveredGifts = hoveredObject?.id === 'gift-boxes';

  // Generate positions for InstancedMeshes (3 draw calls total instead of ~300!)
  const { fairyLights, ornaments, starOrnaments, beadGarlands } = useMemo(() => {
    const lights = [];
    const baubles = [];
    const stars = [];
    const beads = [];

    const lightCount = isMobileDevice ? 64 : 100;
    for (let i = 0; i < lightCount; i++) {
      const t = i / (lightCount - 1);
      const y = 0.42 + t * 2.18;
      const maxR = (1 - t * 0.84) * 0.82;
      const angle = t * Math.PI * 18;
      lights.push({
        x: Math.cos(angle) * maxR,
        y,
        z: Math.sin(angle) * maxR,
      });
    }

    const palette = ['#B22222', '#E9C879', '#F9F6F0', '#D4A857', '#9E2222', '#EFE6D5'];
    const baubleCount = isMobileDevice ? 36 : 50;
    for (let i = 0; i < baubleCount; i++) {
      const t = (i + 0.4) / baubleCount;
      const y = 0.48 + t * 1.98;
      const r = (1 - t * 0.82) * 0.77;
      const angle = i * 2.39996;
      baubles.push({
        x: Math.cos(angle) * r,
        y,
        z: Math.sin(angle) * r,
        color: palette[i % palette.length],
        size: 0.044 + (i % 3) * 0.011,
      });
    }

    const starCount = isMobileDevice ? 6 : 8;
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

    [0.72, 1.16, 1.6, 2.0].forEach((ringY, rIdx) => {
      const baseR = 0.74 - rIdx * 0.145;
      const beadCount = isMobileDevice ? 22 - rIdx * 3 : 36 - rIdx * 5;
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

  // Populate static InstancedMesh matrices once
  useEffect(() => {
    if (lightsMeshRef.current) {
      fairyLights.forEach((l, i) => {
        dummy.position.set(l.x, l.y, l.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        lightsMeshRef.current.setMatrixAt(i, dummy.matrix);
      });
      lightsMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (ornamentsMeshRef.current) {
      const col = new THREE.Color();
      ornaments.forEach((b, i) => {
        dummy.position.set(b.x, b.y, b.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(b.size);
        dummy.updateMatrix();
        ornamentsMeshRef.current.setMatrixAt(i, dummy.matrix);
        col.set(b.color);
        ornamentsMeshRef.current.setColorAt(i, col);
      });
      ornamentsMeshRef.current.instanceMatrix.needsUpdate = true;
      if (ornamentsMeshRef.current.instanceColor) {
        ornamentsMeshRef.current.instanceColor.needsUpdate = true;
      }
    }

    if (beadsMeshRef.current) {
      beadGarlands.forEach(([x, y, z], i) => {
        dummy.position.set(x, y, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        beadsMeshRef.current.setMatrixAt(i, dummy.matrix);
      });
      beadsMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [fairyLights, ornaments, beadGarlands]);

  // 6 Gift boxes arranged cleanly in a visible outer circle around the tree (outside the lower pine canopy)
  const giftConfigs = useMemo(() => {
    const specs = [
      { size: [0.32, 0.28, 0.3], boxColor: '#FFFFFF', map: stripeTex, ribbonColor: '#B22222' },
      { size: [0.27, 0.23, 0.27], boxColor: '#FFFFFF', map: dotsTex, ribbonColor: '#B22222' },
      { size: [0.29, 0.25, 0.27], boxColor: '#A62424', map: null, ribbonColor: '#E9C879' },
      { size: [0.3, 0.26, 0.28], boxColor: '#FFFFFF', map: kraftTex, ribbonColor: '#F5EFE6' },
      { size: [0.26, 0.22, 0.25], boxColor: '#FFFFFF', map: kraftTex, ribbonColor: '#A62424' },
      { size: [0.28, 0.24, 0.26], boxColor: '#FFFFFF', map: stripeTex, ribbonColor: '#E9C879' },
    ];
    const radius = 0.94;
    return specs.map((s, idx) => {
      const ang = (idx / specs.length) * Math.PI * 2 + 0.52;
      return {
        ...s,
        pos: [Math.cos(ang) * radius, s.size[1] * 0.5 + 0.03, Math.sin(ang) * radius],
        rotY: -ang + Math.PI / 2,
      };
    });
  }, [stripeTex, dotsTex, kraftTex]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (starRef.current) {
      starRef.current.rotation.y = Math.sin(t * 0.8) * 0.22;
    }

    // Subtle global shimmer on fairy lights (zero per-instance CPU loop!)
    if (lightsMeshRef.current && treeLightsOn) {
      const mat = lightsMeshRef.current.material;
      if (mat) {
        const pulse = 0.85 + Math.sin(t * 3.2) * 0.15;
        mat.color.setRGB(1.0 * pulse, 0.9 * pulse, 0.58 * pulse);
      }
    }

    // Smooth carousel orbit around the Christmas tree trunk when gifts are opened
    const targetSpin = giftsOpened ? 0.85 : 0;
    giftSpinSpeedRef.current = THREE.MathUtils.lerp(
      giftSpinSpeedRef.current,
      targetSpin,
      Math.min(1, delta * 3.2)
    );
    if (giftCarouselRef.current && giftSpinSpeedRef.current > 0.001) {
      giftCarouselRef.current.rotation.y += delta * giftSpinSpeedRef.current;
    }

    // Smooth Gift Box Unwrapping Animation
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
        if (giftsOpened) surprise.rotation.y += delta * 1.5;
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

  const handleGiftClick = (e) => {
    e.stopPropagation();
    if (mode === 'FREE_EXPLORE') onInteract('gift-boxes');
  };

  const pineColor =
    isHoveredTree || isGuidedHighlighted ? '#2C5C40' : '#20452F';

  return (
    <group position={[0.55, 0, -2.35]}>
      {/* Plush Round Faux-Fur White Tree Skirt (widened so outer gift ring sits cleanly on it) */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[1.16, 1.2, 0.04, 28]} />
        <meshStandardMaterial color="#F6F1E9" roughness={0.92} />
      </mesh>

      {/* Pine Tree Trunk */}
      <mesh
        position={[0, 0.25, 0]}
        userData={treeInteractData}
        onClick={handleTreeClick}
      >
        <cylinderGeometry args={[0.09, 0.13, 0.5, 10]} />
        <meshStandardMaterial color="#4D3624" roughness={0.9} />
      </mesh>

      {/* 8 Layered Evergreen Pine Foliage Tiers */}
      {[
        { y: 0.56, r: 0.86, h: 0.6 },
        { y: 0.86, r: 0.77, h: 0.55 },
        { y: 1.15, r: 0.68, h: 0.52 },
        { y: 1.42, r: 0.59, h: 0.48 },
        { y: 1.68, r: 0.49, h: 0.45 },
        { y: 1.93, r: 0.39, h: 0.42 },
        { y: 2.16, r: 0.29, h: 0.38 },
        { y: 2.38, r: 0.19, h: 0.35 },
      ].map((tier, idx) => (
        <mesh
          key={idx}
          position={[0, tier.y, 0]}
          rotation={[0, idx * 0.38, 0]}
          castShadow={idx % 2 === 0}
          receiveShadow
          userData={treeInteractData}
          onClick={handleTreeClick}
        >
          <coneGeometry args={[tier.r, tier.h, 12]} />
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
        <mesh>
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
      </group>

      {/* Single Warm Tree Glow PointLight (consolidated for mobile FPS) */}
      {treeLightsOn && (
        <pointLight
          position={[0, 1.55, 0.42]}
          color="#FFC966"
          intensity={1.65}
          distance={5.2}
          decay={2}
        />
      )}

      {/* InstancedMesh: Golden Beaded Garlands (1 draw call!) */}
      <instancedMesh
        ref={beadsMeshRef}
        args={[null, null, beadGarlands.length]}
      >
        <sphereGeometry args={[0.014, 6, 6]} />
        <meshStandardMaterial
          color="#E9C879"
          metalness={0.85}
          roughness={0.2}
        />
      </instancedMesh>

      {/* InstancedMesh: Twinkling LED Fairy Lights (1 draw call!) */}
      <instancedMesh
        ref={lightsMeshRef}
        args={[null, null, fairyLights.length]}
        userData={treeInteractData}
        onClick={handleTreeClick}
      >
        <sphereGeometry args={[0.018, 6, 6]} />
        {treeLightsOn ? (
          <meshBasicMaterial color="#FFE694" />
        ) : (
          <meshStandardMaterial color="#8A7E6A" roughness={0.5} />
        )}
      </instancedMesh>

      {/* InstancedMesh: Ornaments / Baubles (1 draw call!) */}
      <instancedMesh
        ref={ornamentsMeshRef}
        args={[null, null, ornaments.length]}
        userData={treeInteractData}
        onClick={handleTreeClick}
      >
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial metalness={0.55} roughness={0.26} />
      </instancedMesh>

      {/* 3D Golden Star Ornaments */}
      {starOrnaments.map((st, idx) => (
        <mesh
          key={idx}
          position={st.pos}
          rotation={[0, st.rotY, Math.PI / 4]}
        >
          <octahedronGeometry args={[0.055, 0]} />
          <meshStandardMaterial
            color="#F2D27C"
            metalness={0.86}
            roughness={0.16}
          />
        </mesh>
      ))}

      {/* ================= INTERACTIVE ORBITING GIFT BOXES WITH FLOATING CHIBI POLAROIDS ================= */}
      <group ref={giftCarouselRef}>
        {giftConfigs.map((cfg, idx) => {
          const [w, h, d] = cfg.size;
          const photoTex = memoryTextures[idx % memoryTextures.length];
          const mem = MEMORY_PHOTOS[idx % MEMORY_PHOTOS.length];
          const boxInteract = {
            interactable: true,
            id: `gift-box:${idx}`,
            name: `Hộp Quà · ${mem.title}`,
            actionLabel: 'Mở Ảnh Người Thương',
            area: 'Cây thông Noel',
          };
          const handleThisGiftClick = (e) => {
            e.stopPropagation();
            if (mode === 'FREE_EXPLORE') onInteract(`gift-box:${idx}`);
          };
          return (
            <group
              key={idx}
              position={cfg.pos}
              rotation={[0, cfg.rotY, 0]}
              userData={boxInteract}
              onClick={handleThisGiftClick}
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
              <mesh>
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
                <torusGeometry args={[0.028, 0.01, 6, 12]} />
                <meshStandardMaterial
                  color={cfg.ribbonColor}
                  metalness={0.45}
                  roughness={0.25}
                />
              </mesh>
              <mesh position={[0.028, 0.036, 0]} rotation={[0, 0, -0.4]}>
                <torusGeometry args={[0.028, 0.01, 6, 12]} />
                <meshStandardMaterial
                  color={cfg.ribbonColor}
                  metalness={0.45}
                  roughness={0.25}
                />
              </mesh>
            </group>

            {/* Floating Polaroid Photo Card of Loved One Rising Out When Unwrapped */}
            <group
              ref={(el) => (giftSurpriseRefs.current[idx] = el)}
              position={[0, 0, 0]}
              scale={[0.01, 0.01, 0.01]}
            >
              {/* White Polaroid Paper Frame */}
              <mesh>
                <boxGeometry args={[0.24, 0.28, 0.012]} />
                <meshStandardMaterial color="#FAF6EE" roughness={0.45} />
              </mesh>
              {/* Front & Back Chibi Memory Photo */}
              <mesh position={[0, 0.018, 0.007]}>
                <planeGeometry args={[0.205, 0.205]} />
                <meshBasicMaterial map={photoTex} />
              </mesh>
              <mesh position={[0, 0.018, -0.007]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[0.205, 0.205]} />
                <meshBasicMaterial map={photoTex} />
              </mesh>
            </group>
          </group>
        );
      })}
      </group>
    </group>
  );
}
