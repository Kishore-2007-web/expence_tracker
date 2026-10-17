const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4);
  data.copy(buf, 8);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function generateIconPNG(size, isMaskable = false) {
  const width = size;
  const height = size;
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height / 2;
  const cornerRadius = isMaskable ? 0 : width * 0.22;
  const bgPadding = isMaskable ? 0 : width * 0.05;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Check rounded rectangle bounds
      let inShape = false;
      if (isMaskable) {
        inShape = true;
      } else {
        const minX = bgPadding;
        const maxX = width - bgPadding;
        const minY = bgPadding;
        const maxY = height - bgPadding;

        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
          const cornerX = x < minX + cornerRadius ? minX + cornerRadius : (x > maxX - cornerRadius ? maxX - cornerRadius : x);
          const cornerY = y < minY + cornerRadius ? minY + cornerRadius : (y > maxY - cornerRadius ? maxY - cornerRadius : y);
          const dx = x - cornerX;
          const dy = y - cornerY;
          if (dx * dx + dy * dy <= cornerRadius * cornerRadius) {
            inShape = true;
          }
        }
      }

      if (!inShape) {
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0; // Transparent
        continue;
      }

      // Background gradient: dark sleek theme with Pantone Aquatic Green (#96DFCE) and Sunshine Yellow (#FADE85)
      const gradT = (x + y) / (width + height);
      let r = Math.round(11 + gradT * (15 - 11));
      let g = Math.round(15 + gradT * (23 - 15));
      let b = Math.round(23 + gradT * (42 - 23));

      // Draw stylized 'M' logo in center
      // Normalize coords to [-1, 1] within icon box
      const nx = (x - cx) / (width * 0.38);
      const ny = (y - cy) / (height * 0.38);

      let isLogoPixel = false;
      let logoGlow = false;

      // Outer glowing border inside card
      if (!isMaskable) {
        const borderDist = Math.abs(Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) - width * 0.42);
        if (borderDist < 2) {
          r = Math.min(255, r + 40);
          g = Math.min(255, g + 80);
          b = Math.min(255, b + 60);
        }
      }

      // 'M' geometry: four thick stems / strokes
      // Stem 1: left vertical stroke nx in [-0.75, -0.45], ny in [-0.7, 0.7]
      // Stem 2: right vertical stroke nx in [0.45, 0.75], ny in [-0.7, 0.7]
      // Diagonal 1: from (-0.55, -0.6) to (0, 0.25)
      // Diagonal 2: from (0, 0.25) to (0.55, -0.6)
      const inLeftStem = nx >= -0.72 && nx <= -0.42 && ny >= -0.7 && ny <= 0.7;
      const inRightStem = nx >= 0.42 && nx <= 0.72 && ny >= -0.7 && ny <= 0.7;

      // Diagonals:
      const d1Dist = Math.abs((ny - 0.25) - ((0.25 - (-0.6)) / (0 - (-0.55))) * (nx - 0));
      const inDiag1 = nx >= -0.55 && nx <= 0.05 && ny >= -0.65 && ny <= 0.35 && d1Dist < 0.22;

      const d2Dist = Math.abs((ny - 0.25) - ((0.25 - (-0.6)) / (0 - 0.55)) * (nx - 0));
      const inDiag2 = nx >= -0.05 && nx <= 0.55 && ny >= -0.65 && ny <= 0.35 && d2Dist < 0.22;

      if (inLeftStem || inRightStem || inDiag1 || inDiag2) {
        isLogoPixel = true;
      } else {
        // Subtle glow around logo
        if ((inLeftStem || inRightStem || inDiag1 || inDiag2) || (Math.abs(nx) < 0.85 && Math.abs(ny) < 0.8)) {
          const centerDist = Math.sqrt(nx * nx + ny * ny);
          if (centerDist < 0.9) {
            logoGlow = true;
          }
        }
      }

      if (isLogoPixel) {
        // Gradient from Pantone Aquatic Green (#96DFCE) to Pantone Sunshine Yellow (#FADE85)
        const logoGrad = (ny + 0.7) / 1.4;
        r = Math.round(150 + logoGrad * (250 - 150));
        g = Math.round(223 - logoGrad * (223 - 222));
        b = Math.round(206 - logoGrad * (206 - 133));
      } else if (logoGlow) {
        // Aquatic Green ambient glow behind logo
        r = Math.min(255, r + 25);
        g = Math.min(255, g + 50);
        b = Math.min(255, b + 45);
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = 255;
    }
  }

  // PNG Header
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Ensure public/icons directory exists
const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

// Generate icons
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), generateIconPNG(192, false));
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), generateIconPNG(512, false));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-192x192.png'), generateIconPNG(192, true));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.png'), generateIconPNG(512, true));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), generateIconPNG(180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generateIconPNG(48, false));

// Generate SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#060e0c"/>
      <stop offset="100%" stop-color="#0e1f1b"/>
    </linearGradient>
    <linearGradient id="mGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#96DFCE"/>
      <stop offset="70%" stop-color="#96DFCE"/>
      <stop offset="100%" stop-color="#FADE85"/>
    </linearGradient>
    <filter id="aquaticGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  <rect x="24" y="24" width="464" height="464" rx="96" fill="none" stroke="#96DFCE" stroke-width="3" stroke-opacity="0.35"/>
  <!-- Stylized M Emblem with Pantone Aquatic Green + Sunshine Yellow -->
  <path d="M128 384 V160 H180 L256 276 L332 160 H384 V384 H328 V240 L268 332 H244 L184 240 V384 Z" 
        fill="url(#mGrad)" 
        filter="url(#aquaticGlow)"/>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

console.log('Successfully generated all PWA icons!');
