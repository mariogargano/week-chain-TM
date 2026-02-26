import sharp from 'sharp';
import { writeFileSync } from 'fs';

// Generate 32x32 PNG icon from the logo
await sharp('public/logo-wc.png')
  .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .png()
  .toFile('public/icon.png');

// Generate 180x180 apple touch icon
await sharp('public/logo-wc.png')
  .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .png()
  .toFile('public/apple-touch-icon.png');

// Generate favicon.ico (as 32x32 PNG - browsers accept PNG as favicon)
await sharp('public/logo-wc.png')
  .resize(48, 48, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .png()
  .toFile('public/favicon.png');

// Also generate a proper 16x16 for the tab icon
await sharp('public/logo-wc.png')
  .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .png()
  .toFile('public/favicon-16x16.png');

console.log('Generated: icon.png (32x32), apple-touch-icon.png (180x180), favicon.png (48x48), favicon-16x16.png (16x16)');
