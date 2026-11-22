import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

// Hiệu ứng khoanh vùng ánh sáng thân thiện + nhãn chạm hiện đại giúp người dùng lần đầu biết ngay chỗ nào có kỷ niệm hay
export default function HotspotBeacon({
  position,
  label,
  discovered = false,
  visible = true,
  onClick,
}) {
  const ringRef = useRef();

  useFrame((state) => {
    if (!ringRef.current || !visible) return;
    const t = state.clock.elapsedTime;
    const s = 0.85 + Math.sin(t * 3.2) * 0.2;
    ringRef.current.scale.setScalar(s);
  });

  if (!visible) return null;

  return (
    <group position={position}>
      {/* Vòng tròn neon ấm áp nhẹ nhàng trong không gian 3D */}
      {!discovered && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.11, 0.145, 24]} />
          <meshBasicMaterial
            color="#FFE296"
            transparent
            opacity={0.72}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Thẻ gợi ý tối giản thân thiện (tự mờ gọn sau khi đã xem) */}
      <Html
        position={[0, 0.18, 0]}
        center
        distanceFactor={7.5}
        zIndexRange={[12, 0]}
      >
        <button
          type="button"
          className={`hotspot-pill ${discovered ? 'discovered' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick();
          }}
        >
          <span className="hotspot-dot" aria-hidden="true" />
          <span>{label}</span>
        </button>
      </Html>
    </group>
  );
}
