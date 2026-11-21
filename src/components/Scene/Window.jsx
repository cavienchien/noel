import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

export default function Window({
  hoveredObject,
  windowEveningMode,
  mode,
  onInteract,
}) {
  const snowRef = useRef();
  const isHovered = hoveredObject?.id === 'window';

  // Generate 3D falling snow particles outside the window
  const snowPositions = useMemo(() => {
    const count = 220;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 4.4;
      arr[i * 3 + 1] = Math.random() * 3.4 - 1.2;
      arr[i * 3 + 2] = -0.35 - Math.random() * 2.4;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (snowRef.current) {
      const posAttr = snowRef.current.geometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) - delta * 0.42;
        let x = posAttr.getX(i) + Math.sin(y * 3 + i) * delta * 0.08;
        if (y < -1.2) y = 1.9;
        posAttr.setXY(i, x, y);
      }
      posAttr.needsUpdate = true;
    }
  });

  const interactData = {
    interactable: true,
    id: 'window',
    name: 'Cửa Sổ Mùa Đông',
    actionLabel: 'Quan Sát Bên Ngoài',
    area: 'Khu vực Bàn ăn',
    position: [2.45, 2.05, -3.32],
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (mode === 'FREE_EXPLORE') {
      onInteract('window');
    }
  };

  return (
    <group position={[2.45, 2.05, -3.35]}>
      {/* ================= SOFT FLOOR-TO-CEILING PLEATED LINEN CURTAINS (noel.jpe + christmas.jpe) ================= */}
      {/* Brushed Brass Curtain Rod */}
      <mesh position={[0, 0.96, 0.14]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, 2.92, 16]} />
        <meshStandardMaterial color="#C8A25A" metalness={0.82} roughness={0.22} />
      </mesh>
      {[-1.46, 1.46].map((rx, idx) => (
        <mesh key={idx} position={[rx, 0.96, 0.14]}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshStandardMaterial color="#D4AF6A" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}

      {/* Left & Right Pleated Warm Beige Linen Drapes */}
      {[-1.28, 1.28].map((sideX, sIdx) => (
        <group key={sIdx} position={[sideX, -0.52, 0.15]}>
          {[-0.09, -0.03, 0.03, 0.09].map((pleatX, pIdx) => (
            <mesh key={pIdx} position={[pleatX, 0, (pIdx % 2) * 0.02]} castShadow receiveShadow>
              <cylinderGeometry args={[0.038, 0.046, 2.95, 12]} />
              <meshStandardMaterial
                color="#DFD2C0"
                roughness={0.88}
                metalness={0.02}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* ================= OUTER MOULDED WHITE WINDOW FRAME & SILL ================= */}
      <mesh
        position={[0, 0.74, 0.04]}
        castShadow
        receiveShadow
        userData={interactData}
        onClick={handleClick}
      >
        <boxGeometry args={[2.38, 0.09, 0.14]} />
        <meshStandardMaterial
          color={isHovered ? '#FFFDF8' : '#F9F6F0'}
          roughness={0.35}
          emissive={isHovered ? '#E9C879' : '#000000'}
          emissiveIntensity={isHovered ? 0.15 : 0}
        />
      </mesh>
      <mesh
        position={[0, -0.74, 0.07]}
        castShadow
        receiveShadow
        userData={interactData}
        onClick={handleClick}
      >
        <boxGeometry args={[2.52, 0.075, 0.22]} />
        <meshStandardMaterial color="#F9F6F0" roughness={0.32} />
      </mesh>
      <mesh position={[0, -0.79, 0.05]} receiveShadow>
        <boxGeometry args={[2.44, 0.045, 0.16]} />
        <meshStandardMaterial color="#EFE8DC" roughness={0.42} />
      </mesh>

      <mesh
        position={[-1.15, 0, 0.04]}
        castShadow
        userData={interactData}
        onClick={handleClick}
      >
        <boxGeometry args={[0.09, 1.46, 0.14]} />
        <meshStandardMaterial color="#F9F6F0" roughness={0.35} />
      </mesh>
      <mesh
        position={[1.15, 0, 0.04]}
        castShadow
        userData={interactData}
        onClick={handleClick}
      >
        <boxGeometry args={[0.09, 1.46, 0.14]} />
        <meshStandardMaterial color="#F9F6F0" roughness={0.35} />
      </mesh>

      {/* Inner Sliding Sash Frames */}
      {[-0.55, 0.55].map((px, idx) => (
        <group key={idx} position={[px, 0, 0.03 + idx * 0.015]}>
          <mesh position={[0, 0.66, 0]}>
            <boxGeometry args={[1.12, 0.06, 0.045]} />
            <meshStandardMaterial color="#F6F3EC" roughness={0.38} />
          </mesh>
          <mesh position={[0, -0.66, 0]}>
            <boxGeometry args={[1.12, 0.06, 0.045]} />
            <meshStandardMaterial color="#F6F3EC" roughness={0.38} />
          </mesh>
          <mesh position={[-0.53, 0, 0]}>
            <boxGeometry args={[0.06, 1.36, 0.045]} />
            <meshStandardMaterial color="#F6F3EC" roughness={0.38} />
          </mesh>
          <mesh position={[0.53, 0, 0]}>
            <boxGeometry args={[0.06, 1.36, 0.045]} />
            <meshStandardMaterial color="#F6F3EC" roughness={0.38} />
          </mesh>

          {/* Soft Blue-Tinted Window Glass Pane */}
          <mesh userData={interactData} onClick={handleClick}>
            <planeGeometry args={[1.02, 1.28]} />
            <meshPhysicalMaterial
              color={windowEveningMode ? '#8CAEC4' : '#D5E8F2'}
              transparent
              opacity={0.24}
              roughness={0.06}
              metalness={0.12}
              transmission={0.78}
              reflectivity={0.65}
            />
          </mesh>
        </group>
      ))}

      {/* ================= EXTERIOR WINTER FOREST DIORAMA OUTSIDE WINDOW ================= */}
      <group position={[0, -0.2, -0.8]}>
        <mesh position={[0, 0.4, -2.1]}>
          <planeGeometry args={[6.4, 4.4]} />
          <meshBasicMaterial
            color={windowEveningMode ? '#1C2B42' : '#CEDCE2'}
          />
        </mesh>

        <mesh position={[-0.8, -0.95, -1.6]} rotation={[0, 0, -0.05]}>
          <boxGeometry args={[5.5, 0.85, 0.6]} />
          <meshStandardMaterial
            color={windowEveningMode ? '#6C7D8C' : '#EBF0F2'}
            roughness={0.9}
          />
        </mesh>

        {[
          [-1.35, -0.75, -0.65, 1.18],
          [-0.55, -0.68, -0.95, 1.38],
          [0.15, -0.82, -0.75, 1.08],
          [0.85, -0.7, -1.05, 1.32],
          [1.5, -0.75, -0.7, 1.12],
        ].map(([tx, ty, tz, s], idx) => (
          <group key={idx} position={[tx, ty, tz]} scale={[s, s, s]}>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.06, 0.08, 0.45, 8]} />
              <meshStandardMaterial color="#4D3B2C" roughness={0.9} />
            </mesh>
            {[0, 0.34, 0.66, 0.94].map((ly, li) => (
              <group key={li} position={[0, 0.42 + ly, 0]}>
                <mesh>
                  <coneGeometry args={[0.48 - li * 0.08, 0.52, 12]} />
                  <meshStandardMaterial
                    color={windowEveningMode ? '#283F31' : '#4C644A'}
                    roughness={0.85}
                  />
                </mesh>
                <mesh position={[0, 0.04, 0]}>
                  <coneGeometry args={[0.44 - li * 0.08, 0.44, 12]} />
                  <meshStandardMaterial
                    color={windowEveningMode ? '#A4B8C9' : '#E6ECEB'}
                    roughness={0.88}
                  />
                </mesh>
              </group>
            ))}
          </group>
        ))}

        {/* Falling 3D Snowflakes Outside Window */}
        <points ref={snowRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={snowPositions.length / 3}
              array={snowPositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#FFFFFF"
            size={0.042}
            transparent
            opacity={0.88}
          />
        </points>
      </group>

      {/* Natural Window Daylight Streaming into Room */}
      <directionalLight
        position={[1.8, 1.6, -2.5]}
        intensity={windowEveningMode ? 0.38 : 1.25}
        color={windowEveningMode ? '#9AB8D9' : '#FFF7E8'}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
    </group>
  );
}
