import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import GuidedCamera from './GuidedCamera';
import FreeCamera from './FreeCamera';

export default function FirstPersonCamera({
  mode,
  currentGuidedStop,
  isPaused,
  setIsPaused,
  interaction,
  touchMoveRef,
  viewMode,
  playerRef,
}) {
  const { camera, size, gl } = useThree();
  const baseFovRef = useRef(55);
  const targetFovRef = useRef(55);
  const pinchDistRef = useRef(null);

  // Tự động cập nhật FOV chuẩn theo tỷ lệ màn hình (dọc điện thoại / iPad / ngang)
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const nextBase = aspect < 0.8 ? 72 : aspect < 1.15 ? 62 : 55;
    baseFovRef.current = nextBase;
    targetFovRef.current = THREE.MathUtils.clamp(
      targetFovRef.current,
      24,
      nextBase + 8
    );
    // Reset về FOV chuẩn khi mới đổi kích thước màn hình
    targetFovRef.current = nextBase;
  }, [size.width, size.height]);

  // Hỗ trợ Zoom bằng con lăn chuột / trackpad laptop và chụm-mở 2 ngón tay trên điện thoại/iPad
  useEffect(() => {
    const dom = gl.domElement;
    if (!dom) return;

    const minFov = 24;

    const handleWheel = (e) => {
      if (isPaused || mode === 'START') return;
      e.preventDefault();
      const maxFov = baseFovRef.current + 8;
      // Hỗ trợ cả con lăn chuột và cử chỉ chụm 2 ngón trên touchpad laptop (ctrlKey)
      const sensitivity = e.ctrlKey ? 0.14 : 0.032;
      targetFovRef.current = THREE.MathUtils.clamp(
        targetFovRef.current + e.deltaY * sensitivity,
        minFov,
        maxFov
      );
    };

    const getPinchDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    const handleTouchStart = (e) => {
      if (isPaused || mode === 'START') return;
      if (e.touches.length === 2) {
        pinchDistRef.current = getPinchDistance(e.touches);
      }
    };

    const handleTouchMove = (e) => {
      if (isPaused || mode === 'START') return;
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = getPinchDistance(e.touches);
        if (pinchDistRef.current !== null) {
          const delta = dist - pinchDistRef.current;
          const maxFov = baseFovRef.current + 8;
          // Mở 2 ngón (delta > 0) -> giảm FOV (phóng to chi tiết)
          targetFovRef.current = THREE.MathUtils.clamp(
            targetFovRef.current - delta * 0.14,
            minFov,
            maxFov
          );
        }
        pinchDistRef.current = dist;
      }
    };

    const handleTouchEnd = (e) => {
      if (e.touches.length < 2) {
        pinchDistRef.current = null;
      }
    };

    dom.addEventListener('wheel', handleWheel, { passive: false });
    dom.addEventListener('touchstart', handleTouchStart, { passive: true });
    dom.addEventListener('touchmove', handleTouchMove, { passive: false });
    dom.addEventListener('touchend', handleTouchEnd, { passive: true });
    dom.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('touchstart', handleTouchStart);
      dom.removeEventListener('touchmove', handleTouchMove);
      dom.removeEventListener('touchend', handleTouchEnd);
      dom.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [gl, isPaused, mode]);

  // Làm mượt chuyển động phóng to / thu nhỏ mỗi khung hình
  useFrame((_, delta) => {
    const diff = Math.abs(camera.fov - targetFovRef.current);
    if (diff > 0.02) {
      camera.fov = THREE.MathUtils.lerp(
        camera.fov,
        targetFovRef.current,
        Math.min(1, delta * 12)
      );
      camera.updateProjectionMatrix();
    }
  });

  return (
    <>
      <GuidedCamera mode={mode} currentGuidedStop={currentGuidedStop} />
      <FreeCamera
        mode={mode}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        interaction={interaction}
        touchMoveRef={touchMoveRef}
        viewMode={viewMode}
        playerRef={playerRef}
      />
    </>
  );
}
