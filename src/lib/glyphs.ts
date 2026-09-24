/**
 * Turns text into SVG outlines with the site's own typeface (Space Grotesk).
 *
 * Every generated image — the Open Graph cards, the favicon, the project cover
 * placeholders — is an SVG rasterised by sharp. Rasterisers pick fonts from
 * the operating system, and a build server usually has none of ours (often
 * none at all), so live `<text>` would render in a random fallback or as
 * empty boxes. Outlines look identical on every machine.
 *
 * Plain Node can import this file too (`scripts/placeholders.mjs` does), so it
 * sticks to syntax that type-stripping understands.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

interface OtPath {
  toPathData(decimalPlaces?: number): string;
}
interface OtFont {
  unitsPerEm: number;
  getPath(text: string, x: number, y: number, fontSize: number): OtPath;
  getAdvanceWidth(text: string, fontSize: number): number;
}
interface OtModule {
  parse(buffer: ArrayBuffer): OtFont;
}

export type Weight = 400 | 500 | 700;

const require = createRequire(import.meta.url);
// opentype.js ships no types and different module shapes for Node and bundlers;
// the CommonJS entry is the same everywhere.
const opentype = require('opentype.js') as OtModule;

const fonts = new Map<Weight, OtFont>();

function font(weight: Weight): OtFont {
  let loaded = fonts.get(weight);
  if (!loaded) {
    const file = require.resolve(
      `@fontsource/space-grotesk/files/space-grotesk-latin-${weight}-normal.woff`,
    );
    const buffer = readFileSync(file);
    loaded = opentype.parse(
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer,
    );
    fonts.set(weight, loaded);
  }
  return loaded;
}

export function measure(text: string, size: number, weight: Weight = 400): number {
  return font(weight).getAdvanceWidth(text, size);
}

export interface TextOptions {
  x: number;
  /** Baseline position. */
  y: number;
  size: number;
  weight?: Weight;
  fill: string;
  anchor?: 'start' | 'middle' | 'end';
  opacity?: number;
}

/** One line of text as a `<path>` element. */
export function textPath(text: string, options: TextOptions): string {
  const { size, weight = 400, fill, anchor = 'start', opacity } = options;
  const width = measure(text, size, weight);
  const x = anchor === 'middle' ? options.x - width / 2 : anchor === 'end' ? options.x - width : options.x;
  const d = font(weight).getPath(text, x, options.y, size).toPathData(2);
  const alpha = opacity === undefined ? '' : ` fill-opacity="${opacity}"`;
  return `<path d="${d}" fill="${fill}"${alpha}/>`;
}

/**
 * Greedy word wrap. Returns at most `maxLines` lines; if the text does not
 * fit, the last line ends with an ellipsis.
 */
export function wrap(
  text: string,
  size: number,
  maxWidth: number,
  weight: Weight = 400,
  maxLines = Infinity,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measure(candidate, size, weight) <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);

  if (lines.length <= maxLines) return lines;

  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1] ?? '';
  while (last && measure(`${last}…`, size, weight) > maxWidth) {
    last = last.replace(/\s*\S+$/, '');
  }
  kept[maxLines - 1] = `${last}…`;
  return kept;
}

/** Several lines, top-aligned: `y` is the first baseline. */
export function paragraph(
  lines: string[],
  options: TextOptions & { lineHeight: number },
): string {
  return lines
    .map((line, index) => textPath(line, { ...options, y: options.y + index * options.lineHeight }))
    .join('');
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
