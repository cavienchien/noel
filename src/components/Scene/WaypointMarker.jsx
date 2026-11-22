import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// Hiệu ứng vòng tròn ánh sáng neon vàng hiện đại tại điểm chạm di chuyển (Click chuột phải / Chạm sàn)
export default function WaypointMarker({ waypointRef }) {
  const groupRef = useRef();
  const outerRingRef = useRef();
  const innerRingRef = useRef();
  const beamRef = useRef();

  useFrame((state) => {
    const wp = waypointRef?.current;
    const grp = groupRef.current;
    if (!grp) return;

    if (!wp || !wp.active) {
      grp.visible = false;
      return;
    }

    grp.visible = true;
    grp.position.set(wp.x, 0.02, wp.z);

    const t = state.clock.elapsedTime;
    const pulse = (t * 1.8) % 1;

    if (outerRingRef.current) {
      const s = 0.65 + pulse * 0.95;
      outerRingRef.current.scale.set(s, s, 1);
      outerRingRef.current.material.opacity = (1 - pulse) * 0.85;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = t * 1.4;
    }
    if (beamRef.current) {
      beamRef.current.position.y = 0.16 + Math.sin(t * 5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* Vòng sóng lan tỏa neon vàng ấm */}
      <mesh ref={outerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.24, 28]} />
        <meshBasicMaterial
          color="#FFE394"
          transparent
          opacity={0.75}
          depthWrite={false}
        />
      </mesh>

      {/* Vòng lõi xoay nhẹ */}
      <mesh ref={innerRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[0.08, 0.125, 24]} />
        <meshBasicMaterial
          color="#FFD166"
          transparent
          opacity={0.92}
          depthWrite={false}
        />
      </mesh>

      {/* Chấm sáng nổi nhẹ dẫn đường */}
      <mesh ref={beamRef} position={[0, 0.16, 0]}>
        <octahedronGeometry args={[0.045, 0]} />
        <meshBasicMaterial color="#FFF1BF" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}
