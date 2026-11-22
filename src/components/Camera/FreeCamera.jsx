import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { soundEngine } from '../../assets/sounds/soundEngine';

// Collision Detection against Walls & All 3D Furniture
function isPositionBlocked(x, z, doorOpen) {
  // 1. Room Outer Wall Boundaries
  const inDoorwayCorridor =
    doorOpen && x > -0.05 && x < 0.85 && z >= 3.1 && z <= 5.4;
  if (!inDoorwayCorridor) {
    if (x < -4.32 || x > 4.32 || z < -2.72 || z > 3.18) {
      return true;
    }
  } else {
    if (x < -0.05 || x > 0.85 || z > 5.4) {
      return true;
    }
  }

  // 2. Chimney Breast & Fireplace Hearth (North-Left)
  if (x > -3.95 && x < -0.75 && z < -2.35) {
    return true;
  }

  // 3. Christmas Tree & Gift Boxes (Circle around [0.55, -2.35])
  const dxTree = x - 0.55;
  const dzTree = z - -2.35;
  if (dxTree * dxTree + dzTree * dzTree < 0.96 * 0.96) {
    return true;
  }

  // 4. 3-Seater Sofa (Box around [-1.35, 1.92])
  if (x > -2.72 && x < 0.02 && z > 1.28 && z < 2.58) {
    return true;
  }

  // 5. Round Coffee Table (Circle around [-1.25, 0.58])
  const dxCoffee = x - -1.25;
  const dzCoffee = z - 0.58;
  if (dxCoffee * dxCoffee + dzCoffee * dzCoffee < 0.78 * 0.78) {
    return true;
  }

  // 6. Potted Monstera Plant (Circle around [-3.38, 1.85])
  const dxPlant = x - -3.38;
  const dzPlant = z - 1.85;
  if (dxPlant * dxPlant + dzPlant * dzPlant < 0.58 * 0.58) {
    return true;
  }

  // 7. Dining Table & Chairs (Box around [2.35, 0.05])
  if (x > 1.25 && x < 3.45 && z > -0.78 && z < 0.86) {
    return true;
  }

  return false;
}

export default function FreeCamera({
  mode,
  isPaused,
  setIsPaused,
  interaction,
  touchMoveRef,
}) {
  const { camera, gl } = useThree();
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const targetEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isPointerDown = useRef(false);
  const activeTouchId = useRef(null);
  const lastMouse = useRef({ x: 0, y: 0 });
  const initializedRef = useRef(false);
  const walkBobTime = useRef(0);
  const wasOutsideDoorRef = useRef(false);

  // Sync initial camera rotation when entering FREE_EXPLORE without jumping position
  useEffect(() => {
    if (mode === 'FREE_EXPLORE' && !initializedRef.current) {
      euler.current.setFromQuaternion(camera.quaternion, 'YXZ');
      euler.current.z = 0;
      targetEuler.current.copy(euler.current);
      wasOutsideDoorRef.current = camera.position.z > 3.15;
      if (camera.position.z <= 3.15 && interaction.doorOpen) {
        interaction.setDoorOpen(false);
      }
      initializedRef.current = true;
    } else if (mode !== 'FREE_EXPLORE') {
      initializedRef.current = false;
    }
  }, [mode, camera, interaction]);

  useEffect(() => {
    if (mode !== 'FREE_EXPLORE') return;

    const handleKeyDown = (e) => {
      const code = e.code;
      if (code === 'Escape') {
        e.preventDefault();
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
        setIsPaused((prev) => !prev);
        return;
      }

      if (isPaused) return;

      if (code === 'KeyW' || code === 'ArrowUp') keys.current.w = true;
      if (code === 'KeyS' || code === 'ArrowDown') keys.current.s = true;
      if (code === 'KeyA' || code === 'ArrowLeft') keys.current.a = true;
      if (code === 'KeyD' || code === 'ArrowRight') keys.current.d = true;

      if (
        keys.current.w ||
        keys.current.s ||
        keys.current.a ||
        keys.current.d
      ) {
        if (interaction.isSittingOnSofa) {
          interaction.setIsSittingOnSofa(false);
          camera.position.set(-0.15, 1.62, 1.15);
        }
        if (interaction.inspectingWindow) {
          interaction.setInspectingWindow(false);
        }
        if (interaction.inspectingTable) {
          interaction.setInspectingTable(null);
        }
      }
    };

    const handleKeyUp = (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keys.current.w = false;
      if (code === 'KeyS' || code === 'ArrowDown') keys.current.s = false;
      if (code === 'KeyA' || code === 'ArrowLeft') keys.current.a = false;
      if (code === 'KeyD' || code === 'ArrowRight') keys.current.d = false;
    };

    // Desktop Mouse Look
    const handleMouseDown = (e) => {
      if (isPaused) return;
      if (e.target === gl.domElement) {
        isPointerDown.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isPointerDown.current = false;
    };

    const handleMouseMove = (e) => {
      if (isPaused) return;

      if (document.pointerLockElement === gl.domElement) {
        targetEuler.current.y -= e.movementX * 0.0022;
        targetEuler.current.x = THREE.MathUtils.clamp(
          targetEuler.current.x - e.movementY * 0.0022,
          -Math.PI / 2.4,
          Math.PI / 2.4
        );
      } else if (isPointerDown.current) {
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        targetEuler.current.y -= dx * 0.0035;
        targetEuler.current.x = THREE.MathUtils.clamp(
          targetEuler.current.x - dy * 0.0035,
          -Math.PI / 2.4,
          Math.PI / 2.4
        );
      }
    };

    // Smartphone & iPad Smooth 1-Finger 360° Touch Swipe Rotation (pauses during 2-finger pinch zoom)
    const handleTouchStart = (e) => {
      if (isPaused) return;
      if (e.target !== gl.domElement) return;
      if (e.touches.length >= 2) {
        activeTouchId.current = null;
        return;
      }
      if (activeTouchId.current === null && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        activeTouchId.current = touch.identifier;
        lastMouse.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchMove = (e) => {
      if (isPaused || activeTouchId.current === null) return;
      if (e.touches.length >= 2) {
        activeTouchId.current = null;
        return;
      }
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchId.current) {
          const dx = touch.clientX - lastMouse.current.x;
          const dy = touch.clientY - lastMouse.current.y;
          lastMouse.current = { x: touch.clientX, y: touch.clientY };
          // Natural 1-finger swipe sensitivity for smooth 360° look
          targetEuler.current.y += dx * 0.0048;
          targetEuler.current.x = THREE.MathUtils.clamp(
            targetEuler.current.x + dy * 0.0036,
            -Math.PI / 2.4,
            Math.PI / 2.4
          );
          break;
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (activeTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId.current) {
          activeTouchId.current = null;
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    const dom = gl.domElement;
    dom.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      dom.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      keys.current = { w: false, a: false, s: false, d: false };
      activeTouchId.current = null;
    };
  }, [mode, isPaused, setIsPaused, gl, camera, interaction]);

  useFrame((_, delta) => {
    if (mode !== 'FREE_EXPLORE' || isPaused) return;

    // Smooth rotational damping (makes 1-finger touch swipe & mouse look silky smooth)
    const rotSmooth = Math.min(1, delta * 14);
    euler.current.x = THREE.MathUtils.lerp(
      euler.current.x,
      targetEuler.current.x,
      rotSmooth
    );
    euler.current.y = THREE.MathUtils.lerp(
      euler.current.y,
      targetEuler.current.y,
      rotSmooth
    );

    const tm = touchMoveRef?.current;
    const joyX = tm?.x || 0;
    const joyY = tm?.y || 0;
    const anyTouchWalk = Math.abs(joyX) > 0.08 || Math.abs(joyY) > 0.08;

    if (anyTouchWalk) {
      if (interaction.isSittingOnSofa) {
        interaction.setIsSittingOnSofa(false);
        camera.position.set(-0.15, 1.62, 1.15);
      }
      if (interaction.inspectingWindow) {
        interaction.setInspectingWindow(false);
      }
      if (interaction.inspectingTable) {
        interaction.setInspectingTable(null);
      }
    }

    // 1. Special Seated on Sofa State
    if (interaction.isSittingOnSofa) {
      const seatPos = new THREE.Vector3(-1.35, 1.16, 1.55);
      camera.position.lerp(seatPos, Math.min(1, delta * 4.5));
      camera.quaternion.setFromEuler(euler.current);
      return;
    }

    // 2. Special Window Gazing State
    if (interaction.inspectingWindow) {
      const winPos = new THREE.Vector3(2.45, 1.72, -2.15);
      camera.position.lerp(winPos, Math.min(1, delta * 4.2));
      const targetQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0.06, 0, 0, 'YXZ')
      );
      camera.quaternion.slerp(targetQuat, Math.min(1, delta * 4.5));
      euler.current.setFromQuaternion(camera.quaternion, 'YXZ');
      targetEuler.current.copy(euler.current);
      return;
    }

    // 3. Apply Smooth Look Rotation
    camera.quaternion.setFromEuler(euler.current);

    // 4. First-Person WASD + Analog Touch Joystick Movement with Sliding Collision Detection
    const moveSpeed = 2.65;
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      euler.current.y
    );
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      euler.current.y
    );

    const moveVec = new THREE.Vector3();
    if (keys.current.w) moveVec.add(forward);
    if (keys.current.s) moveVec.sub(forward);
    if (keys.current.d) moveVec.add(right);
    if (keys.current.a) moveVec.sub(right);

    if (anyTouchWalk) {
      moveVec.addScaledVector(forward, joyY);
      moveVec.addScaledVector(right, joyX);
    }

    const lenSq = moveVec.lengthSq();
    const isMoving = lenSq > 0.002;
    if (isMoving) {
      const speedScale = lenSq > 1 ? 1 : Math.sqrt(lenSq);
      moveVec.normalize().multiplyScalar(moveSpeed * speedScale * delta);

      const curX = camera.position.x;
      const curZ = camera.position.z;
      const nextX = curX + moveVec.x;
      const nextZ = curZ + moveVec.z;

      if (!isPositionBlocked(nextX, curZ, interaction.doorOpen)) {
        camera.position.x = nextX;
      }
      if (!isPositionBlocked(camera.position.x, nextZ, interaction.doorOpen)) {
        camera.position.z = nextZ;
      }

      if (camera.position.z > 3.2) {
        wasOutsideDoorRef.current = true;
      } else if (wasOutsideDoorRef.current && camera.position.z <= 3.05) {
        wasOutsideDoorRef.current = false;
        if (interaction.doorOpen) {
          interaction.setDoorOpen(false);
          soundEngine.playDoorSound(false);
        }
      }

      walkBobTime.current += delta * 9.5;
      camera.position.y = THREE.MathUtils.lerp(
        camera.position.y,
        1.62 + Math.sin(walkBobTime.current) * 0.022,
        Math.min(1, delta * 12)
      );
    } else {
      camera.position.y = THREE.MathUtils.lerp(
        camera.position.y,
        1.62,
        Math.min(1, delta * 8)
      );
    }
  });

  return null;
}
