// Deterministic placeholder images. The design used picsum seeds; the app never
// loads a network image, so mockImage(seed, w, h) returns a data: URI SVG - a
// warm gradient whose hues derive from the seed, a few translucent shapes, and
// a faint grain from feTurbulence. Same (seed, w, h) always yields the same
// picture, so layouts match the canvases tile for tile.

const cache = new Map<string, string>()

function fnv1a(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

// mulberry32
function rng(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

// Warm-leaning hue pool: terracotta, clay, ochre, sand, with sage and plum as
// the occasional cool note (the design palette in photographic form).
const HUES = [12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 22, 30, 88, 96, 104, 300, 318, 34, 18, 26]

function hsl(h: number, s: number, l: number): string {
  const hh = ((Math.round(h) % 360) + 360) % 360
  return `hsl(${hh}, ${Math.round(s)}%, ${Math.round(l)}%)`
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function mockImage(seed: string, w: number, h: number): string {
  const key = `${seed}|${w}|${h}`
  const hit = cache.get(key)
  if (hit) return hit

  const hash = fnv1a(seed)
  const next = rng(hash)

  const baseHue = HUES[Math.floor(next() * HUES.length)]
  const hue2 = baseHue + (next() * 36 - 18)
  const sat = 28 + next() * 20
  const light = 44 + next() * 16
  const angle = Math.round(next() * 360)

  const c1 = hsl(baseHue, sat, light)
  const c2 = hsl(hue2, sat - 6, light - 14)

  const shapes: string[] = []
  const shapeCount = 3
  for (let i = 0; i < shapeCount; i++) {
    const cx = round1(next() * w)
    const cy = round1(next() * h)
    const rx = round1(w * (0.18 + next() * 0.32))
    const ry = round1(h * (0.14 + next() * 0.3))
    const shapeHue = baseHue + (next() * 50 - 25)
    const shapeLight = light + (next() * 26 - 10)
    const opacity = round1(0.16 + next() * 0.22)
    shapes.push(
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${hsl(shapeHue, sat + 8, shapeLight)}" fill-opacity="${opacity}"/>`,
    )
  }
  // one soft horizon band
  const bandY = round1(h * (0.5 + next() * 0.35))
  const bandH = round1(h * (0.08 + next() * 0.12))
  shapes.push(
    `<rect x="0" y="${bandY}" width="${w}" height="${bandH}" fill="${hsl(hue2, sat, light - 22)}" fill-opacity="${round1(0.1 + next() * 0.14)}"/>`,
  )

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">` +
    `<defs>` +
    `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle} .5 .5)">` +
    `<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>` +
    `<filter id="n" x="0" y="0" width="100%" height="100%">` +
    `<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${hash % 997}" stitchTiles="stitch"/>` +
    `<feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .16 0"/>` +
    `</filter></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#g)"/>` +
    shapes.join('') +
    `<rect width="${w}" height="${h}" filter="url(#n)"/>` +
    `</svg>`

  const uri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  cache.set(key, uri)
  return uri
}

/** Convenience alias matching the design's P(seed, w, h). */
export const img = mockImage
