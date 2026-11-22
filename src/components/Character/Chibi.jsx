import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Nhân vật Chibi dễ thương, trung tính giới tính: mũ len Giáng Sinh, khăn quàng, áo hoodie ấm áp
const SKIN = '#F7D9C0';
const HAIR = '#6B4430';
const HOODIE = '#3C7A57';
const HOODIE_TRIM = '#F4EBDD';
const PANTS = '#D8C6AC';
const BOOTS = '#6E4B34';
const HAT = '#B93434';
const SCARF = '#C9A24E';
const MITTEN = '#B93434';

export default function Chibi({ mode, viewMode, playerRef }) {
  const rootRef = useRef();
  const bodyRef = useRef();
  const headRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const eyesRef = useRef();
  const pomRef = useRef();
  const walkTime = useRef(0);
  const blinkTimer = useRef(2.5);

  // Nhân vật không chặn tia Raycast tương tác đồ vật
  useEffect(() => {
    if (!rootRef.current) return;
    rootRef.current.traverse((obj) => {
      obj.raycast = () => null;
    });
  }, []);

  useFrame((state, delta) => {
    const root = rootRef.current;
    const player = playerRef?.current;
    if (!root || !player) return;

    const visible =
      mode === 'FREE_EXPLORE' && viewMode === 'third' && !player.hidden;
    root.visible = visible;
    if (!visible) return;

    const t = state.clock.elapsedTime;
    const sitting = Boolean(player.sitting);
    const moving = Boolean(player.moving) && !sitting;
    const speed = player.speed || 0;

    root.position.x = player.pos.x;
    root.position.z = player.pos.z;
    root.rotation.y = player.yaw;

    // Walk cycle / idle breathing
    if (moving) {
      walkTime.current += delta * (7 + speed * 5);
    }
    const swing = moving ? Math.sin(walkTime.current) * 0.75 * Math.max(0.45, speed) : 0;
    const bounce = moving
      ? Math.abs(Math.sin(walkTime.current)) * 0.045
      : Math.sin(t * 2.2) * 0.008;

    const baseY = sitting ? 0.2 : 0;
    root.position.y = THREE.MathUtils.lerp(
      root.position.y,
      baseY + bounce,
      Math.min(1, delta * 14)
    );

    const lerpK = Math.min(1, delta * 12);
    if (leftLegRef.current && rightLegRef.current) {
      const legTargetL = sitting ? -1.45 : swing;
      const legTargetR = sitting ? -1.45 : -swing;
      leftLegRef.current.rotation.x = THREE.MathUtils.lerp(
        leftLegRef.current.rotation.x,
        legTargetL,
        lerpK
      );
      rightLegRef.current.rotation.x = THREE.MathUtils.lerp(
        rightLegRef.current.rotation.x,
        legTargetR,
        lerpK
      );
    }
    if (leftArmRef.current && rightArmRef.current) {
      const armIdle = Math.sin(t * 2.2) * 0.05;
      const armL = sitting ? -0.35 : -swing * 0.9 + armIdle;
      const armR = sitting ? -0.35 : swing * 0.9 - armIdle;
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(
        leftArmRef.current.rotation.x,
        armL,
        lerpK
      );
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
        rightArmRef.current.rotation.x,
        armR,
        lerpK
      );
      leftArmRef.current.rotation.z = 0.18;
      rightArmRef.current.rotation.z = -0.18;
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.z = moving ? Math.sin(walkTime.current) * 0.04 : 0;
    }
    if (headRef.current) {
      headRef.current.rotation.z = moving
        ? Math.sin(walkTime.current) * 0.06
        : Math.sin(t * 1.3) * 0.04;
      headRef.current.rotation.x = Math.sin(t * 1.7) * 0.025;
    }
    if (pomRef.current) {
      pomRef.current.position.x = moving ? Math.sin(walkTime.current + 0.6) * 0.025 : 0;
    }

    // Natural blinking
    blinkTimer.current -= delta;
    if (eyesRef.current) {
      let s = 1;
      if (blinkTimer.current < 0.12) s = 0.12;
      if (blinkTimer.current < 0) {
        blinkTimer.current = 2.2 + Math.random() * 2.8;
      }
      eyesRef.current.scale.y = THREE.MathUtils.lerp(
        eyesRef.current.scale.y,
        s,
        Math.min(1, delta * 30)
      );
    }
  });

  return (
    <group ref={rootRef} visible={false}>
      {/* Soft blob shadow under the chibi */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <circleGeometry args={[0.24, 24]} />
        <meshBasicMaterial color="#2A1E15" transparent opacity={0.28} depthWrite={false} />
      </mesh>

      {/* ===== Legs (pivot at hips) ===== */}
      {[
        [leftLegRef, 0.075],
        [rightLegRef, -0.075],
      ].map(([ref, x], i) => (
        <group key={i} ref={ref} position={[x, 0.27, 0]}>
          <mesh position={[0, -0.1, 0]} castShadow>
            <capsuleGeometry args={[0.058, 0.1, 6, 12]} />
            <meshStandardMaterial color={PANTS} roughness={0.8} />
          </mesh>
          {/* Cozy boots */}
          <mesh position={[0, -0.215, 0.025]} scale={[1, 0.75, 1.3]} castShadow>
            <sphereGeometry args={[0.072, 16, 12]} />
            <meshStandardMaterial color={BOOTS} roughness={0.65} />
          </mesh>
        </group>
      ))}

      {/* ===== Body: cozy hoodie ===== */}
      <group ref={bodyRef} position={[0, 0.27, 0]}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <capsuleGeometry args={[0.155, 0.13, 8, 20]} />
          <meshStandardMaterial color={HOODIE} roughness={0.78} />
        </mesh>
        {/* Hoodie hem trim */}
        <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.022, 10, 26]} />
          <meshStandardMaterial color={HOODIE_TRIM} roughness={0.85} />
        </mesh>
        {/* Front pocket */}
        <mesh position={[0, 0.1, 0.148]} rotation={[-0.12, 0, 0]}>
          <boxGeometry args={[0.15, 0.065, 0.012]} />
          <meshStandardMaterial color="#336B4B" roughness={0.8} />
        </mesh>
        {/* Little golden star badge */}
        <mesh position={[0.07, 0.2, 0.15]} rotation={[0, 0, Math.PI / 4]}>
          <octahedronGeometry args={[0.022, 0]} />
          <meshStandardMaterial color="#E9C879" metalness={0.7} roughness={0.25} emissive="#E9C879" emissiveIntensity={0.25} />
        </mesh>

        {/* Knitted scarf */}
        <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.105, 0.042, 12, 24]} />
          <meshStandardMaterial color={SCARF} roughness={0.9} />
        </mesh>
        <mesh position={[0.065, 0.2, 0.125]} rotation={[0.15, 0, -0.12]} castShadow>
          <boxGeometry args={[0.06, 0.14, 0.03]} />
          <meshStandardMaterial color={SCARF} roughness={0.9} />
        </mesh>
        {[0.16, 0.22].map((y, i) => (
          <mesh key={i} position={[0.067, y, 0.142]} rotation={[0.15, 0, -0.12]}>
            <boxGeometry args={[0.062, 0.012, 0.005]} />
            <meshStandardMaterial color="#B93434" roughness={0.9} />
          </mesh>
        ))}

        {/* ===== Arms (pivot at shoulders) ===== */}
        {[
          [leftArmRef, 0.17],
          [rightArmRef, -0.17],
        ].map(([ref, x], i) => (
          <group key={i} ref={ref} position={[x, 0.25, 0]}>
            <mesh position={[0, -0.09, 0]} castShadow>
              <capsuleGeometry args={[0.046, 0.1, 6, 12]} />
              <meshStandardMaterial color={HOODIE} roughness={0.78} />
            </mesh>
            {/* Mittens */}
            <mesh position={[0, -0.185, 0]} castShadow>
              <sphereGeometry args={[0.052, 14, 12]} />
              <meshStandardMaterial color={MITTEN} roughness={0.85} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ===== Big cute head ===== */}
      <group ref={headRef} position={[0, 0.82, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.23, 20, 16]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
        {/* Ears */}
        {[0.225, -0.225].map((x, i) => (
          <mesh key={i} position={[x, -0.01, 0]} scale={[0.6, 1, 0.8]}>
            <sphereGeometry args={[0.045, 10, 8]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
        ))}

        {/* Soft short hair cap + fluffy bangs */}
        <mesh rotation={[-0.42, 0, 0]} position={[0, 0.012, -0.012]}>
          <sphereGeometry args={[0.243, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.56]} />
          <meshStandardMaterial color={HAIR} roughness={0.75} side={THREE.DoubleSide} />
        </mesh>
        {[
          [-0.11, 0.1, 0.19, 0.06],
          [-0.035, 0.12, 0.205, 0.062],
          [0.045, 0.12, 0.203, 0.06],
          [0.12, 0.095, 0.185, 0.055],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} scale={[1, 0.75, 0.6]}>
            <sphereGeometry args={[r, 10, 8]} />
            <meshStandardMaterial color={HAIR} roughness={0.75} />
          </mesh>
        ))}

        {/* Christmas knit beanie with pom-pom */}
        <mesh rotation={[-0.3, 0, 0]} position={[0, 0.03, -0.01]}>
          <sphereGeometry args={[0.255, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          <meshStandardMaterial color={HAT} roughness={0.88} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2 - 0.3, 0, 0]} position={[0, 0.17, 0.04]}>
          <torusGeometry args={[0.2, 0.035, 10, 20]} />
          <meshStandardMaterial color={HOODIE_TRIM} roughness={0.92} />
        </mesh>
        <mesh ref={pomRef} position={[0, 0.27, -0.06]}>
          <sphereGeometry args={[0.062, 12, 10]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
        </mesh>

        {/* Big sparkly eyes */}
        <group ref={eyesRef} position={[0, -0.025, 0]}>
          {[0.082, -0.082].map((x, i) => (
            <group key={i} position={[x, 0, 0.207]}>
              <mesh scale={[0.85, 1.2, 0.5]}>
                <sphereGeometry args={[0.04, 16, 14]} />
                <meshStandardMaterial color="#2B1D16" roughness={0.3} />
              </mesh>
              <mesh position={[0.012, 0.016, 0.018]}>
                <sphereGeometry args={[0.012, 10, 8]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
              <mesh position={[-0.01, -0.012, 0.017]}>
                <sphereGeometry args={[0.006, 8, 6]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            </group>
          ))}
        </group>

        {/* Rosy cheeks */}
        {[0.135, -0.135].map((x, i) => (
          <mesh key={i} position={[x, -0.08, 0.18]} scale={[1.2, 0.7, 0.4]}>
            <sphereGeometry args={[0.03, 12, 10]} />
            <meshBasicMaterial color="#F49C9C" transparent opacity={0.65} />
          </mesh>
        ))}

        {/* Small happy smile */}
        <mesh position={[0, -0.085, 0.222]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.022, 0.0065, 8, 16, Math.PI]} />
          <meshBasicMaterial color="#8A3B2E" />
        </mesh>
      </group>
    </group>
  );
}
