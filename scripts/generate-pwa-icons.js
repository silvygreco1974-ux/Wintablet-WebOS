import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Windows 11 style elegant desktop OS logo
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="win1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00a4ef" />
      <stop offset="100%" stop-color="#0078d4" />
    </linearGradient>
    <linearGradient id="win2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22d3ee" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="win3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
    <linearGradient id="win4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0284c7" flood-opacity="0.5"/>
    </filter>
  </defs>
  <!-- Background with squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  
  <!-- Windows 4 Modern Fluent Tiles with Glow -->
  <g filter="url(#glow)">
    <!-- Top-Left tile -->
    <rect x="120" y="120" width="126" height="126" rx="20" fill="url(#win1)" />
    <!-- Top-Right tile -->
    <rect x="266" y="120" width="126" height="126" rx="20" fill="url(#win2)" />
    <!-- Bottom-Left tile -->
    <rect x="120" y="266" width="126" height="126" rx="20" fill="url(#win3)" />
    <!-- Bottom-Right tile -->
    <rect x="266" y="266" width="126" height="126" rx="20" fill="url(#win4)" />
  </g>
  
  <!-- Subtle center tablet dot / badge -->
  <circle cx="256" cy="256" r="14" fill="#ffffff" opacity="0.9" />
</svg>`;

// Maskable icon with 15% safe zone margin
const maskableSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="mwin1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00a4ef" />
      <stop offset="100%" stop-color="#0078d4" />
    </linearGradient>
    <linearGradient id="mwin2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22d3ee" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="mwin3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
    <linearGradient id="mwin4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
  </defs>
  <!-- Full bleed background for maskable -->
  <rect width="512" height="512" fill="url(#bgMask)"/>
  
  <!-- Central tiles scaled down into safe zone (80% diameter) -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <rect x="120" y="120" width="126" height="126" rx="20" fill="url(#mwin1)" />
    <rect x="266" y="120" width="126" height="126" rx="20" fill="url(#mwin2)" />
    <rect x="120" y="266" width="126" height="126" rx="20" fill="url(#mwin3)" />
    <rect x="266" y="266" width="126" height="126" rx="20" fill="url(#mwin4)" />
    <circle cx="256" cy="256" r="14" fill="#ffffff" opacity="0.9" />
  </g>
</svg>`;

async function generate() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
  console.log('Saved public/icon.svg');

  const svgBuffer = Buffer.from(svgContent);
  const maskableSvgBuffer = Buffer.from(maskableSvgContent);

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Saved public/pwa-192x192.png');

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Saved public/pwa-512x512.png');

  await sharp(maskableSvgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Saved public/pwa-maskable-512x512.png');

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Saved public/apple-touch-icon.png');

  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Saved public/favicon.ico');
}

generate().catch(console.error);
