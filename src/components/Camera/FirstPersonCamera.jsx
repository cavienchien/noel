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
  waypointRef,
}) {
  const { camera, size, gl } = useThree();
  const baseFovRef = useRef(55);
  // zoomLevel: 0 = cận cảnh soi chi tiết, 0.42 = mặc định êm mắt, 1.0 = thu phóng rộng bao quát toàn phòng
  const zoomLevelRef = useRef(0.42);
  const targetZoomRef = useRef(0.42);
  const pinchDistRef = useRef(null);

  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    baseFovRef.current = aspect < 0.8 ? 72 : aspect < 1.15 ? 62 : 55;
  }, [size.width, size.height]);

  // Zoom mượt diện rộng bằng Con Lăn Chuột / Touchpad Laptop & Chụm-Mở 2 Ngón trên Phone/iPad
  useEffect(() => {
    const dom = gl.domElement;
    if (!dom) return;

    const handleWheel = (e) => {
      if (isPaused || mode === 'START') return;
      e.preventDefault();
      const sens = e.ctrlKey ? 0.0045 : 0.0012;
      targetZoomRef.current = THREE.MathUtils.clamp(
        targetZoomRef.current + e.deltaY * sens,
        0,
        1
      );
    };

    const getPinchDistance = (touches) =>
      Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
      );

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
          // Mở 2 ngón -> giảm zoomLevel (phóng to cận cảnh); Chụm 2 ngón -> tăng zoomLevel (bao quát toàn phòng)
          targetZoomRef.current = THREE.MathUtils.clamp(
            targetZoomRef.current - delta * 0.0042,
            0,
            1
          );
        }
        pinchDistRef.current = dist;
      }
    };

    const handleTouchEnd = (e) => {
      if (e.touches.length < 2) pinchDistRef.current = null;
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

  useFrame((_, delta) => {
    const smooth = Math.min(1, delta * 10);
    zoomLevelRef.current = THREE.MathUtils.lerp(
      zoomLevelRef.current,
      targetZoomRef.current,
      smooth
    );

    // Tính FOV động theo mức zoom & chế độ góc nhìn
    const base = baseFovRef.current;
    const desiredFov =
      viewMode === 'third'
        ? THREE.MathUtils.lerp(Math.max(36, base - 14), Math.min(82, base + 14), zoomLevelRef.current)
        : THREE.MathUtils.lerp(24, Math.min(84, base + 15), zoomLevelRef.current);

    if (Math.abs(camera.fov - desiredFov) > 0.04) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, desiredFov, smooth);
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
        waypointRef={waypointRef}
        zoomLevelRef={zoomLevelRef}
      />
    </>
  );
}
