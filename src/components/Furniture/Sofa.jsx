import React, { useMemo } from 'react';
import {
  getGeometricRugTexture,
  getKnitTexture,
} from '../../assets/textures/proceduralTextures';

export default function Sofa({
  hoveredObject,
  isGuidedHighlighted,
  isSittingOnSofa,
  mode,
  onInteract,
}) {
  const rugTex = useMemo(() => getGeometricRugTexture(), []);
  const knitTex = useMemo(() => getKnitTexture(), []);

  const isHovered = hoveredObject?.id === 'sofa';

  const interactData = {
    interactable: true,
    id: 'sofa',
    name: 'Sofa Kem Bắc Âu',
    actionLabel: isSittingOnSofa ? 'Đứng Dậy' : 'Ngồi Thư Giãn Trên Sofa',
    area: 'Khu vực Sofa',
    position: [-1.35, 0.65, 1.9],
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (mode === 'FREE_EXPLORE') {
      onInteract('sofa');
    }
  };

  const fabricColor =
    isHovered || isGuidedHighlighted ? '#FAF5EC' : '#EFE7DA';
  const emissiveColor =
    isHovered || isGuidedHighlighted ? '#E9C879' : '#000000';
  const emissiveIntensity = isHovered ? 0.14 : isGuidedHighlighted ? 0.08 : 0;

  return (
    <group>
      {/* ================= GEOMETRIC BEIGE & TAUPE AREA RUG ================= */}
      <mesh
        position={[-1.25, 0.008, 0.62]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[3.55, 2.25]} />
        <meshStandardMaterial
          map={rugTex}
          roughness={0.88}
          metalness={0.02}
        />
      </mesh>

      {/* ================= ELEGANT BRASS ARC FLOOR LAMP BESIDE SOFA (christmas.jpe) ================= */}
      <group position={[-2.95, 0, 2.15]} rotation={[0, -0.55, 0]}>
        {/* Marble Base */}
        <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.17, 0.19, 0.08, 24]} />
          <meshStandardMaterial color="#E6DDD0" roughness={0.3} />
        </mesh>
        {/* Vertical Stem */}
        <mesh position={[0, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.018, 1.85, 12]} />
          <meshStandardMaterial color="#C8A25A" metalness={0.88} roughness={0.18} />
        </mesh>
        {/* Curved Arc Arm */}
        <mesh position={[0.38, 1.88, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <torusGeometry args={[0.38, 0.013, 10, 24, Math.PI]} />
          <meshStandardMaterial color="#C8A25A" metalness={0.88} roughness={0.18} />
        </mesh>
        {/* Brushed Brass Dome Shade */}
        <mesh position={[0.76, 1.76, 0]} castShadow>
          <sphereGeometry args={[0.16, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial
            color="#D4AF6A"
            metalness={0.86}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0.76, 1.7, 0]}>
          <sphereGeometry args={[0.055, 14, 14]} />
          <meshBasicMaterial color="#FFE7A8" />
        </mesh>
        <pointLight
          position={[0.76, 1.62, 0]}
          color="#FFC87A"
          intensity={0.25}
          distance={3.2}
          decay={2}
        />
      </group>

      {/* ================= 3-SEATER CREAM SCANDINAVIAN SOFA ================= */}
      <group
        position={[-1.35, 0, 1.92]}
        userData={interactData}
        onClick={handleClick}
      >
        {/* Dark Walnut Wooden Block Legs */}
        {[
          [-1.12, 0.06, -0.38],
          [1.12, 0.06, -0.38],
          [-1.12, 0.06, 0.38],
          [1.12, 0.06, 0.38],
        ].map(([lx, ly, lz], idx) => (
          <mesh key={idx} position={[lx, ly, lz]} castShadow>
            <cylinderGeometry args={[0.038, 0.03, 0.12, 12]} />
            <meshStandardMaterial color="#3A281B" roughness={0.65} />
          </mesh>
        ))}

        {/* Lower Sofa Frame Deck */}
        <mesh
          position={[0, 0.21, 0]}
          castShadow
          receiveShadow
          userData={interactData}
          onClick={handleClick}
        >
          <boxGeometry args={[2.32, 0.2, 0.94]} />
          <meshStandardMaterial
            color={fabricColor}
            roughness={0.78}
            emissive={emissiveColor}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>

        {/* Rear Upholstered Backboard */}
        <mesh
          position={[0, 0.52, 0.39]}
          castShadow
          receiveShadow
          userData={interactData}
          onClick={handleClick}
        >
          <boxGeometry args={[2.32, 0.56, 0.18]} />
          <meshStandardMaterial
            color={fabricColor}
            roughness={0.78}
            emissive={emissiveColor}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>

        {/* Rounded Left & Right Armrests */}
        {[-1.16, 1.16].map((ax, idx) => (
          <group key={idx} position={[ax, 0.42, 0.02]}>
            <mesh
              castShadow
              receiveShadow
              userData={interactData}
              onClick={handleClick}
            >
              <boxGeometry args={[0.24, 0.44, 0.92]} />
              <meshStandardMaterial
                color={fabricColor}
                roughness={0.78}
                emissive={emissiveColor}
                emissiveIntensity={emissiveIntensity}
              />
            </mesh>
            <mesh
              position={[0, 0.22, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
              receiveShadow
              userData={interactData}
              onClick={handleClick}
            >
              <cylinderGeometry args={[0.12, 0.12, 0.92, 18]} />
              <meshStandardMaterial
                color={fabricColor}
                roughness={0.78}
                emissive={emissiveColor}
                emissiveIntensity={emissiveIntensity}
              />
            </mesh>
          </group>
        ))}

        {/* 3 Plush Seat Cushions */}
        {[-0.68, 0, 0.68].map((cx, idx) => (
          <mesh
            key={idx}
            position={[cx, 0.36, -0.05]}
            castShadow
            receiveShadow
            userData={interactData}
            onClick={handleClick}
          >
            <boxGeometry args={[0.66, 0.15, 0.78]} />
            <meshStandardMaterial
              color={fabricColor}
              roughness={0.8}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        ))}

        {/* 3 Angled Backrest Cushions */}
        {[-0.68, 0, 0.68].map((cx, idx) => (
          <mesh
            key={idx}
            position={[cx, 0.68, 0.24]}
            rotation={[0.12, 0, 0]}
            castShadow
            receiveShadow
            userData={interactData}
            onClick={handleClick}
          >
            <boxGeometry args={[0.65, 0.42, 0.18]} />
            <meshStandardMaterial
              color="#F5EFE6"
              roughness={0.76}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        ))}

        {/* Cream & Warm Taupe Accent Throw Pillows (noel_demo.png + this year.jpe) */}
        <mesh
          position={[0.88, 0.58, 0.04]}
          rotation={[0.25, -0.45, 0.2]}
          castShadow
          userData={interactData}
          onClick={handleClick}
        >
          <boxGeometry args={[0.38, 0.36, 0.12]} />
          <meshStandardMaterial color="#FAF7F2" roughness={0.72} />
        </mesh>
        <mesh
          position={[-0.86, 0.57, 0.05]}
          rotation={[0.2, 0.38, -0.15]}
          castShadow
          userData={interactData}
          onClick={handleClick}
        >
          <boxGeometry args={[0.36, 0.34, 0.11]} />
          <meshStandardMaterial color="#C8B49B" roughness={0.78} />
        </mesh>

        {/* Chunky Knit Grey-Taupe Throw Blanket Draped Over Backrest */}
        <group position={[0.68, 0, 0]}>
          <mesh
            position={[0, 0.82, 0.36]}
            rotation={[0.15, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.48, 0.12, 0.28]} />
            <meshStandardMaterial
              map={knitTex}
              color="#9B8D80"
              roughness={0.92}
            />
          </mesh>
          <mesh
            position={[0.02, 0.44, 0.49]}
            rotation={[-0.04, 0, 0.03]}
            castShadow
          >
            <boxGeometry args={[0.46, 0.72, 0.045]} />
            <meshStandardMaterial
              map={knitTex}
              color="#9B8D80"
              roughness={0.92}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
