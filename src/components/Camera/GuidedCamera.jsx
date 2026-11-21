import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function GuidedCamera({ mode, currentGuidedStop }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0.4, 1.55, 5.15));
  const targetLookAt = useRef(new THREE.Vector3(0.4, 1.38, 3.6));
  const currentLookAt = useRef(new THREE.Vector3(0.4, 1.38, 3.6));

  // Allow user to look around freely with mouse movement/drag during Guided Exploration
  const lookOffset = useRef({ yaw: 0, pitch: 0 });
  const isDragging = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onPointerDown = (e) => {
      isDragging.current = true;
      prevPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => {
      isDragging.current = false;
    };
    const onPointerMove = (e) => {
      if (isDragging.current) {
        const dx = e.clientX - prevPointer.current.x;
        const dy = e.clientY - prevPointer.current.y;
        prevPointer.current = { x: e.clientX, y: e.clientY };
        lookOffset.current.yaw = THREE.MathUtils.clamp(
          lookOffset.current.yaw - dx * 0.0045,
          -0.85,
          0.85
        );
        lookOffset.current.pitch = THREE.MathUtils.clamp(
          lookOffset.current.pitch - dy * 0.0035,
          -0.45,
          0.45
        );
      } else {
        // Subtle parallax look-around even without holding mouse button
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;
        lookOffset.current.yaw = THREE.MathUtils.lerp(
          lookOffset.current.yaw,
          -nx * 0.28,
          0.08
        );
        lookOffset.current.pitch = THREE.MathUtils.lerp(
          lookOffset.current.pitch,
          -ny * 0.16,
          0.08
        );
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  useEffect(() => {
    // Reset look offset slightly when switching guided stops
    lookOffset.current = { yaw: 0, pitch: 0 };

    if (mode === 'START') {
      targetPos.current.set(0.4, 1.58, 5.35);
      targetLookAt.current.set(0.4, 1.4, 3.6);
    } else if (mode === 'OUTSIDE_DOOR') {
      targetPos.current.set(0.4, 1.56, 4.95);
      targetLookAt.current.set(0.4, 1.32, 3.6);
    } else if (mode === 'OPENING_DOOR') {
      targetPos.current.set(0.4, 1.58, 4.2);
      targetLookAt.current.set(0.1, 1.38, -1.5);
    } else if (mode === 'ENTERING_ROOM' || mode === 'GUIDED_OVERVIEW') {
      targetPos.current.set(0.42, 1.64, 2.48);
      targetLookAt.current.set(-0.35, 1.28, -2.2);
    } else if (mode === 'GUIDED_TOUR' && currentGuidedStop) {
      targetPos.current.set(...currentGuidedStop.cameraPos);
      targetLookAt.current.set(...currentGuidedStop.lookAt);
    } else if (mode === 'GUIDED_COMPLETE') {
      targetPos.current.set(0.38, 1.62, 1.65);
      targetLookAt.current.set(-0.4, 1.3, -2.2);
    }
  }, [mode, currentGuidedStop]);

  useFrame((_, delta) => {
    if (mode === 'FREE_EXPLORE') return;

    const lerpSpeed = mode === 'ENTERING_ROOM' ? 1.45 : 2.4;
    camera.position.lerp(targetPos.current, Math.min(1, delta * lerpSpeed));
    currentLookAt.current.lerp(
      targetLookAt.current,
      Math.min(1, delta * (lerpSpeed * 1.15))
    );

    // Apply user look-around offset relative to the current look direction
    const dir = new THREE.Vector3()
      .subVectors(currentLookAt.current, camera.position)
      .normalize();

    const euler = new THREE.Euler(
      lookOffset.current.pitch,
      lookOffset.current.yaw,
      0,
      'YXZ'
    );
    dir.applyEuler(euler);

    const finalLook = new THREE.Vector3()
      .copy(camera.position)
      .add(dir.multiplyScalar(4));
    camera.lookAt(finalLook);
  });

  return null;
}
