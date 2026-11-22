import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import Raycaster from './Raycaster';

const AREA_ZONES = [
  { name: 'Lò sưởi', x: -2.15, z: -2.6, radius: 2.35 },
  { name: 'Cây thông Noel', x: 0.55, z: -2.1, radius: 2.25 },
  { name: 'Khu vực Sofa', x: -1.3, z: 1.15, radius: 2.35 },
  { name: 'Khu vực Bàn ăn', x: 2.35, z: 0.1, radius: 2.35 },
];

export default function InteractionManager({
  mode,
  isPaused,
  interaction,
  onAreaProximityChange,
  playerRef,
}) {
  const { camera } = useThree();
  const lastZoneRef = useRef(null);

  useFrame(() => {
    if (mode !== 'FREE_EXPLORE' || isPaused) return;

    // Detect which zone the user (or the chibi in third-person) is standing near
    const px = playerRef?.current ? playerRef.current.pos.x : camera.position.x;
    const pz = playerRef?.current ? playerRef.current.pos.z : camera.position.z;
    let closestZone = null;
    let minDist = Infinity;

    for (const zone of AREA_ZONES) {
      const dx = px - zone.x;
      const dz = pz - zone.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist <= zone.radius && dist < minDist) {
        minDist = dist;
        closestZone = zone.name;
      }
    }

    if (closestZone !== lastZoneRef.current) {
      lastZoneRef.current = closestZone;
      if (onAreaProximityChange) {
        onAreaProximityChange(closestZone);
      }
    }
  });

  return (
    <Raycaster
      mode={mode}
      isPaused={isPaused}
      onHoverChange={interaction.setHoveredObject}
    />
  );
}
