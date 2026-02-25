import sharp from 'sharp';

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3d8df645-e3dc-4da2-8d8f-ca1302254890.jpeg';

async function processLogo() {
  console.log('Fetching logo...');
  const response = await fetch(logoUrl);
  const arrayBuffer = await response.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  const metadata = await sharp(inputBuffer).metadata();
  console.log(`Input: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

  // Step 1: Get raw pixel data with alpha channel
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`Processing ${width}x${height}, ${channels} channels`);

  // Step 2: Make light gray/white background transparent
  // The background is a gradient from ~#e8e8e8 to ~#f5f5f5
  const threshold = 225; // Pixels where R, G, B are all above this become transparent
  const softThreshold = 210; // Soft edge for anti-aliasing
  let transparentCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check if pixel is "near white/light gray" 
    const isNearWhite = r > threshold && g > threshold && b > threshold;
    const isSoftEdge = r > softThreshold && g > softThreshold && b > softThreshold;

    // Also check saturation - background has very low saturation
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;

    if (isNearWhite && saturation < 0.08) {
      // Fully transparent for clear background pixels
      data[i + 3] = 0;
      transparentCount++;
    } else if (isSoftEdge && saturation < 0.05) {
      // Semi-transparent for soft edges (anti-aliasing)
      const factor = (r + g + b) / 3;
      const alpha = Math.max(0, Math.round(255 * (1 - (factor - softThreshold) / (255 - softThreshold))));
      data[i + 3] = alpha;
      transparentCount++;
    }
  }

  const totalPixels = width * height;
  console.log(`Made ${transparentCount}/${totalPixels} pixels transparent (${((transparentCount/totalPixels)*100).toFixed(1)}%)`);

  // Step 3: Save as PNG with transparency
  const outputBuffer = await sharp(data, {
    raw: { width, height, channels: 4 }
  })
    .png({ quality: 95 })
    .toBuffer();

  // Output as base64 for verification
  console.log(`Output PNG size: ${outputBuffer.length} bytes`);
  console.log(`BASE64_START`);
  console.log(outputBuffer.toString('base64'));
  console.log(`BASE64_END`);
}

processLogo().catch(e => console.error('Error:', e));
