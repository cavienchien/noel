import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function getInteractableData(obj) {
  let cur = obj;
  while (cur) {
    if (cur.userData && cur.userData.interactable) {
      return cur.userData;
    }
    cur = cur.parent;
  }
  return null;
}

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
    if (isPaused || (mode !== 'OUTSIDE_DOOR' && mode !== 'FREE_EXPLORE')) {
      if (currentHoverId.current !== null) {
        currentHoverId.current = null;
        onHoverChange(null);
      }
      return;
    }

    const now = state.clock.elapsedTime;
    if (now - lastCheck.current < 0.065) return;
    lastCheck.current = now;

    // Cache every Mesh that either has interactable userData itself OR lives inside an interactable Group (e.g. Gift Boxes, Candles, Door Handle)
    if (now - lastCacheTime.current > 2.0 || interactablesRef.current.length === 0) {
      const list = [];
      scene.traverse((obj) => {
        if (obj.isMesh && getInteractableData(obj)) {
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

    const intersects = raycaster.current.intersectObjects(
      interactablesRef.current,
      false
    );
    let found = null;

    for (let i = 0; i < intersects.length; i++) {
      const data = getInteractableData(intersects[i].object);
      if (data) {
        if (mode === 'OUTSIDE_DOOR' && data.id !== 'door') {
          continue;
        }
        found = {
          ...data,
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
