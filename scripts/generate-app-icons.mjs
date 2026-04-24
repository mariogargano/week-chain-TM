import sharp from "sharp"
import { writeFile } from "fs/promises"
import { resolve } from "path"

const ROOT = resolve(process.cwd())
const SOURCE = resolve(ROOT, "public/weekchain-logo-source.png")

/**
 * Generates a circular icon with transparent background.
 * Input: any square PNG.
 * Output: PNG at size x size with circular alpha mask.
 */
async function makeCircular(size) {
  const metadata = await sharp(SOURCE).metadata()
  const srcSize = Math.min(metadata.width || 1024, metadata.height || 1024)

  // First crop to center square, then resize
  const squared = await sharp(SOURCE)
    .resize(srcSize, srcSize, { fit: "cover", position: "center" })
    .resize(size, size, { fit: "cover", kernel: "lanczos3" })
    .toBuffer()

  // Circular SVG mask
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
    </svg>`,
  )

  return sharp(squared)
    .composite([{ input: mask, blend: "dest-in" }])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

/**
 * Maskable icon: for Android adaptive icons.
 * Logo occupies center 80% (safe zone per W3C spec), rest is background.
 * Keeps square format with solid background.
 */
async function makeMaskable(size) {
  const safeSize = Math.round(size * 0.72)
  const padding = Math.round((size - safeSize) / 2)

  const logo = await sharp(SOURCE)
    .resize(safeSize, safeSize, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer()

  // White background canvas with logo centered
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: logo, top: padding, left: padding }])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

async function writeFileBuf(path, buf) {
  await writeFile(path, buf)
  console.log(`[v0] wrote ${path} (${Math.round(buf.length / 1024)} KB)`)
}

async function main() {
  console.log("[v0] Generating circular app icons from:", SOURCE)

  // Circular icons (transparent bg) - used everywhere by default
  const icon192 = await makeCircular(192)
  const icon512 = await makeCircular(512)
  const icon1024 = await makeCircular(1024)
  const appleIcon = await makeCircular(180)
  const favicon32 = await makeCircular(32)

  await writeFileBuf(resolve(ROOT, "public/icon-192.png"), icon192)
  await writeFileBuf(resolve(ROOT, "public/icon-512.png"), icon512)
  await writeFileBuf(resolve(ROOT, "public/weekchain-logo.png"), icon1024)
  await writeFileBuf(resolve(ROOT, "public/apple-touch-icon.png"), appleIcon)
  await writeFileBuf(resolve(ROOT, "public/favicon-32.png"), favicon32)

  // Next.js App Router special icons
  await writeFileBuf(resolve(ROOT, "app/icon.png"), icon512)
  await writeFileBuf(resolve(ROOT, "app/apple-icon.png"), appleIcon)

  // Maskable icons for Android (square, logo in safe zone)
  const maskable192 = await makeMaskable(192)
  const maskable512 = await makeMaskable(512)
  await writeFileBuf(resolve(ROOT, "public/icon-maskable-192.png"), maskable192)
  await writeFileBuf(resolve(ROOT, "public/icon-maskable-512.png"), maskable512)

  console.log("[v0] All icons generated successfully")
}

main().catch((err) => {
  console.error("[v0] Icon generation failed:", err)
  process.exit(1)
})
