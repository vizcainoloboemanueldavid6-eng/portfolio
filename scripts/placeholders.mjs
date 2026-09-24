/**
 * Generates the SVG cover placeholders in public/projects/<slug>/cover.svg:
 * the project name and a one-line label on a coloured card, drawn as outlines
 * so they look the same in every browser.
 *
 *   npm run placeholders                      regenerate the built-in list below
 *   npm run placeholders -- my-app "My App" "Booking web app" "#0EA5E9"
 *                                             create one for a new project
 *
 * Replace a placeholder by a real screenshot whenever you have one — see the
 * README ("Reemplazar las portadas").
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { paragraph, wrap } from '../src/lib/glyphs.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const WIDTH = 1200;
const HEIGHT = 750;

const defaults = [
  { slug: 'tabzen', title: 'TabZen', label: 'Tab manager Chrome extension', color: '#5B5BD6' },
  { slug: 'quicknotes', title: 'QuickNotes', label: 'Web notes & highlighter extension', color: '#F2B705' },
  { slug: 'stockflow', title: 'StockFlow', label: 'Inventory management web app', color: '#2563EB' },
];

function luminance(hex) {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function mix(hex, other, amount) {
  const a = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const b = [1, 3, 5].map((i) => parseInt(other.slice(i, i + 2), 16));
  return `#${a
    .map((v, i) => Math.round(v * (1 - amount) + b[i] * amount).toString(16).padStart(2, '0'))
    .join('')}`;
}

export function placeholderSvg({ title, label, color }) {
  const light = luminance(color) > 0.35;
  const ink = light ? '#15161C' : '#FFFFFF';
  const deep = mix(color, '#0B0C10', light ? 0.25 : 0.55);

  const titleSize = title.length > 12 ? 104 : 128;
  const titleLines = wrap(title, titleSize, WIDTH - 200, 700, 2);
  const labelLines = wrap(label, 40, WIDTH - 200, 500, 2);
  const blockHeight = titleLines.length * titleSize * 1.02 + 36 + labelLines.length * 52;
  const top = (HEIGHT - blockHeight) / 2 + titleSize * 0.8;

  const dots = [];
  for (let x = 40; x < WIDTH; x += 40) {
    for (let y = 40; y < HEIGHT; y += 40) dots.push(`M${x} ${y}h1.6v1.6h-1.6z`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${deep}"/></linearGradient>
<radialGradient id="glow" cx="0.85" cy="0.1" r="0.6"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.28"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
<path d="${dots.join('')}" fill="${ink}" fill-opacity="0.16"/>
<rect x="60" y="60" width="${WIDTH - 120}" height="${HEIGHT - 120}" rx="28" fill="none" stroke="${ink}" stroke-opacity="0.22" stroke-width="2"/>
${paragraph(titleLines, { x: WIDTH / 2, y: top, size: titleSize, weight: 700, fill: ink, anchor: 'middle', lineHeight: titleSize * 1.02 })}
${paragraph(labelLines, { x: WIDTH / 2, y: top + (titleLines.length - 1) * titleSize * 1.02 + 36 + 40, size: 40, weight: 500, fill: ink, anchor: 'middle', opacity: 0.86, lineHeight: 52 })}
</svg>
`;
}

async function write({ slug, ...rest }) {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Invalid slug "${slug}" — use lowercase letters, digits and dashes.`);
  if (!/^#[0-9a-fA-F]{6}$/.test(rest.color)) throw new Error(`Invalid colour "${rest.color}" — use #RRGGBB.`);
  const dir = path.join(ROOT, 'public', 'projects', slug);
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, 'cover.svg');
  await fs.writeFile(file, placeholderSvg(rest));
  console.log(`  ${path.relative(ROOT, file)}`);
}

const [slug, title, label, color = '#7C5CFF'] = process.argv.slice(2);
if (slug) {
  if (!title || !label) {
    console.error('Usage: npm run placeholders -- <slug> "<Title>" "<One-line label>" [#RRGGBB]');
    process.exit(1);
  }
  await write({ slug, title, label, color });
} else {
  for (const item of defaults) await write(item);
}
