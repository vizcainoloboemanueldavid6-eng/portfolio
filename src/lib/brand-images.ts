/**
 * The generated images: favicon, app icons and Open Graph cards. They are
 * built from profile.ts at build time (see the endpoints in src/pages/), so
 * changing your name or initials updates every one of them — there is no
 * image to redraw by hand.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { profile } from '../config/profile';
import { paragraph, textPath, wrap } from './glyphs';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const INK = '#0B0C10';
const FG = '#E8E8EA';
const MUTED = '#B4B4BE';
const PRIMARY = '#7C5CFF';
const PRIMARY_DEEP = '#5B3DF5';
const PRIMARY_SOFT = '#A594FF';
const SECONDARY = '#2EE6A6';

function initialsMark(size: number, x: number, y: number, radius: number): string {
  const fontSize = size * (profile.initials.length > 2 ? 0.34 : 0.44);
  return `
<defs>
  <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${PRIMARY}"/><stop offset="1" stop-color="${PRIMARY_DEEP}"/>
  </linearGradient>
</defs>
<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${radius}" fill="url(#mark)"/>
<circle cx="${x + size * 0.8}" cy="${y + size * 0.2}" r="${size * 0.08}" fill="${SECONDARY}"/>
${textPath(profile.initials, {
  x: x + size / 2,
  y: y + size / 2 + fontSize * 0.36,
  size: fontSize,
  weight: 700,
  fill: '#FFFFFF',
  anchor: 'middle',
})}`;
}

interface IconOptions {
  /** Square corners, for platforms that apply their own mask (iOS). */
  fullBleed?: boolean;
}

/** Square icon with the initials; used for the SVG favicon and every PNG size. */
export function iconSvg(size = 64, { fullBleed = false }: IconOptions = {}): string {
  const radius = fullBleed ? 0 : size * 0.22;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${initialsMark(size, 0, 0, radius)}</svg>`;
}

export async function iconPng(size: number, options: IconOptions = {}): Promise<Buffer> {
  // Draw large and scale down: the outlines stay crisp at 16 and 32 px.
  const large = Math.max(size, 256);
  return sharp(Buffer.from(iconSvg(large, options))).resize(size, size).png().toBuffer();
}

/** An .ico file whose entries are PNG images, which every current browser reads. */
export async function iconIco(sizes: number[] = [16, 32, 48]): Promise<Buffer> {
  const images = await Promise.all(sizes.map((size) => iconPng(size)));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map((image, index) => {
    const size = sizes[index] ?? 0;
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(image.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += image.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images]);
}

function ogBackground(): string {
  return `
<defs>
  <radialGradient id="glowA" cx="0.12" cy="0.08" r="0.75">
    <stop offset="0" stop-color="${PRIMARY}" stop-opacity="0.45"/><stop offset="1" stop-color="${PRIMARY}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="glowB" cx="0.95" cy="1" r="0.6">
    <stop offset="0" stop-color="${SECONDARY}" stop-opacity="0.22"/><stop offset="1" stop-color="${SECONDARY}" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${INK}"/>
<rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#glowA)"/>
<rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#glowB)"/>
<rect x="24" y="24" width="${OG_WIDTH - 48}" height="${OG_HEIGHT - 48}" rx="28" fill="none" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="2"/>`;
}

function signature(y: number): string {
  return `
<g transform="translate(72 ${y - 44})">${initialsMark(56, 0, 0, 14)}</g>
${textPath(profile.name, { x: 144, y: y - 20, size: 26, weight: 700, fill: FG })}
${textPath(`@${profile.username}`, { x: 144, y: y + 8, size: 22, weight: 400, fill: MUTED })}`;
}

export async function ogHomePng(lang: 'en' | 'es', tagline: string): Promise<Buffer> {
  const nameLines = wrap(profile.name, 88, 700, 700, 2);
  const taglineLines = wrap(tagline, 38, 720, 500, 3);
  const titleTop = 218;
  const taglineTop = titleTop + (nameLines.length - 1) * 92 + 76;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
${ogBackground()}
${textPath(profile.jobTitle[lang].toUpperCase(), { x: 72, y: 120, size: 24, weight: 500, fill: SECONDARY })}
${paragraph(nameLines, { x: 72, y: titleTop, size: 88, weight: 700, fill: '#FFFFFF', lineHeight: 92 })}
${paragraph(taglineLines, { x: 72, y: taglineTop, size: 38, weight: 500, fill: PRIMARY_SOFT, lineHeight: 50 })}
${textPath(`@${profile.username}`, { x: 72, y: 548, size: 26, weight: 500, fill: MUTED })}
<g transform="translate(850 150)">
  <circle cx="150" cy="150" r="158" fill="none" stroke="${SECONDARY}" stroke-opacity="0.5" stroke-width="3"/>
  <defs><linearGradient id="avatar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${PRIMARY}"/><stop offset="1" stop-color="${PRIMARY_DEEP}"/></linearGradient></defs>
  <circle cx="150" cy="150" r="146" fill="url(#avatar)"/>
  ${textPath(profile.initials, { x: 150, y: 150 + 44, size: 124, weight: 700, fill: '#FFFFFF', anchor: 'middle' })}
</g>
</svg>`;

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}

interface OgProject {
  title: string;
  tagline: string;
  cover: string;
  kicker: string;
}

async function coverImage(cover: string, width: number, height: number): Promise<Buffer | null> {
  const file = path.join(process.cwd(), 'public', cover.replace(/^\//, ''));
  if (!existsSync(file)) return null;
  const radius = 18;
  const mask = Buffer.from(
    `<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${radius}" fill="#fff"/></svg>`,
  );
  return sharp(file, { density: 144 })
    .resize(width, height, { fit: 'cover', position: 'top' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

export async function ogProjectPng(project: OgProject): Promise<Buffer> {
  const coverWidth = 500;
  const coverHeight = 313;
  const coverX = 640;
  const coverY = 150;

  const titleLines = wrap(project.title, 68, 520, 700, 2);
  const taglineLines = wrap(project.tagline, 32, 520, 500, 3);
  const titleTop = 206;
  const taglineTop = titleTop + (titleLines.length - 1) * 74 + 64;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
${ogBackground()}
${textPath(project.kicker.toUpperCase(), { x: 72, y: 120, size: 24, weight: 500, fill: SECONDARY })}
${paragraph(titleLines, { x: 72, y: titleTop, size: 68, weight: 700, fill: '#FFFFFF', lineHeight: 74 })}
${paragraph(taglineLines, { x: 72, y: taglineTop, size: 32, weight: 500, fill: PRIMARY_SOFT, lineHeight: 42 })}
${signature(548)}
<rect x="${coverX - 10}" y="${coverY - 10}" width="${coverWidth + 20}" height="${coverHeight + 20}" rx="26" fill="#FFFFFF" fill-opacity="0.05" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="2"/>
</svg>`;

  const base = sharp(Buffer.from(svg));
  const cover = await coverImage(project.cover, coverWidth, coverHeight);
  const layers = cover ? [{ input: cover, left: coverX, top: coverY }] : [];
  return base.composite(layers).png({ compressionLevel: 9 }).toBuffer();
}
