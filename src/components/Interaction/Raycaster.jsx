import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function Raycaster({ mode, isPaused, onHoverChange }) {
  const { camera, scene, pointer } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const lastCheck = useRef(0);
  const currentHoverId = useRef(null);

  useEffect(() => {
    return () => {
      onHoverChange(null);
    };
  }, [onHoverChange]);

  useFrame((state) => {
    if (isPaused) {
      if (currentHoverId.current !== null) {
        currentHoverId.current = null;
        onHoverChange(null);
      }
      return;
    }

    // Only raycast in OUTSIDE_DOOR and FREE_EXPLORE modes
    if (mode !== 'OUTSIDE_DOOR' && mode !== 'FREE_EXPLORE') {
      if (currentHoverId.current !== null) {
        currentHoverId.current = null;
        onHoverChange(null);
      }
      return;
    }

    // Throttle raycast to ~25 checks/sec for peak performance
    const now = state.clock.elapsedTime;
    if (now - lastCheck.current < 0.04) return;
    lastCheck.current = now;

    // If pointer is locked, raycast from center crosshair (0,0); otherwise use pointer position
    const isLocked = Boolean(document.pointerLockElement);
    const coords = isLocked ? new THREE.Vector2(0, 0) : pointer;

    raycaster.current.setFromCamera(coords, camera);
    raycaster.current.far = 25;

    const intersects = raycaster.current.intersectObjects(scene.children, true);
    let found = null;

    for (let i = 0; i < intersects.length; i++) {
      let obj = intersects[i].object;
      while (obj) {
        if (obj.userData && obj.userData.interactable) {
          if (mode === 'OUTSIDE_DOOR' && obj.userData.id !== 'door') {
            break;
          }
          found = {
            ...obj.userData,
            distance: intersects[i].distance,
          };
          break;
        }
        obj = obj.parent;
      }
      if (found) break;
    }

    const nextId = found ? `${found.id}-${found.actionLabel}` : null;
    if (nextId !== currentHoverId.current) {
      currentHoverId.current = nextId;
      onHoverChange(found);
      document.body.style.cursor = found ? 'pointer' : 'default';
    }
  });

  return null;
}
