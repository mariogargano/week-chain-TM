import sharp from 'sharp';

const logo = 'public/logo-wc.png';

await sharp(logo)
  .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
  .png()
  .toFile('public/icon.png');

await sharp(logo)
  .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
  .png()
  .toFile('public/apple-touch-icon.png');

await sharp(logo)
  .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
  .png()
  .toFile('public/favicon.png');

await sharp(logo)
  .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
  .png()
  .toFile('public/favicon-16x16.png');

console.log('Generated all favicons from official logo');
