import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, '..', 'public', 'images', 'wc-logo-new.jpg');
const outputPath = path.join(__dirname, '..', 'public', 'logo.png');

async function processLogo() {
  try {
    // Read the image metadata first
    const metadata = await sharp(inputPath).metadata();
    console.log(`Input image: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

    // Process: remove white/near-white background and make transparent
    // 1. Convert to PNG with alpha channel
    // 2. Use threshold to identify near-white pixels and make them transparent
    const { data, info } = await sharp(inputPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    console.log(`Raw buffer: ${info.width}x${info.height}, channels: ${info.channels}`);

    // Process pixels - make near-white background transparent
    const pixels = Buffer.from(data);
    const threshold = 230; // pixels with R,G,B all above this become transparent
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // If pixel is near-white (all channels above threshold), make transparent
      if (r > threshold && g > threshold && b > threshold) {
        pixels[i + 3] = 0; // Set alpha to 0 (transparent)
      }
    }

    // Save as PNG with transparency
    await sharp(pixels, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4,
      },
    })
      .png()
      .toFile(outputPath);

    console.log(`Logo saved to ${outputPath} with transparent background`);

    // Also create a smaller optimized version
    const smallOutputPath = path.join(__dirname, '..', 'public', 'logo-small.png');
    await sharp(pixels, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4,
      },
    })
      .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(smallOutputPath);

    console.log(`Small logo saved to ${smallOutputPath}`);

  } catch (error) {
    console.error('Error processing logo:', error);
    process.exit(1);
  }
}

processLogo();
