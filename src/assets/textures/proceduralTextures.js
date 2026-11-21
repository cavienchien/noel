import * as THREE from 'three';

const cache = {};

// 1. Winter Landscape Painting Texture (matching reference image above fireplace)
export function getWinterPaintingTexture() {
  if (cache.winterPainting) return cache.winterPainting;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  // Warm winter sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 460);
  skyGrad.addColorStop(0, '#D4C5B4');
  skyGrad.addColorStop(0.55, '#E8DACB');
  skyGrad.addColorStop(1, '#F5EBE0');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 1024, 768);

  // Soft distant misty mountains
  ctx.fillStyle = '#C9BCB0';
  ctx.beginPath();
  ctx.moveTo(0, 440);
  ctx.quadraticCurveTo(220, 330, 450, 410);
  ctx.quadraticCurveTo(720, 310, 1024, 420);
  ctx.lineTo(1024, 520);
  ctx.lineTo(0, 520);
  ctx.closePath();
  ctx.fill();

  // Midground snowy hills
  const snowGrad = ctx.createLinearGradient(0, 420, 0, 768);
  snowGrad.addColorStop(0, '#EFEAE4');
  snowGrad.addColorStop(0.5, '#E4DDD5');
  snowGrad.addColorStop(1, '#D5CBC0');
  ctx.fillStyle = snowGrad;
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.quadraticCurveTo(320, 430, 620, 475);
  ctx.quadraticCurveTo(850, 450, 1024, 490);
  ctx.lineTo(1024, 768);
  ctx.lineTo(0, 768);
  ctx.closePath();
  ctx.fill();

  // Cozy Wooden Cabin in center-right
  const cx = 440;
  const cy = 370;
  ctx.fillStyle = '#6E503B';
  ctx.fillRect(cx, cy, 240, 125);

  ctx.fillStyle = '#5D4230';
  ctx.beginPath();
  ctx.moveTo(cx + 120, cy - 68);
  ctx.lineTo(cx + 250, cy + 12);
  ctx.lineTo(cx - 10, cy + 12);
  ctx.closePath();
  ctx.fill();

  // Snowy roof layers
  ctx.fillStyle = '#F7F4F0';
  ctx.beginPath();
  ctx.moveTo(cx + 120, cy - 78);
  ctx.lineTo(cx + 265, cy + 14);
  ctx.lineTo(cx + 245, cy + 24);
  ctx.lineTo(cx + 120, cy - 55);
  ctx.lineTo(cx - 5, cy + 24);
  ctx.lineTo(cx - 22, cy + 14);
  ctx.closePath();
  ctx.fill();

  // Side wing of cabin
  ctx.fillStyle = '#7A5B43';
  ctx.fillRect(cx - 75, cy + 28, 85, 95);
  ctx.fillStyle = '#F7F4F0';
  ctx.beginPath();
  ctx.moveTo(cx - 88, cy + 32);
  ctx.lineTo(cx + 15, cy - 15);
  ctx.lineTo(cx + 22, cy);
  ctx.lineTo(cx - 82, cy + 44);
  ctx.closePath();
  ctx.fill();

  // Warm glowing cabin windows
  ctx.fillStyle = '#F5C469';
  ctx.shadowColor = '#F5B041';
  ctx.shadowBlur = 18;
  ctx.fillRect(cx + 45, cy + 32, 34, 40);
  ctx.fillRect(cx + 155, cy + 32, 34, 40);
  ctx.fillRect(cx + 104, cy - 22, 28, 28);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = '#4A3323';
  ctx.lineWidth = 3;
  [cx + 45, cx + 155].forEach((wx) => {
    ctx.strokeRect(wx, cy + 32, 34, 40);
    ctx.beginPath();
    ctx.moveTo(wx + 17, cy + 32);
    ctx.lineTo(wx + 17, cy + 72);
    ctx.moveTo(wx, cy + 52);
    ctx.lineTo(wx + 34, cy + 52);
    ctx.stroke();
  });

  // Tall snow-dusted Pine Trees
  const drawPine = (px, py, scale) => {
    ctx.fillStyle = '#3B322C';
    ctx.fillRect(px - 6 * scale, py, 12 * scale, 45 * scale);
    for (let i = 0; i < 7; i++) {
      const y = py - i * 32 * scale;
      const w = (78 - i * 9) * scale;
      ctx.fillStyle = '#383833';
      ctx.beginPath();
      ctx.moveTo(px, y - 48 * scale);
      ctx.lineTo(px + w, y + 8 * scale);
      ctx.lineTo(px - w, y + 8 * scale);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(248, 245, 240, 0.78)';
      ctx.beginPath();
      ctx.moveTo(px, y - 44 * scale);
      ctx.lineTo(px + w * 0.75, y - 4 * scale);
      ctx.lineTo(px - w * 0.75, y - 4 * scale);
      ctx.closePath();
      ctx.fill();
    }
  };

  drawPine(830, 475, 1.35);
  drawPine(930, 495, 1.1);
  drawPine(745, 480, 0.85);
  drawPine(285, 455, 0.72);

  // Bare winter birch branches on left
  ctx.strokeStyle = '#4A3E37';
  ctx.lineCap = 'round';
  const drawBranch = (x, y, len, angle, depth) => {
    if (depth <= 0) return;
    const nx = x + Math.cos(angle) * len;
    const ny = y + Math.sin(angle) * len;
    ctx.lineWidth = depth * 1.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(nx, ny);
    ctx.stroke();
    drawBranch(nx, ny, len * 0.74, angle - 0.34, depth - 1);
    drawBranch(nx, ny, len * 0.72, angle + 0.28, depth - 1);
  };
  drawBranch(145, 510, 95, -Math.PI / 2 + 0.08, 6);
  drawBranch(75, 535, 80, -Math.PI / 2 - 0.05, 5);

  // Foreground snow path
  ctx.strokeStyle = '#C5B8AA';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(260, 750);
  ctx.quadraticCurveTo(450, 600, 540, 500);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  cache.winterPainting = tex;
  return tex;
}

// 2. Geometric Scandinavian Rug Texture
export function getGeometricRugTexture() {
  if (cache.rug) return cache.rug;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 680;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#DFD3C3';
  ctx.fillRect(0, 0, 1024, 680);

  ctx.fillStyle = '#B8A38E';
  ctx.beginPath();
  ctx.arc(0, 340, 340, -Math.PI / 2, Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#9E8872';
  ctx.beginPath();
  ctx.arc(1024, 340, 380, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#C9B7A3';
  ctx.beginPath();
  ctx.moveTo(340, 0);
  ctx.lineTo(680, 0);
  ctx.lineTo(512, 340);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#A8927B';
  ctx.beginPath();
  ctx.moveTo(300, 680);
  ctx.lineTo(740, 680);
  ctx.lineTo(512, 340);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#E8DDD0';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(0, 340, 235, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(1024, 340, 260, Math.PI / 2, -Math.PI / 2);
  ctx.stroke();

  for (let i = 0; i < 42000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 680;
    ctx.fillStyle =
      Math.random() > 0.5
        ? 'rgba(255, 250, 242, 0.12)'
        : 'rgba(95, 75, 58, 0.1)';
    ctx.fillRect(x, y, 3, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  cache.rug = tex;
  return tex;
}

// 3. Natural Light Oak Wood Texture
export function getOakWoodTexture() {
  if (cache.oak) return cache.oak;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#C9A477';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 450; i++) {
    const y = (i / 450) * 512;
    ctx.fillStyle =
      i % 2 === 0
        ? 'rgba(155, 112, 66, 0.16)'
        : 'rgba(238, 212, 178, 0.14)';
    ctx.fillRect(0, y, 512, 2 + Math.random() * 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  cache.oak = tex;
  return tex;
}

// 4. Rustic Dark Oak Ceiling Beam Texture (inspired by ong.jpe)
export function getRusticBeamTexture() {
  if (cache.beam) return cache.beam;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#7C5D41';
  ctx.fillRect(0, 0, 512, 256);

  for (let i = 0; i < 240; i++) {
    const y = Math.random() * 256;
    ctx.fillStyle =
      i % 2 === 0 ? 'rgba(58, 40, 26, 0.25)' : 'rgba(165, 132, 98, 0.18)';
    ctx.fillRect(0, y, 512, 1 + Math.random() * 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 1);
  tex.needsUpdate = true;
  cache.beam = tex;
  return tex;
}

// 5. Soft Venetian Plaster / Limewash Wall Texture (inspired by merry.jpe)
export function getPlasterWallTexture() {
  if (cache.plaster) return cache.plaster;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#F3ECE1';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 180; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 30 + Math.random() * 70;
    const grad = ctx.createRadialGradient(x, y, 4, x, y, r);
    const warm = Math.random() > 0.5;
    grad.addColorStop(
      0,
      warm ? 'rgba(255, 252, 245, 0.16)' : 'rgba(216, 203, 185, 0.14)'
    );
    grad.addColorStop(1, 'rgba(243, 236, 225, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.needsUpdate = true;
  cache.plaster = tex;
  return tex;
}

// 6. White Shiplap Horizontal Wall Plank Texture for Chimney Breast (inspired by ong.jpe)
export function getShiplapTexture() {
  if (cache.shiplap) return cache.shiplap;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#F5EFE6';
  ctx.fillRect(0, 0, 512, 512);

  const planks = 12;
  const h = 512 / planks;
  for (let i = 0; i < planks; i++) {
    const y = i * h;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,253,249,0.25)' : 'rgba(225,215,200,0.12)';
    ctx.fillRect(0, y, 512, h - 2);
    ctx.fillStyle = 'rgba(165, 150, 132, 0.35)';
    ctx.fillRect(0, y + h - 2, 512, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 2);
  tex.needsUpdate = true;
  cache.shiplap = tex;
  return tex;
}

// 7. White Brick Fireplace Surround Texture (inspired by noel.jpe & ong.jpe)
export function getWhiteBrickTexture() {
  if (cache.whiteBrick) return cache.whiteBrick;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#DFD5C7';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 12;
  const cols = 4;
  const bh = 512 / rows;
  const bw = 512 / cols;

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (bw / 2);
    for (let c = -1; c <= cols; c++) {
      const x = c * bw + offset;
      const y = r * bh;
      ctx.fillStyle = (r + c) % 3 === 0 ? '#F4EEE4' : '#EFE8DC';
      ctx.fillRect(x + 3, y + 3, bw - 6, bh - 6);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.5, 1.5);
  tex.needsUpdate = true;
  cache.whiteBrick = tex;
  return tex;
}

// 8. Large Format Cream Porcelain Floor Tile Texture
export function getFloorTileTexture() {
  if (cache.floor) return cache.floor;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#F2ECE1';
  ctx.fillRect(0, 0, 512, 512);

  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 360);
  grad.addColorStop(0, 'rgba(255, 252, 247, 0.38)');
  grad.addColorStop(1, 'rgba(225, 214, 198, 0.22)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#DFD5C6';
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, 509, 509);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 5);
  tex.needsUpdate = true;
  cache.floor = tex;
  return tex;
}

// 9. Cozy Chunky Knit Blanket Texture
export function getKnitTexture() {
  if (cache.knit) return cache.knit;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#8C7D70';
  ctx.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y += 12) {
    for (let x = 0; x < 256; x += 16) {
      ctx.strokeStyle = 'rgba(225, 215, 205, 0.28)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 8, y + 8);
      ctx.lineTo(x + 16, y);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(65, 55, 48, 0.3)';
      ctx.beginPath();
      ctx.moveTo(x, y + 5);
      ctx.lineTo(x + 8, y + 12);
      ctx.lineTo(x + 16, y + 5);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 4);
  tex.needsUpdate = true;
  cache.knit = tex;
  return tex;
}

// 10. Festive Gift Wrapping Paper Textures (inspired by noel.jpe & merry.jpe)
export function getGiftWrapTexture(style = 'stripes') {
  const key = `gift_${style}`;
  if (cache[key]) return cache[key];

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (style === 'stripes') {
    ctx.fillStyle = '#F7F1E8';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#A62424';
    for (let x = 0; x < 256; x += 32) {
      ctx.fillRect(x, 0, 14, 256);
    }
  } else if (style === 'dots') {
    ctx.fillStyle = '#F2E8DC';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#B82929';
    for (let y = 16; y < 256; y += 32) {
      for (let x = 16; x < 256; x += 32) {
        ctx.beginPath();
        ctx.arc(x + ((y / 32) % 2) * 14, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    // Kraft gold-flecked luxury paper
    ctx.fillStyle = '#C9A982';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#F5DF9D';
    for (let i = 0; i < 65; i++) {
      const x = (i * 47) % 256;
      const y = (i * 83) % 256;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  cache[key] = tex;
  return tex;
}
