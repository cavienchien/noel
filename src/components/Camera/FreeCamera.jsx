import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { soundEngine } from '../../assets/sounds/soundEngine';

// Collision Detection against Walls & All 3D Furniture (smooth & forgiving radii so Chibi never snags)
export function isPositionBlocked(x, z, doorOpen) {
  const inDoorwayCorridor =
    doorOpen && x > -0.08 && x < 0.88 && z >= 3.05 && z <= 5.3;
  if (!inDoorwayCorridor) {
    if (x < -4.25 || x > 4.25 || z < -2.65 || z > 3.12) {
      return true;
    }
  } else {
    if (x < -0.08 || x > 0.88 || z > 5.3) {
      return true;
    }
  }

  // Fireplace hearth
  if (x > -3.88 && x < -0.8 && z < -2.32) return true;

  // Christmas Tree + outer gift ring
  const dxTree = x - 0.55;
  const dzTree = z - -2.35;
  if (dxTree * dxTree + dzTree * dzTree < 1.12 * 1.12) return true;

  // 3-Seater Sofa
  if (x > -2.62 && x < -0.08 && z > 1.38 && z < 2.48) return true;

  // Round Coffee Table
  const dxCoffee = x - -1.25;
  const dzCoffee = z - 0.58;
  if (dxCoffee * dxCoffee + dzCoffee * dzCoffee < 0.68 * 0.68) return true;

  // Potted Monstera Plant
  const dxPlant = x - -3.38;
  const dzPlant = z - 1.85;
  if (dxPlant * dxPlant + dzPlant * dzPlant < 0.48 * 0.48) return true;

  // Dining Table & Chairs
  if (x > 1.35 && x < 3.35 && z > -0.68 && z < 0.78) return true;

  return false;
}

function isCameraInsideRoom(x, y, z, playerOutside) {
  if (y < 0.35 || y > 3.35) return false;
  if (playerOutside) {
    return x > -1.65 && x < 2.45 && z > -3.1 && z < 6.4;
  }
  return x > -4.55 && x < 4.55 && z > -3.12 && z < 3.4;
}

const UP = new THREE.Vector3(0, 1, 0);
const FIRST_PERSON_EYE = 1.62;
const CHIBI_LOOK_HEIGHT = 0.95;
const FLOOR_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

// Steering angles tested when an obstacle lies between Chibi and the clicked waypoint
const STEER_ANGLES = [0, 0.55, -0.55, 1.05, -1.05, 1.45, -1.45];

export default function FreeCamera({
  mode,
  isPaused,
  setIsPaused,
  interaction,
  touchMoveRef,
  viewMode = 'third',
  playerRef,
  waypointRef,
  zoomLevelRef,
}) {
  const { camera, gl } = useThree();
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const targetEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const velocity = useRef(new THREE.Vector2(0, 0));
  const isPointerDown = useRef(false);
  const activeTouchId = useRef(null);
  const touchStartMeta = useRef({ x: 0, y: 0, time: 0, moved: false });
  const lastMouse = useRef({ x: 0, y: 0 });
  const initializedRef = useRef(false);
  const walkBobTime = useRef(0);
  const wasOutsideDoorRef = useRef(false);
  const floorRaycaster = useRef(new THREE.Raycaster());

  const tmp = useRef({
    forward: new THREE.Vector3(),
    right: new THREE.Vector3(),
    move: new THREE.Vector3(),
    target: new THREE.Vector3(),
    desired: new THREE.Vector3(),
    offset: new THREE.Vector3(),
    hitPoint: new THREE.Vector3(),
    ndc: new THREE.Vector2(),
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

  // Helper: cast a screen coordinate onto the floor (y=0) and set a smart walk waypoint
  const setFloorWaypointFromScreen = (clientX, clientY) => {
    if (!waypointRef?.current) return;
    const rect = gl.domElement.getBoundingClientRect();
    const v = tmp.current;
    v.ndc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    floorRaycaster.current.setFromCamera(v.ndc, camera);
    const hit = floorRaycaster.current.ray.intersectPlane(FLOOR_PLANE, v.hitPoint);
    if (!hit) return;

    // Clamp to room bounds
    let tx = THREE.MathUtils.clamp(v.hitPoint.x, -4.15, 4.15);
    let tz = THREE.MathUtils.clamp(
      v.hitPoint.z,
      -2.55,
      interaction.doorOpen ? 4.8 : 3.05
    );

    // If user clicked directly inside a furniture footprint, nudge waypoint to nearest clear spot around it
    if (isPositionBlocked(tx, tz, interaction.doorOpen)) {
      let found = false;
      for (let r = 0.45; r <= 1.5 && !found; r += 0.35) {
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          const cx = tx + Math.cos(a) * r;
          const cz = tz + Math.sin(a) * r;
          if (!isPositionBlocked(cx, cz, interaction.doorOpen)) {
            tx = cx;
            tz = cz;
            found = true;
            break;
          }
        }
      }
      if (!found) return;
    }

    if (interaction.isSittingOnSofa) standUpFromSofa();
    if (interaction.inspectingWindow) interaction.setInspectingWindow(false);

    waypointRef.current = { active: true, x: tx, z: tz, stuckTime: 0 };
    soundEngine.playWaypointSound();
  };

  useEffect(() => {
    if (mode === 'FREE_EXPLORE' && !initializedRef.current) {
      euler.current.setFromQuaternion(camera.quaternion, 'YXZ');
      euler.current.z = 0;
      euler.current.x = THREE.MathUtils.clamp(euler.current.x, -0.5, 0.25);
      if (viewMode === 'third' && euler.current.x > -0.15) {
        euler.current.x = -0.26;
      }
      targetEuler.current.copy(euler.current);
      if (playerRef?.current) {
        playerRef.current.pos.set(camera.position.x, 0, Math.min(camera.position.z, 2.5));
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
      if (waypointRef?.current) waypointRef.current.active = false;
    }
  }, [mode, camera, interaction, playerRef, viewMode, waypointRef]);

  useEffect(() => {
    if (mode !== 'FREE_EXPLORE') return;

    const handleKeyDown = (e) => {
      const code = e.code;
      if (code === 'Escape') {
        e.preventDefault();
        if (document.pointerLockElement) document.exitPointerLock();
        setIsPaused((prev) => !prev);
        return;
      }
      if (isPaused) return;

      if (code === 'KeyW' || code === 'ArrowUp') keys.current.w = true;
      if (code === 'KeyS' || code === 'ArrowDown') keys.current.s = true;
      if (code === 'KeyA' || code === 'ArrowLeft') keys.current.a = true;
      if (code === 'KeyD' || code === 'ArrowRight') keys.current.d = true;

      if (keys.current.w || keys.current.s || keys.current.a || keys.current.d) {
        if (waypointRef?.current) waypointRef.current.active = false;
        if (interaction.isSittingOnSofa) standUpFromSofa();
        if (interaction.inspectingWindow) interaction.setInspectingWindow(false);
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
    const pitchMax = () => (viewMode === 'third' ? 0.32 : Math.PI / 2.4);

    // Desktop Left-Drag to Rotate, Right-Click to Smart Walk-To-Point!
    const handleMouseDown = (e) => {
      if (isPaused) return;
      if (e.target !== gl.domElement) return;
      if (e.button === 0) {
        isPointerDown.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleContextMenu = (e) => {
      if (isPaused) return;
      if (e.target !== gl.domElement) return;
      e.preventDefault();
      setFloorWaypointFromScreen(e.clientX, e.clientY);
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
        targetEuler.current.y -= dx * 0.0036;
        targetEuler.current.x = THREE.MathUtils.clamp(
          targetEuler.current.x - dy * 0.0036,
          pitchMin(),
          pitchMax()
        );
      }
    };

    // Phone & iPad: 1-Finger Smooth 360° Swipe + Quick Floor Tap to Smart Walk!
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
        touchStartMeta.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: performance.now(),
          moved: false,
        };
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

          if (
            Math.hypot(
              touch.clientX - touchStartMeta.current.x,
              touch.clientY - touchStartMeta.current.y
            ) > 10
          ) {
            touchStartMeta.current.moved = true;
          }

          targetEuler.current.y += dx * 0.005;
          targetEuler.current.x = THREE.MathUtils.clamp(
            targetEuler.current.x + dy * 0.0038,
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
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchId.current) {
          const dt = performance.now() - touchStartMeta.current.time;
          // Quick tap on empty floor (not hovering an interactable object) walks Chibi there!
          if (
            !touchStartMeta.current.moved &&
            dt < 260 &&
            !interaction.hoveredObject
          ) {
            setFloorWaypointFromScreen(touch.clientX, touch.clientY);
          }
          activeTouchId.current = null;
          break;
        }
      }
    };

    const dom = gl.domElement;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    dom.addEventListener('contextmenu', handleContextMenu);
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
      dom.removeEventListener('contextmenu', handleContextMenu);
      dom.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      keys.current = { w: false, a: false, s: false, d: false };
      activeTouchId.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isPaused, setIsPaused, gl, camera, interaction, viewMode]);

  useEffect(() => {
    if (viewMode === 'third') {
      targetEuler.current.x = THREE.MathUtils.clamp(
        targetEuler.current.x,
        -0.95,
        0.32
      );
      if (targetEuler.current.x > -0.14) targetEuler.current.x = -0.26;
    }
  }, [viewMode]);

  useFrame((_, rawDelta) => {
    if (mode !== 'FREE_EXPLORE' || isPaused) return;
    const delta = Math.min(0.05, rawDelta);
    const player = playerRef?.current;
    if (!player) return;
    const v = tmp.current;
    const isThird = viewMode === 'third';

    // Silky rotational damping
    const rotSmooth = Math.min(1, delta * 15);
    euler.current.x = THREE.MathUtils.lerp(euler.current.x, targetEuler.current.x, rotSmooth);
    euler.current.y = THREE.MathUtils.lerp(euler.current.y, targetEuler.current.y, rotSmooth);

    const tm = touchMoveRef?.current;
    const joyX = tm?.x || 0;
    const joyY = tm?.y || 0;
    const anyTouchWalk = Math.abs(joyX) > 0.08 || Math.abs(joyY) > 0.08;

    if (anyTouchWalk) {
      if (waypointRef?.current) waypointRef.current.active = false;
      if (interaction.isSittingOnSofa) standUpFromSofa();
      if (interaction.inspectingWindow) interaction.setInspectingWindow(false);
    }

    player.hidden = Boolean(interaction.inspectingWindow);

    if (interaction.inspectingWindow) {
      player.moving = false;
      camera.position.lerp(v.win, Math.min(1, delta * 4.5));
      camera.quaternion.slerp(v.winQuat, Math.min(1, delta * 4.5));
      euler.current.setFromQuaternion(camera.quaternion, 'YXZ');
      targetEuler.current.copy(euler.current);
      return;
    }

    if (interaction.isSittingOnSofa) {
      player.moving = false;
      velocity.current.set(0, 0);
      if (!isThird) {
        player.sitting = false;
        camera.position.lerp(v.seat, Math.min(1, delta * 4.5));
        camera.quaternion.setFromEuler(euler.current);
        return;
      }
      player.sitting = true;
      player.pos.lerp(v.sofaSeat, Math.min(1, delta * 6));
      player.yaw = lerpAngle(player.yaw, Math.PI, Math.min(1, delta * 8));
    } else {
      player.sitting = false;
    }

    // Desired movement vector (Manual WASD/Joystick OR Smart Waypoint Auto-Walk)
    let desiredVx = 0;
    let desiredVz = 0;
    const maxSpeed = isThird ? 2.45 : 2.75;

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

      const manualLenSq = v.move.lengthSq();
      if (manualLenSq > 0.002) {
        const mag = manualLenSq > 1 ? 1 : Math.sqrt(manualLenSq);
        v.move.normalize();
        desiredVx = v.move.x * maxSpeed * mag;
        desiredVz = v.move.z * maxSpeed * mag;
      } else if (waypointRef?.current?.active) {
        const wp = waypointRef.current;
        const dx = wp.x - player.pos.x;
        const dz = wp.z - player.pos.z;
        const dist = Math.hypot(dx, dz);

        if (dist < 0.14) {
          wp.active = false;
        } else {
          // Smart obstacle-avoidance steering: test direct angle, then ±30°, ±60°, ±85°
          const baseAngle = Math.atan2(dx, dz);
          const probeDist = Math.min(0.45, dist);
          let chosenAngle = null;

          for (let i = 0; i < STEER_ANGLES.length; i++) {
            const ang = baseAngle + STEER_ANGLES[i];
            const px = player.pos.x + Math.sin(ang) * probeDist;
            const pz = player.pos.z + Math.cos(ang) * probeDist;
            if (!isPositionBlocked(px, pz, interaction.doorOpen)) {
              chosenAngle = ang;
              break;
            }
          }

          if (chosenAngle !== null) {
            const slowDown = THREE.MathUtils.clamp(dist / 0.55, 0.35, 1);
            desiredVx = Math.sin(chosenAngle) * maxSpeed * slowDown;
            desiredVz = Math.cos(chosenAngle) * maxSpeed * slowDown;
            wp.stuckTime = 0;
          } else {
            wp.stuckTime = (wp.stuckTime || 0) + delta;
            if (wp.stuckTime > 0.35) wp.active = false;
          }
        }
      }
    }

    // Smooth game-grade acceleration & deceleration inertia
    const accel = desiredVx !== 0 || desiredVz !== 0 ? 11 : 14;
    velocity.current.x = THREE.MathUtils.lerp(
      velocity.current.x,
      desiredVx,
      Math.min(1, delta * accel)
    );
    velocity.current.y = THREE.MathUtils.lerp(
      velocity.current.y,
      desiredVz,
      Math.min(1, delta * accel)
    );

    const curSpeed = Math.hypot(velocity.current.x, velocity.current.y);
    const isMoving = curSpeed > 0.08;

    if (isMoving) {
      const targetYaw = Math.atan2(velocity.current.x, velocity.current.y);
      player.yaw = lerpAngle(player.yaw, targetYaw, Math.min(1, delta * 12));

      const nextX = player.pos.x + velocity.current.x * delta;
      const nextZ = player.pos.z + velocity.current.y * delta;

      if (!isPositionBlocked(nextX, player.pos.z, interaction.doorOpen)) {
        player.pos.x = nextX;
      } else {
        velocity.current.x *= 0.25;
      }
      if (!isPositionBlocked(player.pos.x, nextZ, interaction.doorOpen)) {
        player.pos.z = nextZ;
      } else {
        velocity.current.y *= 0.25;
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

    player.moving = isMoving;
    player.speed = Math.min(1, curSpeed / maxSpeed);

    // Camera Placement
    if (!isThird) {
      camera.quaternion.setFromEuler(euler.current);
      camera.position.x = player.pos.x;
      camera.position.z = player.pos.z;
      if (isMoving) {
        walkBobTime.current += delta * 9.5;
        camera.position.y = THREE.MathUtils.lerp(
          camera.position.y,
          FIRST_PERSON_EYE + Math.sin(walkBobTime.current) * 0.02,
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

    // Third-person smooth orbit camera with wide scroll/pinch zoom range (1.15m close-up <-> 4.45m panoramic!)
    const zLvl = zoomLevelRef ? zoomLevelRef.current : 0.42;
    const targetDist = THREE.MathUtils.lerp(1.15, 4.45, zLvl);

    const lookHeight = player.sitting ? CHIBI_LOOK_HEIGHT + 0.1 : CHIBI_LOOK_HEIGHT;
    v.target.set(player.pos.x, lookHeight, player.pos.z);
    const pitch = THREE.MathUtils.clamp(euler.current.x, -0.95, 0.32);
    const yaw = euler.current.y;
    v.offset.set(
      Math.sin(yaw) * Math.cos(pitch),
      -Math.sin(pitch) + 0.24,
      Math.cos(yaw) * Math.cos(pitch)
    );

    const playerOutside = player.pos.z > 3.15;
    let dist = targetDist;
    for (let i = 0; i < 24; i++) {
      v.desired.copy(v.target).addScaledVector(v.offset, dist);
      if (isCameraInsideRoom(v.desired.x, v.desired.y, v.desired.z, playerOutside)) {
        break;
      }
      dist -= 0.14;
      if (dist < 0.65) {
        dist = 0.65;
        v.desired.copy(v.target).addScaledVector(v.offset, dist);
        break;
      }
    }

    camera.position.lerp(v.desired, Math.min(1, delta * 10));
    camera.lookAt(v.target);
  });

  return null;
}

function lerpAngle(a, b, t) {
  let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
