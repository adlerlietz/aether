const fs = require('fs');

// Simple SVG icon template
const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${Math.floor(size * 0.25)}" fill="#00f5ff"/>
  <text x="${size/2}" y="${size * 0.7}" font-family="system-ui, -apple-system, sans-serif" font-size="${size * 0.55}" font-weight="bold" text-anchor="middle" fill="#0a0a0a">Æ</text>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const svg = createSVG(size);
  fs.writeFileSync(`icon-${size}x${size}.svg`, svg);
  console.log(`Created icon-${size}x${size}.svg`);
});

console.log('Done! Convert these to PNG for production.');
