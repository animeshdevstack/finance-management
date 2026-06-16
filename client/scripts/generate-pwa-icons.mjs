import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, "../public")
const sourceIcon = path.join(publicDir, "pwa-icon.svg")

const sizes = [
  { name: "pwa-192x192.png", size: 192 },
  { name: "pwa-512x512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
]

async function generateIcons() {
  const svg = await readFile(sourceIcon)
  await mkdir(publicDir, { recursive: true })

  for (const { name, size } of sizes) {
    await sharp(svg).resize(size, size).png().toFile(path.join(publicDir, name))
    console.log(`Generated ${name}`)
  }
}

generateIcons().catch((error) => {
  console.error("Failed to generate PWA icons:", error)
  process.exit(1)
})
