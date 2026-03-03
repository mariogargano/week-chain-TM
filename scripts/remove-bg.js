import sharp from 'sharp';
import path from 'path';

const inputPath = path.resolve('public/logo-wc.png');
const outputPath = path.resolve('public/logo-wc-nobg.png');

async function removeBg() {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Get raw pixel data
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const { width, height, channels } = info;
    
    // Process pixels: make near-white pixels transparent
    // The logo has a white/light gray background
    const newData = Buffer.from(data);
    for (let i = 0; i < newData.length; i += channels) {
      const r = newData[i];
      const g = newData[i + 1];
      const b = newData[i + 2];
      
      // If pixel is very light (near white), make it transparent
      // Use a threshold approach - white bg pixels are typically > 220 in all channels
      const brightness = (r + g + b) / 3;
      const isNearWhite = r > 210 && g > 210 && b > 210;
      
      if (isNearWhite) {
        // Make fully transparent
        newData[i + 3] = 0;
      } else if (brightness > 190 && r > 180 && g > 180 && b > 180) {
        // Semi-transparent for edge anti-aliasing
        const alpha = Math.round(255 * (1 - (brightness - 190) / 65));
        newData[i + 3] = Math.max(0, Math.min(255, alpha));
      }
    }
    
    await sharp(newData, {
      raw: { width, height, channels }
    })
    .png()
    .toFile(outputPath);
    
    console.log('Background removed successfully! Saved to', outputPath);
    
    // Also overwrite the original
    await sharp(newData, {
      raw: { width, height, channels }
    })
    .png()
    .toFile(inputPath);
    
    console.log('Original logo-wc.png also updated with transparent background');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

removeBg();
