// Builds the still logo and the favicon / app-icon set from the design's
// animated logo (public/brand/winapps-logo.gif, last frame saved as
// scripts/logo-last-frame.png). Run with `npm run brand`; outputs are
// committed, so this only needs re-running when the logo changes.
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const SRC = "scripts/logo-last-frame.png";
const OUT = "public";

// 1. Still logo for prefers-reduced-motion: same canvas as the GIF (257×287)
//    so swapping the two never shifts the header.
await sharp(SRC).png({ compressionLevel: 9 }).toFile(`${OUT}/brand/winapps-logo-still.png`);
await sharp(SRC).webp({ quality: 92 }).toFile(`${OUT}/brand/winapps-logo-still.webp`);

// 2. The W mark alone (above the WINAPPS lettering), with white keyed out.
const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;
const isInk = (x, y) => {
  const i = (y * width + x) * 4;
  return data[i + 3] > 0 && Math.min(data[i], data[i + 1], data[i + 2]) < 225;
};
// The lettering starts where a fully blank row first appears below the mark.
let top = -1, bottom = -1, left = width, right = 0;
for (let y = 0; y < height; y++) {
  let any = false;
  for (let x = 0; x < width; x++) if (isInk(x, y)) { any = true; left = Math.min(left, x); right = Math.max(right, x); }
  if (any && top < 0) top = y;
  if (!any && top >= 0) { bottom = y; break; }
}
if (top < 0 || bottom < 0) throw new Error("Could not find the W mark in the logo frame");
// Recompute left/right for the mark rows only.
left = width; right = 0;
for (let y = top; y < bottom; y++) for (let x = 0; x < width; x++) if (isInk(x, y)) { left = Math.min(left, x); right = Math.max(right, x); }

const markW = right - left + 1, markH = bottom - top;
const keyed = Buffer.from(data);
for (let i = 0; i < keyed.length; i += 4) {
  // Fade near-white to transparent so the mark sits on any background.
  const m = Math.min(keyed[i], keyed[i + 1], keyed[i + 2]);
  if (m >= 245) keyed[i + 3] = 0;
  else if (m > 215) keyed[i + 3] = Math.round(((245 - m) / 30) * keyed[i + 3]);
}
const mark = await sharp(keyed, { raw: { width, height, channels: 4 } })
  .extract({ left, top, width: markW, height: markH })
  .png()
  .toBuffer();

/** Square icon: the mark centred with `pad` margin on `bg` (null = transparent). */
async function icon(size, pad, bg) {
  const inner = Math.round(size * (1 - pad * 2));
  const fitted = await sharp(mark).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: bg ?? { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: fitted, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const white = { r: 255, g: 255, b: 255, alpha: 1 };
const files = {
  "favicon-16.png": await icon(16, 0.02, null),
  "favicon-32.png": await icon(32, 0.04, null),
  "apple-touch-icon.png": await icon(180, 0.12, white),
  "icon-192.png": await icon(192, 0.1, white),
  "icon-512.png": await icon(512, 0.1, white),
  "icon-maskable-512.png": await icon(512, 0.2, white),
  "brand/icon-512.png": await icon(512, 0.1, white),
};
for (const [name, buf] of Object.entries(files)) await writeFile(`${OUT}/${name}`, buf);

// 3. favicon.ico holding the 16 and 32 px PNGs (PNG-in-ICO, all browsers).
const pngs = [files["favicon-16.png"], files["favicon-32.png"]];
const header = Buffer.alloc(6 + 16 * pngs.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);
let offset = header.length;
pngs.forEach((png, i) => {
  const size = i === 0 ? 16 : 32;
  const e = 6 + i * 16;
  header.writeUInt8(size, e);
  header.writeUInt8(size, e + 1);
  header.writeUInt8(0, e + 2);
  header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(png.length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += png.length;
});
await writeFile(`${OUT}/favicon.ico`, Buffer.concat([header, ...pngs]));

console.log(`W mark ${markW}×${markH} at (${left},${top}); wrote still logo, favicon.ico and ${Object.keys(files).length} icons.`);
