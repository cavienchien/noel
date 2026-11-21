import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import Floor from './Floor';
import Walls from './Walls';
import Door from './Door';
import Window from './Window';
import Fireplace from '../Furniture/Fireplace';
import ChristmasTree from '../Furniture/ChristmasTree';
import Sofa from '../Furniture/Sofa';
import CoffeeTable from '../Furniture/CoffeeTable';
import DiningTable from '../Furniture/DiningTable';
import Chairs from '../Furniture/Chairs';
import Plants from '../Furniture/Plants';

export default function Room({
  mode,
  currentGuidedStop,
  interaction,
  onTriggerInitialDoor,
}) {
  const dustRef = useRef();

  // Subtle floating golden dust motes in the warm indoor air
  const particlePositions = useMemo(() => {
    const count = 90;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8.4;
      arr[i * 3 + 1] = 0.3 + Math.random() * 2.8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6.0;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (dustRef.current) {
      const pos = dustRef.current.geometry.attributes.position;
      const t = state.clock.elapsedTime;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + Math.sin(t * 0.6 + i) * delta * 0.03;
        let x = pos.getX(i) + Math.cos(t * 0.4 + i * 0.5) * delta * 0.02;
        if (y > 3.2) y = 0.4;
        if (y < 0.3) y = 3.1;
        pos.setXY(i, x, y);
      }
      pos.needsUpdate = true;
    }
  });

  const activeGuidedId =
    mode === 'GUIDED_TOUR' && currentGuidedStop ? currentGuidedStop.id : null;

  return (
    <group>
      {/* Global Warm Scandinavian Ambient & Hemisphere Lighting */}
      <ambientLight
        intensity={interaction.windowEveningMode ? 0.38 : 0.62}
        color="#FFF6E8"
      />
      <hemisphereLight
        args={[
          '#FFF8EE',
          '#DFD3C3',
          interaction.windowEveningMode ? 0.32 : 0.55,
        ]}
      />

      {/* Warm Ceiling Fill Lights */}
      <pointLight
        position={[-1.5, 3.3, 0.2]}
        intensity={0.65}
        distance={9}
        decay={2}
        color="#FFF0D4"
      />
      <pointLight
        position={[2.1, 3.3, 0.2]}
        intensity={0.55}
        distance={9}
        decay={2}
        color="#FFF2DC"
      />
      {/* Exterior Foyer Welcome Light */}
      <pointLight
        position={[0.4, 2.8, 4.6]}
        intensity={0.6}
        distance={5}
        decay={2}
        color="#FFE4B5"
      />

      {/* Room Shell */}
      <Floor />
      <Walls />
      <Door
        doorOpen={interaction.doorOpen}
        mode={mode}
        hoveredObject={interaction.hoveredObject}
        onTriggerInitialDoor={onTriggerInitialDoor}
        onInteract={interaction.handleObjectInteraction}
      />
      <Window
        hoveredObject={interaction.hoveredObject}
        windowEveningMode={interaction.windowEveningMode}
        mode={mode}
        onInteract={interaction.handleObjectInteraction}
      />

      {/* Furniture & Decor Areas */}
      <Fireplace
        fireplaceOn={interaction.fireplaceOn}
        candlesOn={interaction.candlesOn}
        hoveredObject={interaction.hoveredObject}
        isGuidedHighlighted={activeGuidedId === 'fireplace'}
        mode={mode}
        onInteract={interaction.handleObjectInteraction}
      />

      <ChristmasTree
        treeLightsOn={interaction.treeLightsOn}
        giftsOpened={interaction.giftsOpened}
        hoveredObject={interaction.hoveredObject}
        isGuidedHighlighted={activeGuidedId === 'tree'}
        mode={mode}
        onInteract={interaction.handleObjectInteraction}
      />

      <Sofa
        hoveredObject={interaction.hoveredObject}
        isGuidedHighlighted={activeGuidedId === 'sofa'}
        isSittingOnSofa={interaction.isSittingOnSofa}
        mode={mode}
        onInteract={interaction.handleObjectInteraction}
      />

      <CoffeeTable
        candlesOn={interaction.candlesOn}
        hoveredObject={interaction.hoveredObject}
        isGuidedHighlighted={activeGuidedId === 'sofa'}
        mode={mode}
        onInteract={interaction.handleObjectInteraction}
      />

      <Plants isGuidedHighlighted={activeGuidedId === 'sofa'} />

      <DiningTable
        candlesOn={interaction.candlesOn}
        hoveredObject={interaction.hoveredObject}
        isGuidedHighlighted={activeGuidedId === 'dining'}
        mode={mode}
        onInteract={interaction.handleObjectInteraction}
      />

      <Chairs isGuidedHighlighted={activeGuidedId === 'dining'} />

      {/* Warm Floating Golden Light Motes */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#F5D78E"
          size={0.028}
          transparent
          opacity={0.55}
        />
      </points>
    </group>
  );
}
