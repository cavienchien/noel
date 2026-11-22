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
  if (dxTree * dxTree + dzTree * dzTree < 0.92 * 0.92) {
    return true;
  }

  // 4. 3-Seater Sofa (Box around [-1.35, 1.92])
  if (x > -2.66 && x < -0.04 && z > 1.34 && z < 2.52) {
    return true;
  }

  // 5. Round Coffee Table (Circle around [-1.25, 0.58])
  const dxCoffee = x - -1.25;
  const dzCoffee = z - 0.58;
  if (dxCoffee * dxCoffee + dzCoffee * dzCoffee < 0.7 * 0.7) {
    return true;
  }

  // 6. Potted Monstera Plant (Circle around [-3.38, 1.85])
  const dxPlant = x - -3.38;
  const dzPlant = z - 1.85;
  if (dxPlant * dxPlant + dzPlant * dzPlant < 0.52 * 0.52) {
    return true;
  }

  // 7. Dining Table & Chairs (Box around [2.35, 0.05])
  if (x > 1.32 && x < 3.38 && z > -0.72 && z < 0.8) {
    return true;
  }

  return false;
}

// Keep the third-person camera inside the room walls (or the entrance foyer)
function isCameraInsideRoom(x, y, z, playerOutside) {
  if (y < 0.35 || y > 3.32) return false;
  if (playerOutside) {
    return x > -1.65 && x < 2.45 && z > -3.1 && z < 6.4;
  }
  return x > -4.55 && x < 4.55 && z > -3.12 && z < 3.4;
}

const UP = new THREE.Vector3(0, 1, 0);
const FIRST_PERSON_EYE = 1.62;
const CHIBI_LOOK_HEIGHT = 0.95;
const THIRD_PERSON_DISTANCE = 2.5;

export default function FreeCamera({
  mode,
  isPaused,
  setIsPaused,
  interaction,
  touchMoveRef,
  viewMode = 'third',
  playerRef,
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

  // Reusable vectors (avoid per-frame allocations for smoother mobile performance)
  const tmp = useRef({
    forward: new THREE.Vector3(),
    right: new THREE.Vector3(),
    move: new THREE.Vector3(),
    target: new THREE.Vector3(),
    desired: new THREE.Vector3(),
    offset: new THREE.Vector3(),
    seat: new THREE.Vector3(-1.35, 1.16, 1.55),
    sofaSeat: new THREE.Vector3(-1.35, 0, 1.8),
    win: new THREE.Vector3(2.45, 1.72, -2.15),
    winQuat: new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0.06, 0, 0, 'YXZ')
    ),
  });

  const standUpFromSofa = () => {
    interaction.setIsSittingOnSofa(false);
    if (playerRef?.current) {
      playerRef.current.pos.set(-0.15, 0, 1.15);
      playerRef.current.sitting = false;
    }
  };

  // Sync initial camera rotation & player position when entering FREE_EXPLORE without jumping
  useEffect(() => {
    if (mode === 'FREE_EXPLORE' && !initializedRef.current) {
      euler.current.setFromQuaternion(camera.quaternion, 'YXZ');
      euler.current.z = 0;
      euler.current.x = THREE.MathUtils.clamp(euler.current.x, -0.5, 0.3);
      targetEuler.current.copy(euler.current);
      if (playerRef?.current) {
        playerRef.current.pos.set(camera.position.x, 0, camera.position.z);
        playerRef.current.yaw = euler.current.y + Math.PI;
        playerRef.current.moving = false;
        playerRef.current.sitting = false;
      }
      wasOutsideDoorRef.current = camera.position.z > 3.15;
      if (camera.position.z <= 3.15 && interaction.doorOpen) {
        interaction.setDoorOpen(false);
      }
      initializedRef.current = true;
    } else if (mode !== 'FREE_EXPLORE') {
      initializedRef.current = false;
    }
  }, [mode, camera, interaction, playerRef]);

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
          standUpFromSofa();
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

    const pitchMin = () => (viewMode === 'third' ? -0.95 : -Math.PI / 2.4);
    const pitchMax = () => (viewMode === 'third' ? 0.35 : Math.PI / 2.4);

    // Desktop Mouse Look / Orbit
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
          pitchMin(),
          pitchMax()
        );
      } else if (isPointerDown.current) {
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        targetEuler.current.y -= dx * 0.0035;
        targetEuler.current.x = THREE.MathUtils.clamp(
          targetEuler.current.x - dy * 0.0035,
          pitchMin(),
          pitchMax()
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
          targetEuler.current.y += dx * 0.0048;
          targetEuler.current.x = THREE.MathUtils.clamp(
            targetEuler.current.x + dy * 0.0036,
            pitchMin(),
            pitchMax()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isPaused, setIsPaused, gl, camera, interaction, viewMode]);

  // Clamp pitch when switching view modes so the orbit camera never flips
  useEffect(() => {
    if (viewMode === 'third') {
      targetEuler.current.x = THREE.MathUtils.clamp(
        targetEuler.current.x,
        -0.95,
        0.35
      );
      if (targetEuler.current.x > -0.12) targetEuler.current.x = -0.28;
    }
  }, [viewMode]);

  useFrame((_, delta) => {
    if (mode !== 'FREE_EXPLORE' || isPaused) return;
    const player = playerRef?.current;
    if (!player) return;
    const v = tmp.current;
    const isThird = viewMode === 'third';

    // Smooth rotational damping
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
        standUpFromSofa();
      }
      if (interaction.inspectingWindow) {
        interaction.setInspectingWindow(false);
      }
      if (interaction.inspectingTable) {
        interaction.setInspectingTable(null);
      }
    }

    player.hidden = Boolean(interaction.inspectingWindow);

    // 1. Special Window Gazing State (shared by both view modes)
    if (interaction.inspectingWindow) {
      player.moving = false;
      camera.position.lerp(v.win, Math.min(1, delta * 4.2));
      camera.quaternion.slerp(v.winQuat, Math.min(1, delta * 4.5));
      euler.current.setFromQuaternion(camera.quaternion, 'YXZ');
      targetEuler.current.copy(euler.current);
      return;
    }

    // 2. Seated on Sofa State
    if (interaction.isSittingOnSofa) {
      player.moving = false;
      if (!isThird) {
        player.sitting = false;
        camera.position.lerp(v.seat, Math.min(1, delta * 4.5));
        camera.quaternion.setFromEuler(euler.current);
        return;
      }
      // Chibi sits cutely on the sofa facing the fireplace
      player.sitting = true;
      player.pos.lerp(v.sofaSeat, Math.min(1, delta * 6));
      player.yaw = lerpAngle(player.yaw, Math.PI, Math.min(1, delta * 8));
    } else {
      player.sitting = false;
    }

    // 3. Movement (WASD + analog joystick), relative to camera yaw
    let isMoving = false;
    let speedScale = 0;
    if (!interaction.isSittingOnSofa) {
      v.forward.set(0, 0, -1).applyAxisAngle(UP, euler.current.y);
      v.right.set(1, 0, 0).applyAxisAngle(UP, euler.current.y);
      v.move.set(0, 0, 0);
      if (keys.current.w) v.move.add(v.forward);
      if (keys.current.s) v.move.sub(v.forward);
      if (keys.current.d) v.move.add(v.right);
      if (keys.current.a) v.move.sub(v.right);
      if (anyTouchWalk) {
        v.move.addScaledVector(v.forward, joyY);
        v.move.addScaledVector(v.right, joyX);
      }

      const lenSq = v.move.lengthSq();
      isMoving = lenSq > 0.002;
      if (isMoving) {
        speedScale = lenSq > 1 ? 1 : Math.sqrt(lenSq);
        const moveSpeed = isThird ? 2.3 : 2.65;
        v.move.normalize();

        // Chibi turns smoothly toward the walking direction
        const targetYaw = Math.atan2(v.move.x, v.move.z);
        player.yaw = lerpAngle(player.yaw, targetYaw, Math.min(1, delta * 12));

        v.move.multiplyScalar(moveSpeed * speedScale * delta);
        const curX = player.pos.x;
        const curZ = player.pos.z;
        const nextX = curX + v.move.x;
        const nextZ = curZ + v.move.z;

        if (!isPositionBlocked(nextX, curZ, interaction.doorOpen)) {
          player.pos.x = nextX;
        }
        if (!isPositionBlocked(player.pos.x, nextZ, interaction.doorOpen)) {
          player.pos.z = nextZ;
        }

        if (player.pos.z > 3.2) {
          wasOutsideDoorRef.current = true;
        } else if (wasOutsideDoorRef.current && player.pos.z <= 3.05) {
          wasOutsideDoorRef.current = false;
          if (interaction.doorOpen) {
            interaction.setDoorOpen(false);
            soundEngine.playDoorSound(false);
          }
        }
      }
    }
    player.moving = isMoving;
    player.speed = speedScale;

    // 4. Camera placement
    if (!isThird) {
      camera.quaternion.setFromEuler(euler.current);
      camera.position.x = player.pos.x;
      camera.position.z = player.pos.z;
      if (isMoving) {
        walkBobTime.current += delta * 9.5;
        camera.position.y = THREE.MathUtils.lerp(
          camera.position.y,
          FIRST_PERSON_EYE + Math.sin(walkBobTime.current) * 0.022,
          Math.min(1, delta * 12)
        );
      } else {
        camera.position.y = THREE.MathUtils.lerp(
          camera.position.y,
          FIRST_PERSON_EYE,
          Math.min(1, delta * 8)
        );
      }
      return;
    }

    // Third-person orbit camera behind & above the chibi
    const lookHeight = player.sitting ? CHIBI_LOOK_HEIGHT + 0.12 : CHIBI_LOOK_HEIGHT;
    v.target.set(player.pos.x, lookHeight, player.pos.z);
    const pitch = THREE.MathUtils.clamp(euler.current.x, -0.95, 0.35);
    const yaw = euler.current.y;
    v.offset.set(
      Math.sin(yaw) * Math.cos(pitch),
      -Math.sin(pitch) + 0.22,
      Math.cos(yaw) * Math.cos(pitch)
    );

    // Pull the camera closer when a wall is behind it (never clips outside the room)
    const playerOutside = player.pos.z > 3.15;
    let dist = THIRD_PERSON_DISTANCE;
    for (let i = 0; i < 18; i++) {
      v.desired.copy(v.target).addScaledVector(v.offset, dist);
      if (isCameraInsideRoom(v.desired.x, v.desired.y, v.desired.z, playerOutside)) {
        break;
      }
      dist -= 0.12;
      if (dist < 0.6) {
        dist = 0.6;
        v.desired.copy(v.target).addScaledVector(v.offset, dist);
        break;
      }
    }

    camera.position.lerp(v.desired, Math.min(1, delta * 9));
    camera.lookAt(v.target);
  });

  return null;
}

function lerpAngle(a, b, t) {
  let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
