import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import GuidedCamera from './GuidedCamera';
import FreeCamera from './FreeCamera';

export default function FirstPersonCamera({
  mode,
  currentGuidedStop,
  isPaused,
  setIsPaused,
  interaction,
  touchMoveRef,
}) {
  const { camera, size } = useThree();

  // Tự động tối ưu góc nhìn (FOV) cho màn hình dọc điện thoại, iPad và màn hình ngang
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const targetFov = aspect < 0.8 ? 72 : aspect < 1.15 ? 62 : 55;
    if (camera.fov !== targetFov) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height]);

  return (
    <>
      <GuidedCamera mode={mode} currentGuidedStop={currentGuidedStop} />
      <FreeCamera
        mode={mode}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        interaction={interaction}
        touchMoveRef={touchMoveRef}
      />
    </>
  );
}
