import React, { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import {
  getPlasterWallTexture,
  getShiplapTexture,
  getRusticBeamTexture,
  getOakWoodTexture,
} from '../../assets/textures/proceduralTextures';

function WallPhotoFrame({
  position,
  rotation,
  width = 0.76,
  height = 0.94,
  oakTex,
  photoTex,
  photoIndex = 0,
  mode,
  onInteract,
  hasPictureLight = false,
}) {
  const frameDepth = 0.042;
  const border = 0.055;
  const matWidth = width - border * 2;
  const matHeight = height - border * 2;
  const photoWidth = matWidth - 0.11;
  const photoHeight = matHeight - 0.11;

  const frameInteract = {
    interactable: true,
    id: `photo:${photoIndex}`,
    name: 'Khung Ảnh Kỷ Niệm',
    actionLabel: 'Phóng To Xem Ảnh',
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (mode === 'FREE_EXPLORE' && onInteract) {
      onInteract(`photo:${photoIndex}`);
    }
  };

  return (
    <group
      position={position}
      rotation={rotation}
      userData={frameInteract}
      onClick={handleClick}
    >
      {/* Warm Oak Outer Frame Box */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, frameDepth]} />
        <meshStandardMaterial
          map={oakTex}
          color="#C9A26E"
          roughness={0.38}
          metalness={0.18}
        />
      </mesh>

      {/* Thin Brushed Brass Inner Fillet Trim */}
      <mesh position={[0, 0, frameDepth * 0.5 + 0.001]}>
        <planeGeometry args={[matWidth + 0.018, matHeight + 0.018]} />
        <meshStandardMaterial
          color="#D4AF6A"
          metalness={0.82}
          roughness={0.22}
        />
      </mesh>

      {/* Cream Passe-Partout Mat Board */}
      <mesh position={[0, 0, frameDepth * 0.5 + 0.002]}>
        <planeGeometry args={[matWidth, matHeight]} />
        <meshStandardMaterial color="#F9F6F0" roughness={0.62} />
      </mesh>

      {/* Recessed Inner Gold Bevel Line around Photo Slot */}
      <mesh position={[0, 0, frameDepth * 0.5 + 0.003]}>
        <planeGeometry args={[photoWidth + 0.012, photoHeight + 0.012]} />
        <meshStandardMaterial
          color="#C8A25A"
          metalness={0.65}
          roughness={0.3}
        />
      </mesh>

      {/* Real Chibi Memory Artwork inside Wall Gallery Frame */}
      <mesh position={[0, 0, frameDepth * 0.5 + 0.004]}>
        <planeGeometry args={[photoWidth, photoHeight]} />
        {photoTex ? (
          <meshBasicMaterial map={photoTex} />
        ) : (
          <meshStandardMaterial color="#E6D8C5" roughness={0.55} />
        )}
      </mesh>

      {/* Optional Brushed Brass Gallery Picture Light Above Frame (no extra GPU pointLight) */}
      {hasPictureLight && (
        <group position={[0, height * 0.5 + 0.09, 0.04]}>
          <mesh position={[0, 0.015, -0.02]}>
            <boxGeometry args={[0.14, 0.04, 0.035]} />
            <meshStandardMaterial
              color="#D4AF6A"
              metalness={0.88}
              roughness={0.18}
            />
          </mesh>
          <mesh position={[0, 0, 0.055]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.015, 0.015, width * 0.52, 12]} />
            <meshStandardMaterial
              color="#D4AF6A"
              metalness={0.88}
              roughness={0.18}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function Walls({ mode, onInteract }) {
  const plasterTex = useMemo(() => getPlasterWallTexture(), []);
  const shiplapTex = useMemo(() => getShiplapTexture(), []);
  const beamTex = useMemo(() => getRusticBeamTexture(), []);
  const oakTex = useMemo(() => getOakWoodTexture(), []);
  const wallPhotos = useTexture([
    './memories/chibi-1.jpg',
    './memories/chibi-2.jpg',
    './memories/chibi-3.jpg',
    './memories/chibi-4.jpg',
  ]);

  const wallColor = '#F3ECE1';
  const trimColor = '#F9F6F0';
  const ceilingColor = '#FAF7F2';

  return (
    <group>
      {/* ================= CEILING WITH EXPOSED OAK BEAMS & WARM COVE LIGHT (ong.jpe + christmas.jpe) ================= */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 3.6, 1.0]}
        receiveShadow
      >
        <planeGeometry args={[9.8, 11.4]} />
        <meshStandardMaterial color={ceilingColor} roughness={0.85} />
      </mesh>

      {/* Recessed Architectural Ceiling Cove Frame with Warm Golden LED Strip (christmas.jpe) */}
      <group position={[0, 3.55, 0.1]}>
        {/* Outer Dropped Ceiling Border */}
        <mesh position={[0, 0, -2.9]}>
          <boxGeometry args={[9.4, 0.1, 0.85]} />
          <meshStandardMaterial color="#F7F2E9" roughness={0.78} />
        </mesh>
        <mesh position={[0, 0, 3.05]}>
          <boxGeometry args={[9.4, 0.1, 0.85]} />
          <meshStandardMaterial color="#F7F2E9" roughness={0.78} />
        </mesh>
        <mesh position={[-4.25, 0, 0.08]}>
          <boxGeometry args={[0.9, 0.1, 5.2]} />
          <meshStandardMaterial color="#F7F2E9" roughness={0.78} />
        </mesh>
        <mesh position={[4.25, 0, 0.08]}>
          <boxGeometry args={[0.9, 0.1, 5.2]} />
          <meshStandardMaterial color="#F7F2E9" roughness={0.78} />
        </mesh>

        {/* Warm Golden Recessed Cove LED Glow Strips */}
        <mesh position={[0, -0.02, -2.46]}>
          <boxGeometry args={[7.6, 0.025, 0.03]} />
          <meshBasicMaterial color="#FFE6A8" />
        </mesh>
        <mesh position={[0, -0.02, 2.61]}>
          <boxGeometry args={[7.6, 0.025, 0.03]} />
          <meshBasicMaterial color="#FFE6A8" />
        </mesh>
        <mesh position={[-3.79, -0.02, 0.08]}>
          <boxGeometry args={[0.03, 0.025, 5.1]} />
          <meshBasicMaterial color="#FFE6A8" />
        </mesh>
        <mesh position={[3.79, -0.02, 0.08]}>
          <boxGeometry args={[0.03, 0.025, 5.1]} />
          <meshBasicMaterial color="#FFE6A8" />
        </mesh>
      </group>

      {/* Exposed Rustic Warm Oak Ceiling Beams (inspired by ong.jpe) */}
      {[-2.8, -0.6, 1.6, 3.6].map((bx, idx) => (
        <mesh
          key={idx}
          position={[bx, 3.47, 0.1]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.2, 0.22, 6.85]} />
          <meshStandardMaterial
            map={beamTex}
            color="#9B7752"
            roughness={0.72}
          />
        </mesh>
      ))}

      {/* Recessed Ceiling Downlights */}
      {[
        [-2.2, 3.51, -1.2],
        [1.8, 3.51, -1.2],
        [-2.0, 3.51, 1.5],
        [2.0, 3.51, 1.5],
      ].map(([x, y, z], idx) => (
        <group key={idx} position={[x, y, z]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.1, 0.03, 20]} />
            <meshStandardMaterial color="#E8DDCD" roughness={0.35} />
          </mesh>
          <mesh position={[0, -0.018, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.01, 20]} />
            <meshBasicMaterial color="#FFF3D6" />
          </mesh>
        </group>
      ))}

      {/* ================= NORTH WALL (Back Wall: Z = -3.4) ================= */}
      {/* Left Chimney Breast Bump-Out with Subtle Shiplap Planking (ong.jpe) */}
      <mesh position={[-2.525, 1.8, -3.225]} receiveShadow castShadow>
        <boxGeometry args={[4.55, 3.6, 0.35]} />
        <meshStandardMaterial
          map={shiplapTex}
          color="#F7F1E7"
          roughness={0.72}
        />
      </mesh>

      {/* Chimney Breast Crown & Baseboard Trim */}
      <mesh position={[-2.525, 0.07, -3.035]} receiveShadow>
        <boxGeometry args={[4.56, 0.14, 0.03]} />
        <meshStandardMaterial color={trimColor} roughness={0.45} />
      </mesh>
      <mesh position={[-2.525, 3.52, -3.035]} receiveShadow>
        <boxGeometry args={[4.56, 0.1, 0.05]} />
        <meshStandardMaterial color={trimColor} roughness={0.45} />
      </mesh>

      {/* Subtle Warm Vertical Accent Glow Strip along Chimney Breast Edge (christmas.jpe) */}
      <mesh position={[-0.24, 1.8, -3.2]}>
        <boxGeometry args={[0.02, 3.3, 0.03]} />
        <meshBasicMaterial color="#FFE29E" />
      </mesh>

      {/* Right Back Wall with Venetian Plaster & Window Cutout */}
      <mesh position={[2.275, 0.66, -3.4]} receiveShadow castShadow>
        <boxGeometry args={[5.05, 1.32, 0.18]} />
        <meshStandardMaterial map={plasterTex} color={wallColor} roughness={0.76} />
      </mesh>
      <mesh position={[2.275, 3.19, -3.4]} receiveShadow castShadow>
        <boxGeometry args={[5.05, 0.82, 0.18]} />
        <meshStandardMaterial map={plasterTex} color={wallColor} roughness={0.76} />
      </mesh>
      <mesh position={[0.525, 2.05, -3.4]} receiveShadow castShadow>
        <boxGeometry args={[1.55, 1.46, 0.18]} />
        <meshStandardMaterial map={plasterTex} color={wallColor} roughness={0.76} />
      </mesh>
      <mesh position={[4.2, 2.05, -3.4]} receiveShadow castShadow>
        <boxGeometry args={[1.2, 1.46, 0.18]} />
        <meshStandardMaterial map={plasterTex} color={wallColor} roughness={0.76} />
      </mesh>

      {/* Horizontal Chair-Rail & Baseboard Molding on Right Back Wall */}
      <mesh position={[2.275, 0.07, -3.3]} receiveShadow>
        <boxGeometry args={[5.05, 0.14, 0.03]} />
        <meshStandardMaterial color={trimColor} roughness={0.45} />
      </mesh>
      <mesh position={[2.275, 1.18, -3.3]} receiveShadow>
        <boxGeometry args={[5.05, 0.045, 0.025]} />
        <meshStandardMaterial color={trimColor} roughness={0.45} />
      </mesh>

      {/* Illuminated Evergreen Wall Wreath Mounted on Right Wall Accent (ong.jpe + this year.jpe) */}
      <group position={[4.15, 2.15, -3.28]}>
        <mesh castShadow>
          <torusGeometry args={[0.26, 0.068, 14, 32]} />
          <meshStandardMaterial color="#214630" roughness={0.85} />
        </mesh>
        {[0, 0.78, 1.57, 2.35, 3.14, 3.92, 4.71, 5.5].map((a, i) => (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.26, Math.sin(a) * 0.26, 0.055]}
          >
            <sphereGeometry args={[i % 2 === 0 ? 0.022 : 0.015, 10, 10]} />
            {i % 2 === 0 ? (
              <meshStandardMaterial
                color="#E9C879"
                metalness={0.85}
                roughness={0.18}
              />
            ) : (
              <meshBasicMaterial color="#FFE599" />
            )}
          </mesh>
        ))}
      </group>

      {/* ================= WEST WALL (Left Wall: X = -4.8) ================= */}
      <mesh position={[-4.8, 1.8, 0.1]} receiveShadow castShadow>
        <boxGeometry args={[0.18, 3.6, 7.2]} />
        <meshStandardMaterial map={plasterTex} color={wallColor} roughness={0.76} />
      </mesh>
      <mesh position={[-4.7, 0.07, 0.1]} receiveShadow>
        <boxGeometry args={[0.03, 0.14, 7.0]} />
        <meshStandardMaterial color={trimColor} roughness={0.45} />
      </mesh>

      {/* Warm Brass Wall Sconce on West Wall above Sofa Side (merry.jpe + christmas.jpe) */}
      <group position={[-4.66, 2.05, 1.65]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.028, 0.028, 0.28, 14]} />
          <meshStandardMaterial color="#D4AF6A" metalness={0.88} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.14, 0.05]}>
          <coneGeometry args={[0.11, 0.09, 18]} />
          <meshStandardMaterial color="#C8A054" metalness={0.82} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.09, 0.05]}>
          <sphereGeometry args={[0.032, 12, 12]} />
          <meshBasicMaterial color="#FFE6A3" />
        </mesh>
      </group>

      {/* Gallery Photo Frames on West Wall (Left Wall) */}
      <WallPhotoFrame
        position={[-4.69, 1.94, 0.65]}
        rotation={[0, Math.PI / 2, 0]}
        width={0.72}
        height={0.92}
        oakTex={oakTex}
        photoTex={wallPhotos[0]}
        photoIndex={0}
        mode={mode}
        onInteract={onInteract}
      />
      <WallPhotoFrame
        position={[-4.69, 1.98, -0.35]}
        rotation={[0, Math.PI / 2, 0]}
        width={1.06}
        height={0.82}
        oakTex={oakTex}
        photoTex={wallPhotos[1]}
        photoIndex={1}
        mode={mode}
        onInteract={onInteract}
        hasPictureLight
      />
      <WallPhotoFrame
        position={[-4.69, 1.94, -1.35]}
        rotation={[0, Math.PI / 2, 0]}
        width={0.72}
        height={0.92}
        oakTex={oakTex}
        photoTex={wallPhotos[2]}
        photoIndex={2}
        mode={mode}
        onInteract={onInteract}
      />

      {/* ================= EAST WALL (Right Wall: X = +4.8) ================= */}
      <mesh position={[4.8, 1.8, 0.1]} receiveShadow castShadow>
        <boxGeometry args={[0.18, 3.6, 7.2]} />
        <meshStandardMaterial map={plasterTex} color={wallColor} roughness={0.76} />
      </mesh>
      <mesh position={[4.7, 0.07, 0.1]} receiveShadow>
        <boxGeometry args={[0.03, 0.14, 7.0]} />
        <meshStandardMaterial color={trimColor} roughness={0.45} />
      </mesh>
      <mesh position={[4.7, 1.18, 0.1]} receiveShadow>
        <boxGeometry args={[0.025, 0.045, 7.0]} />
        <meshStandardMaterial color={trimColor} roughness={0.45} />
      </mesh>

      {/* Gallery Photo Frames on East Wall (Right Wall, behind Dining Table) */}
      <WallPhotoFrame
        position={[4.69, 2.0, -0.85]}
        rotation={[0, -Math.PI / 2, 0]}
        width={0.72}
        height={0.92}
        oakTex={oakTex}
        photoTex={wallPhotos[3]}
        photoIndex={3}
        mode={mode}
        onInteract={onInteract}
      />
      <WallPhotoFrame
        position={[4.69, 2.04, 0.15]}
        rotation={[0, -Math.PI / 2, 0]}
        width={1.06}
        height={0.82}
        oakTex={oakTex}
        photoTex={wallPhotos[0]}
        photoIndex={0}
        mode={mode}
        onInteract={onInteract}
        hasPictureLight
      />
      <WallPhotoFrame
        position={[4.69, 2.0, 1.15]}
        rotation={[0, -Math.PI / 2, 0]}
        width={0.72}
        height={0.92}
        oakTex={oakTex}
        photoTex={wallPhotos[2]}
        photoIndex={2}
        mode={mode}
        onInteract={onInteract}
      />

      {/* ================= SOUTH WALL (Front Entrance Wall: Z = +3.6) ================= */}
      <mesh position={[-2.49, 1.8, 3.6]} receiveShadow castShadow>
        <boxGeometry args={[4.62, 3.6, 0.22]} />
        <meshStandardMaterial map={plasterTex} color={wallColor} roughness={0.76} />
      </mesh>
      <mesh position={[2.89, 1.8, 3.6]} receiveShadow castShadow>
        <boxGeometry args={[3.82, 3.6, 0.22]} />
        <meshStandardMaterial map={plasterTex} color={wallColor} roughness={0.76} />
      </mesh>
      <mesh position={[0.4, 2.96, 3.6]} receiveShadow castShadow>
        <boxGeometry args={[1.16, 1.28, 0.22]} />
        <meshStandardMaterial map={plasterTex} color={wallColor} roughness={0.76} />
      </mesh>
      <mesh position={[-2.49, 0.07, 3.48]} receiveShadow>
        <boxGeometry args={[4.6, 0.14, 0.03]} />
        <meshStandardMaterial color={trimColor} roughness={0.45} />
      </mesh>
      <mesh position={[2.89, 0.07, 3.48]} receiveShadow>
        <boxGeometry args={[3.8, 0.14, 0.03]} />
        <meshStandardMaterial color={trimColor} roughness={0.45} />
      </mesh>

      {/* Gallery Photo Frames on South Wall - Left Side of Door */}
      <WallPhotoFrame
        position={[3.75, 1.94, 3.47]}
        rotation={[0, Math.PI, 0]}
        width={0.68}
        height={0.88}
        oakTex={oakTex}
        photoTex={wallPhotos[1]}
        photoIndex={1}
        mode={mode}
        onInteract={onInteract}
      />
      <WallPhotoFrame
        position={[2.85, 1.98, 3.47]}
        rotation={[0, Math.PI, 0]}
        width={0.96}
        height={0.78}
        oakTex={oakTex}
        photoTex={wallPhotos[3]}
        photoIndex={3}
        mode={mode}
        onInteract={onInteract}
        hasPictureLight
      />
      <WallPhotoFrame
        position={[1.95, 1.94, 3.47]}
        rotation={[0, Math.PI, 0]}
        width={0.68}
        height={0.88}
        oakTex={oakTex}
        photoTex={wallPhotos[0]}
        photoIndex={0}
        mode={mode}
        onInteract={onInteract}
      />

      {/* Gallery Photo Frames on South Wall - Right Side of Door (above Sofa) */}
      <WallPhotoFrame
        position={[-0.55, 1.96, 3.47]}
        rotation={[0, Math.PI, 0]}
        width={0.64}
        height={0.84}
        oakTex={oakTex}
        photoTex={wallPhotos[2]}
        photoIndex={2}
        mode={mode}
        onInteract={onInteract}
      />
      <WallPhotoFrame
        position={[-1.35, 2.0, 3.47]}
        rotation={[0, Math.PI, 0]}
        width={0.88}
        height={0.74}
        oakTex={oakTex}
        photoTex={wallPhotos[1]}
        photoIndex={1}
        mode={mode}
        onInteract={onInteract}
        hasPictureLight
      />
      <WallPhotoFrame
        position={[-2.15, 1.96, 3.47]}
        rotation={[0, Math.PI, 0]}
        width={0.64}
        height={0.84}
        oakTex={oakTex}
        photoTex={wallPhotos[3]}
        photoIndex={3}
        mode={mode}
        onInteract={onInteract}
      />

      {/* ================= EXTERIOR FOYER / ENTRANCE HALLWAY (Z = 3.6 to 6.6) ================= */}
      <mesh position={[-1.85, 1.8, 5.1]} receiveShadow>
        <boxGeometry args={[0.18, 3.6, 3.0]} />
        <meshStandardMaterial map={plasterTex} color="#EAE2D6" roughness={0.82} />
      </mesh>
      <mesh position={[2.65, 1.8, 5.1]} receiveShadow>
        <boxGeometry args={[0.18, 3.6, 3.0]} />
        <meshStandardMaterial map={plasterTex} color="#EAE2D6" roughness={0.82} />
      </mesh>
      <mesh position={[0.4, 1.8, 6.6]} receiveShadow>
        <boxGeometry args={[4.68, 3.6, 0.18]} />
        <meshStandardMaterial map={plasterTex} color="#E5DDD0" roughness={0.85} />
      </mesh>

      {/* Warm Exterior Brass Wall Sconce Lights flanking the Main Entrance Door */}
      {[-0.48, 1.28].map((sx, idx) => (
        <group key={idx} position={[sx, 1.82, 3.74]}>
          <mesh castShadow>
            <boxGeometry args={[0.12, 0.28, 0.08]} />
            <meshStandardMaterial color="#3B3530" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <cylinderGeometry args={[0.04, 0.04, 0.18, 12]} />
            <meshBasicMaterial color="#FFE2A8" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
