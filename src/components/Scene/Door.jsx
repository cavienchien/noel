import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { soundEngine } from '../../assets/sounds/soundEngine';

export default function Door({
  doorOpen,
  mode,
  hoveredObject,
  onTriggerInitialDoor,
  onInteract,
}) {
  const mainDoorPivotRef = useRef();
  const handleGlowRef = useRef();
  const enteredInGuidedRef = useRef(false);

  const isHoveredMain = hoveredObject?.id === 'door';

  useFrame((state, delta) => {
    if (mode === 'START' || mode === 'OUTSIDE_DOOR' || mode === 'OPENING_DOOR') {
      enteredInGuidedRef.current = false;
    } else if (
      mode === 'ENTERING_ROOM' &&
      !enteredInGuidedRef.current &&
      state.camera.position.z <= 3.05
    ) {
      enteredInGuidedRef.current = true;
      soundEngine.playDoorSound(false);
    }

    const isMainDoorOpen =
      doorOpen ||
      mode === 'OPENING_DOOR' ||
      (mode === 'ENTERING_ROOM' && !enteredInGuidedRef.current);

    // Smooth Main Entrance Door rotation around left hinge
    if (mainDoorPivotRef.current) {
      const targetAngle = isMainDoorOpen ? -Math.PI * 0.58 : 0;
      mainDoorPivotRef.current.rotation.y = THREE.MathUtils.lerp(
        mainDoorPivotRef.current.rotation.y,
        targetAngle,
        Math.min(1, delta * 3.8)
      );
    }

    // Gentle pulse on door handle when outside waiting for click
    if (handleGlowRef.current && mode === 'OUTSIDE_DOOR') {
      const pulse = 0.4 + Math.sin(state.clock.elapsedTime * 4) * 0.25;
      handleGlowRef.current.emissiveIntensity = pulse;
    }
  });

  const handleMainDoorClick = (e) => {
    e.stopPropagation();
    if (mode === 'OUTSIDE_DOOR') {
      onTriggerInitialDoor();
    } else if (mode === 'FREE_EXPLORE') {
      onInteract('door');
    }
  };

  const mainDoorInteractData = {
    interactable: true,
    id: 'door',
    name: 'Cửa Ra Vào Chính',
    actionLabel: doorOpen ? 'Đóng Cửa' : 'Mở Cửa',
    position: [0.4, 1.2, 3.55],
  };

  return (
    <group>
      {/* ================= 1. MAIN ENTRANCE DOOR (South Wall: X = 0.4, Z = 3.6) ================= */}
      <group position={[0.4, 0, 3.6]}>
        {/* Door Frame / Casing */}
        <mesh position={[-0.6, 1.17, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 2.36, 0.26]} />
          <meshStandardMaterial color="#F9F6F0" roughness={0.45} />
        </mesh>
        <mesh position={[0.6, 1.17, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 2.36, 0.26]} />
          <meshStandardMaterial color="#F9F6F0" roughness={0.45} />
        </mesh>
        <mesh position={[0, 2.34, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.28, 0.08, 0.26]} />
          <meshStandardMaterial color="#F9F6F0" roughness={0.45} />
        </mesh>

        {/* Hinge Pivot at left jamb (X = -0.56) */}
        <group ref={mainDoorPivotRef} position={[-0.56, 0, 0]}>
          {/* Main Light-Beige Door Leaf (#E8DDCD) */}
          <mesh
            position={[0.56, 1.15, 0]}
            castShadow
            receiveShadow
            userData={mainDoorInteractData}
            onClick={handleMainDoorClick}
          >
            <boxGeometry args={[1.12, 2.28, 0.055]} />
            <meshStandardMaterial
              color={isHoveredMain ? '#F3E9D8' : '#E8DDCD'}
              roughness={0.48}
              emissive={isHoveredMain ? '#E9C879' : '#000000'}
              emissiveIntensity={isHoveredMain ? 0.12 : 0}
            />
          </mesh>

          {/* Modern Scandinavian Recessed Groove Panels (Front & Back) */}
          {[0.58, 1.65].map((py, idx) => (
            <mesh
              key={idx}
              position={[0.56, py, 0]}
              userData={mainDoorInteractData}
              onClick={handleMainDoorClick}
            >
              <boxGeometry args={[0.82, 0.78, 0.064]} />
              <meshStandardMaterial color="#EFE6D8" roughness={0.5} />
            </mesh>
          ))}

          {/* Holiday Pine Wreath on Exterior Side of Entrance Door */}
          <group position={[0.56, 1.58, 0.045]}>
            <mesh castShadow>
              <torusGeometry args={[0.18, 0.045, 12, 28]} />
              <meshStandardMaterial color="#244B35" roughness={0.85} />
            </mesh>
            {/* Red Velvet Bow on Wreath */}
            <mesh position={[0, -0.17, 0.03]}>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshStandardMaterial color="#A42828" roughness={0.5} />
            </mesh>
            {/* Warm Gold Ornaments on Wreath */}
            {[0, 1.57, 3.14, 4.71].map((ang, i) => (
              <mesh
                key={i}
                position={[Math.cos(ang) * 0.18, Math.sin(ang) * 0.18, 0.035]}
              >
                <sphereGeometry args={[0.022, 10, 10]} />
                <meshStandardMaterial
                  color="#E9C879"
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
            ))}
          </group>

          {/* Door Handle Assembly (Both Exterior +Z and Interior -Z) */}
          <group
            position={[0.98, 1.05, 0]}
            userData={mainDoorInteractData}
            onClick={handleMainDoorClick}
          >
            {/* Escutcheon Plates */}
            <mesh position={[0, 0, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.032, 0.032, 0.012, 20]} />
              <meshStandardMaterial
                color="#D8DADF"
                metalness={0.88}
                roughness={0.18}
              />
            </mesh>
            <mesh position={[0, 0, -0.032]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.032, 0.032, 0.012, 20]} />
              <meshStandardMaterial
                color="#D8DADF"
                metalness={0.88}
                roughness={0.18}
              />
            </mesh>
            {/* Spindle */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.14, 14]} />
              <meshStandardMaterial
                color="#D8DADF"
                metalness={0.9}
                roughness={0.18}
              />
            </mesh>
            {/* Exterior Lever Handle */}
            <mesh position={[-0.055, 0, 0.068]} castShadow>
              <boxGeometry args={[0.13, 0.022, 0.022]} />
              <meshStandardMaterial
                ref={handleGlowRef}
                color="#E5E7EB"
                metalness={0.9}
                roughness={0.15}
                emissive="#E9C879"
                emissiveIntensity={mode === 'OUTSIDE_DOOR' ? 0.45 : 0}
              />
            </mesh>
            {/* Interior Lever Handle */}
            <mesh position={[-0.055, 0, -0.068]} castShadow>
              <boxGeometry args={[0.13, 0.022, 0.022]} />
              <meshStandardMaterial
                color="#E5E7EB"
                metalness={0.9}
                roughness={0.15}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
