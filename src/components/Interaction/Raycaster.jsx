import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function Raycaster({ mode, isPaused, onHoverChange }) {
  const { camera, scene, pointer } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const interactablesRef = useRef([]);
  const lastCheck = useRef(0);
  const lastCacheTime = useRef(-10);
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

    if (mode !== 'OUTSIDE_DOOR' && mode !== 'FREE_EXPLORE') {
      if (currentHoverId.current !== null) {
        currentHoverId.current = null;
        onHoverChange(null);
      }
      return;
    }

    // Throttle raycast to ~15 checks/sec for silky smooth FPS on all devices
    const now = state.clock.elapsedTime;
    if (now - lastCheck.current < 0.065) return;
    lastCheck.current = now;

    // Refresh cached list of interactable meshes only once every 2 seconds
    if (now - lastCacheTime.current > 2.0 || interactablesRef.current.length === 0) {
      const list = [];
      scene.traverse((obj) => {
        if (obj.isMesh && obj.userData && obj.userData.interactable) {
          list.push(obj);
        }
      });
      interactablesRef.current = list;
      lastCacheTime.current = now;
    }

    const isLocked = Boolean(document.pointerLockElement);
    const coords = isLocked ? new THREE.Vector2(0, 0) : pointer;

    raycaster.current.setFromCamera(coords, camera);
    raycaster.current.far = 16;

    // Test ONLY interactable meshes (25x faster than traversing entire scene!)
    const intersects = raycaster.current.intersectObjects(
      interactablesRef.current,
      false
    );
    let found = null;

    for (let i = 0; i < intersects.length; i++) {
      const obj = intersects[i].object;
      if (obj.userData && obj.userData.interactable) {
        if (mode === 'OUTSIDE_DOOR' && obj.userData.id !== 'door') {
          continue;
        }
        found = {
          ...obj.userData,
          distance: intersects[i].distance,
        };
        break;
      }
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
