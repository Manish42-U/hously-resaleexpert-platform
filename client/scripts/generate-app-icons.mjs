import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = path.resolve(import.meta.dirname, '..');

const androidSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const iosImages = [
  { idiom: 'iphone', size: '20x20', scale: '2x', filename: 'AppIcon-20@2x.png', px: 40 },
  { idiom: 'iphone', size: '20x20', scale: '3x', filename: 'AppIcon-20@3x.png', px: 60 },
  { idiom: 'iphone', size: '29x29', scale: '2x', filename: 'AppIcon-29@2x.png', px: 58 },
  { idiom: 'iphone', size: '29x29', scale: '3x', filename: 'AppIcon-29@3x.png', px: 87 },
  { idiom: 'iphone', size: '40x40', scale: '2x', filename: 'AppIcon-40@2x.png', px: 80 },
  { idiom: 'iphone', size: '40x40', scale: '3x', filename: 'AppIcon-40@3x.png', px: 120 },
  { idiom: 'iphone', size: '60x60', scale: '2x', filename: 'AppIcon-60@2x.png', px: 120 },
  { idiom: 'iphone', size: '60x60', scale: '3x', filename: 'AppIcon-60@3x.png', px: 180 },
  { idiom: 'ios-marketing', size: '1024x1024', scale: '1x', filename: 'AppIcon-1024.png', px: 1024 },
];

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (buffer) => {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
};

const writePng = (file, width, height, rgba) => {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]));
};

const hex = (value) => [
  (value >> 16) & 255,
  (value >> 8) & 255,
  value & 255,
  255,
];

const mix = (a, b, t) => a.map((value, index) => Math.round(value + (b[index] - value) * t));

const smoothstep = (edge0, edge1, x) => {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const roundedRectAlpha = (x, y, width, height, radius) => {
  const dx = Math.max(Math.abs(x - width / 2) - width / 2 + radius, 0);
  const dy = Math.max(Math.abs(y - height / 2) - height / 2 + radius, 0);
  const distance = Math.hypot(dx, dy);
  return 1 - smoothstep(radius - 1.4, radius + 1.4, distance);
};

const inRoundedRect = (x, y, cx, cy, width, height, radius) =>
  roundedRectAlpha(x - cx + width / 2, y - cy + height / 2, width, height, radius) > 0.5;

const inCircle = (x, y, cx, cy, r) => Math.hypot(x - cx, y - cy) <= r;
const inRect = (x, y, left, top, width, height) => x >= left && x <= left + width && y >= top && y <= top + height;

const distToSegment = (px, py, ax, ay, bx, by) => {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const c1 = vx * wx + vy * wy;
  const c2 = vx * vx + vy * vy;
  const t = c2 ? Math.max(0, Math.min(1, c1 / c2)) : 0;
  return Math.hypot(px - (ax + t * vx), py - (ay + t * vy));
};

const inCapsule = (x, y, ax, ay, bx, by, r) => distToSegment(x, y, ax, ay, bx, by) <= r;

const drawIcon = (size, round = false) => {
  const scale = 4;
  const big = size * scale;
  const pixels = Buffer.alloc(big * big * 4);
  const navyA = hex(0x0d2747);
  const navyB = hex(0x123f78);
  const blueA = hex(0x1e3c72);
  const blueB = hex(0x2a5298);
  const yellowA = hex(0xffdf73);
  const yellowB = hex(0xffd245);
  const white = hex(0xffffff);

  for (let y = 0; y < big; y += 1) {
    for (let x = 0; x < big; x += 1) {
      const nx = x / big;
      const ny = y / big;
      let color = mix(navyA, navyB, Math.min(1, nx * 0.45 + ny * 0.55));
      const glow = Math.max(0, 1 - Math.hypot(nx - 0.74, ny - 0.2) / 0.55);
      color = mix(color, [16, 87, 125, 255], glow * 0.22);

      const outer = round ? inCircle(x, y, big / 2, big / 2, big / 2 - 1) : true;

      const badgeShadow = inRoundedRect(
        x,
        y,
        big * 0.515,
        big * 0.515,
        big * 0.76,
        big * 0.76,
        big * 0.16,
      );
      const badge = inRoundedRect(
        x,
        y,
        big * 0.5,
        big * 0.5,
        big * 0.76,
        big * 0.76,
        big * 0.16,
      );

      const hLeft = inRoundedRect(x, y, big * 0.36, big * 0.56, big * 0.10, big * 0.38, big * 0.018);
      const hRight = inRoundedRect(x, y, big * 0.64, big * 0.56, big * 0.10, big * 0.38, big * 0.018);
      const hBridge = inCapsule(x, y, big * 0.36, big * 0.56, big * 0.64, big * 0.56, big * 0.045);
      const hMark = hLeft || hRight || hBridge;

      const roofFill = (
        y >= big * 0.28 &&
        y <= big * 0.44 &&
        x >= big * (0.50 - (y - big * 0.28) * 0.95 / big) &&
        x <= big * (0.50 + (y - big * 0.28) * 0.95 / big)
      );
      const roofLine1 = inCapsule(x, y, big * 0.35, big * 0.50, big * 0.50, big * 0.34, big * 0.018);
      const roofLine2 = inCapsule(x, y, big * 0.50, big * 0.34, big * 0.65, big * 0.50, big * 0.018);

      if (badgeShadow && !badge) color = mix(color, [4, 18, 32, 255], 0.28);
      if (badge) color = mix(blueA, blueB, Math.min(1, ny * 0.7 + nx * 0.25));
      if (roofFill) color = mix(yellowA, yellowB, ny);
      if (hMark || roofLine1 || roofLine2) color = white;

      const idx = (y * big + x) * 4;
      pixels[idx] = outer ? color[0] : 0;
      pixels[idx + 1] = outer ? color[1] : 0;
      pixels[idx + 2] = outer ? color[2] : 0;
      pixels[idx + 3] = 255;
    }
  }

  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const sum = [0, 0, 0, 0];
      for (let sy = 0; sy < scale; sy += 1) {
        for (let sx = 0; sx < scale; sx += 1) {
          const idx = ((y * scale + sy) * big + (x * scale + sx)) * 4;
          sum[0] += pixels[idx];
          sum[1] += pixels[idx + 1];
          sum[2] += pixels[idx + 2];
          sum[3] += pixels[idx + 3];
        }
      }
      const outIdx = (y * size + x) * 4;
      out[outIdx] = Math.round(sum[0] / 16);
      out[outIdx + 1] = Math.round(sum[1] / 16);
      out[outIdx + 2] = Math.round(sum[2] / 16);
      out[outIdx + 3] = Math.round(sum[3] / 16);
    }
  }
  return out;
};

const writeIcon = (file, size, round = false) => writePng(file, size, size, drawIcon(size, round));

for (const [folder, size] of Object.entries(androidSizes)) {
  const dir = path.join(root, 'android/app/src/main/res', folder);
  writeIcon(path.join(dir, 'ic_launcher.png'), size);
  writeIcon(path.join(dir, 'ic_launcher_round.png'), size, true);
  writeIcon(path.join(dir, 'ic_launcher_foreground.png'), size);
}

const iosDir = path.join(root, 'ios/client/Images.xcassets/AppIcon.appiconset');
for (const image of iosImages) writeIcon(path.join(iosDir, image.filename), image.px);

fs.writeFileSync(
  path.join(iosDir, 'Contents.json'),
  `${JSON.stringify({
    images: iosImages.map(({ idiom, size, scale, filename }) => ({ idiom, size, scale, filename })),
    info: { author: 'xcode', version: 1 },
  }, null, 2)}\n`,
);

console.log('Generated Android and iOS app icons.');
