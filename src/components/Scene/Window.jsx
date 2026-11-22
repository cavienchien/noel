import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { soundEngine } from '../../assets/sounds/soundEngine';

export default function Window({
  hoveredObject,
  windowEveningMode,
  mode,
  onInteract,
  isMobileDevice = false,
}) {
  const snowInstancedRef = useRef();
  const leftCurtainRef = useRef();
  const rightCurtainRef = useRef();
  const [curtainsClosed, setCurtainsClosed] = useState(false);

  const isHovered = hoveredObject?.id === 'window';
  const isHoveredCurtains = hoveredObject?.id === 'curtains';

  // Continuous chill 3D snowflakes outside the window
  const snowFlakes = useMemo(() => {
    const count = isMobileDevice ? 110 : 220;
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({
        x: (Math.random() - 0.5) * 3.2,
        y: Math.random() * 2.5 - 1.0,
        z: -0.05 - Math.random() * 1.65,
        speedY: 0.18 + Math.random() * 0.22,
        swayAmp: 0.08 + Math.random() * 0.14,
        swayFreq: 0.7 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        size: 0.011 + Math.random() * 0.015,
      });
    }
    return list;
  }, [isMobileDevice]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // Update continuous chill snowfall
    if (snowInstancedRef.current) {
      for (let i = 0; i < snowFlakes.length; i++) {
        const f = snowFlakes[i];
        f.y -= f.speedY * dt;
        if (f.y < -1.05) {
          f.y = 1.45;
          f.x = (Math.random() - 0.5) * 3.2;
        }
        const curX = f.x + Math.sin(t * f.swayFreq + f.phase) * f.swayAmp;
        dummy.position.set(curX, f.y, f.z);
        dummy.scale.setScalar(f.size);
        dummy.updateMatrix();
        snowInstancedRef.current.setMatrixAt(i, dummy.matrix);
      }
      snowInstancedRef.current.instanceMatrix.needsUpdate = true;
    }

    // Smoothly animate left & right curtains opening / closing
    const targetScaleX = curtainsClosed ? 1.0 : 0.2;
    if (leftCurtainRef.current) {
      leftCurtainRef.current.scale.x = THREE.MathUtils.lerp(
        leftCurtainRef.current.scale.x,
        targetScaleX,
        Math.min(1, dt * 5.5)
      );
    }
    if (rightCurtainRef.current) {
      rightCurtainRef.current.scale.x = THREE.MathUtils.lerp(
        rightCurtainRef.current.scale.x,
        targetScaleX,
        Math.min(1, dt * 5.5)
      );
    }
  });

  const interactData = {
    interactable: true,
    id: 'window',
    name: 'Cửa Sổ Mùa Đông',
    actionLabel: 'Quan Sát Bên Ngoài',
    area: 'Khu vực Bàn ăn',
    position: [2.45, 2.05, -3.32],
  };

  const curtainInteractData = {
    interactable: true,
    id: 'curtains',
    name: 'Rèm Cửa Sổ',
    actionLabel: curtainsClosed ? 'Mở Rèm Cửa' : 'Đóng Rèm Cửa',
    area: 'Khu vực Bàn ăn',
    position: [2.45, 2.05, -3.2],
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (mode === 'FREE_EXPLORE') {
      onInteract('window');
    }
  };

  const handleCurtainClick = (e) => {
    e.stopPropagation();
    soundEngine.init();
    soundEngine.playInteractSound();
    setCurtainsClosed((prev) => !prev);
  };

  const curtainColor = isHoveredCurtains ? '#EAE0D0' : '#DFD2C0';
  const pleatSteps = [0.07, 0.2, 0.34, 0.48, 0.62, 0.76, 0.9, 1.04, 1.18, 1.32];

  return (
    <group position={[2.45, 2.05, -3.35]}>
      {/* ================= SOFT FLOOR-TO-CEILING PLEATED LINEN CURTAINS (noel.jpe + christmas.jpe) ================= */}
      {/* Brushed Brass Curtain Rod */}
      <mesh position={[0, 0.96, 0.14]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, 2.92, 16]} />
        <meshStandardMaterial color="#C8A25A" metalness={0.82} roughness={0.22} />
      </mesh>
      {[-1.46, 1.46].map((rx, idx) => (
        <mesh key={idx} position={[rx, 0.96, 0.14]}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshStandardMaterial color="#D4AF6A" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}

      {/* Left & Right Interactive Pleated Warm Beige Linen Drapes (Touch/Click to Open & Close) */}
      <group
        ref={leftCurtainRef}
        position={[-1.38, -0.52, 0.16]}
        scale={[0.2, 1, 1]}
        userData={curtainInteractData}
        onClick={handleCurtainClick}
      >
        <mesh
          position={[0.69, 0, -0.008]}
          castShadow
          receiveShadow
          userData={curtainInteractData}
          onClick={handleCurtainClick}
        >
          <boxGeometry args={[1.36, 2.94, 0.018]} />
          <meshStandardMaterial
            color={curtainColor}
            roughness={0.9}
            metalness={0.02}
          />
        </mesh>
        {pleatSteps.map((px, pIdx) => (
          <mesh
            key={pIdx}
            position={[px, 0, (pIdx % 2) * 0.018]}
            castShadow
            receiveShadow
            userData={curtainInteractData}
            onClick={handleCurtainClick}
          >
            <cylinderGeometry args={[0.036, 0.045, 2.95, 12]} />
            <meshStandardMaterial
              color={curtainColor}
              roughness={0.88}
              metalness={0.02}
            />
          </mesh>
        ))}
      </group>

      <group
        ref={rightCurtainRef}
        position={[1.38, -0.52, 0.16]}
        scale={[0.2, 1, 1]}
        userData={curtainInteractData}
        onClick={handleCurtainClick}
      >
        <mesh
          position={[-0.69, 0, -0.008]}
          castShadow
          receiveShadow
          userData={curtainInteractData}
          onClick={handleCurtainClick}
        >
          <boxGeometry args={[1.36, 2.94, 0.018]} />
          <meshStandardMaterial
            color={curtainColor}
            roughness={0.9}
            metalness={0.02}
          />
        </mesh>
        {pleatSteps.map((px, pIdx) => (
          <mesh
            key={pIdx}
            position={[-px, 0, (pIdx % 2) * 0.018]}
            castShadow
            receiveShadow
            userData={curtainInteractData}
            onClick={handleCurtainClick}
          >
            <cylinderGeometry args={[0.036, 0.045, 2.95, 12]} />
            <meshStandardMaterial
              color={curtainColor}
              roughness={0.88}
              metalness={0.02}
            />
          </mesh>
        ))}
      </group>

      {/* ================= OUTER MOULDED WHITE WINDOW FRAME & SILL ================= */}
      <mesh
        position={[0, 0.74, 0.04]}
        castShadow
        receiveShadow
        userData={interactData}
        onClick={handleClick}
      >
        <boxGeometry args={[2.38, 0.09, 0.14]} />
        <meshStandardMaterial
          color={isHovered ? '#FFFDF8' : '#F9F6F0'}
          roughness={0.35}
          emissive={isHovered ? '#E9C879' : '#000000'}
          emissiveIntensity={isHovered ? 0.15 : 0}
        />
      </mesh>
      <mesh
        position={[0, -0.74, 0.07]}
        castShadow
        receiveShadow
        userData={interactData}
        onClick={handleClick}
      >
        <boxGeometry args={[2.52, 0.075, 0.22]} />
        <meshStandardMaterial color="#F9F6F0" roughness={0.32} />
      </mesh>
      <mesh position={[0, -0.79, 0.05]} receiveShadow>
        <boxGeometry args={[2.44, 0.045, 0.16]} />
        <meshStandardMaterial color="#EFE8DC" roughness={0.42} />
      </mesh>

      <mesh
        position={[-1.15, 0, 0.04]}
        castShadow
        userData={interactData}
        onClick={handleClick}
      >
        <boxGeometry args={[0.09, 1.46, 0.14]} />
        <meshStandardMaterial color="#F9F6F0" roughness={0.35} />
      </mesh>
      <mesh
        position={[1.15, 0, 0.04]}
        castShadow
        userData={interactData}
        onClick={handleClick}
      >
        <boxGeometry args={[0.09, 1.46, 0.14]} />
        <meshStandardMaterial color="#F9F6F0" roughness={0.35} />
      </mesh>

      {/* Inner Sliding Sash Frames */}
      {[-0.55, 0.55].map((px, idx) => (
        <group key={idx} position={[px, 0, 0.03 + idx * 0.015]}>
          <mesh position={[0, 0.66, 0]}>
            <boxGeometry args={[1.12, 0.06, 0.045]} />
            <meshStandardMaterial color="#F6F3EC" roughness={0.38} />
          </mesh>
          <mesh position={[0, -0.66, 0]}>
            <boxGeometry args={[1.12, 0.06, 0.045]} />
            <meshStandardMaterial color="#F6F3EC" roughness={0.38} />
          </mesh>
          <mesh position={[-0.53, 0, 0]}>
            <boxGeometry args={[0.06, 1.36, 0.045]} />
            <meshStandardMaterial color="#F6F3EC" roughness={0.38} />
          </mesh>
          <mesh position={[0.53, 0, 0]}>
            <boxGeometry args={[0.06, 1.36, 0.045]} />
            <meshStandardMaterial color="#F6F3EC" roughness={0.38} />
          </mesh>

          {/* Soft Blue-Tinted Window Glass Pane (depthWrite=false so continuous falling snow behind glass is always visible) */}
          <mesh userData={interactData} onClick={handleClick}>
            <planeGeometry args={[1.02, 1.28]} />
            <meshStandardMaterial
              color={windowEveningMode ? '#8CAEC4' : '#D5E8F2'}
              transparent
              opacity={0.14}
              depthWrite={false}
              roughness={0.08}
              metalness={0.12}
            />
          </mesh>
        </group>
      ))}

      {/* ================= EXTERIOR WINTER FOREST DIORAMA OUTSIDE WINDOW ================= */}
      <group position={[0, -0.2, -0.8]}>
        <mesh position={[0, 0.4, -2.1]}>
          <planeGeometry args={[6.4, 4.4]} />
          <meshBasicMaterial
            color={windowEveningMode ? '#1C2B42' : '#CEDCE2'}
          />
        </mesh>

        <mesh position={[-0.8, -0.95, -1.6]} rotation={[0, 0, -0.05]}>
          <boxGeometry args={[5.5, 0.85, 0.6]} />
          <meshStandardMaterial
            color={windowEveningMode ? '#6C7D8C' : '#EBF0F2'}
            roughness={0.9}
          />
        </mesh>

        {[
          [-1.35, -0.75, -0.65, 1.18],
          [-0.55, -0.68, -0.95, 1.38],
          [0.15, -0.82, -0.75, 1.08],
          [0.85, -0.7, -1.05, 1.32],
          [1.5, -0.75, -0.7, 1.12],
        ].map(([tx, ty, tz, s], idx) => (
          <group key={idx} position={[tx, ty, tz]} scale={[s, s, s]}>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.06, 0.08, 0.45, 8]} />
              <meshStandardMaterial color="#4D3B2C" roughness={0.9} />
            </mesh>
            {[0, 0.34, 0.66, 0.94].map((ly, li) => (
              <group key={li} position={[0, 0.42 + ly, 0]}>
                <mesh>
                  <coneGeometry args={[0.48 - li * 0.08, 0.52, 12]} />
                  <meshStandardMaterial
                    color={windowEveningMode ? '#283F31' : '#4C644A'}
                    roughness={0.85}
                  />
                </mesh>
                <mesh position={[0, 0.04, 0]}>
                  <coneGeometry args={[0.44 - li * 0.08, 0.44, 12]} />
                  <meshStandardMaterial
                    color={windowEveningMode ? '#A4B8C9' : '#E6ECEB'}
                    roughness={0.88}
                  />
                </mesh>
              </group>
            ))}
          </group>
        ))}

        {/* Continuous Chill 3D Falling Snowflakes Outside Window */}
        <instancedMesh
          ref={snowInstancedRef}
          args={[null, null, snowFlakes.length]}
          frustumCulled={false}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={0.92}
            depthWrite={false}
          />
        </instancedMesh>
      </group>

      {/* Soft Window Moonlight / Daylight Streaming into Room */}
      <directionalLight
        position={[1.8, 1.6, -2.5]}
        intensity={windowEveningMode ? 0.16 : 0.52}
        color={windowEveningMode ? '#8AA8C7' : '#FFE8C8'}
        castShadow
        shadow-mapSize={isMobileDevice ? [512, 512] : [1024, 1024]}
        shadow-bias={-0.0005}
      />
    </group>
  );
}
