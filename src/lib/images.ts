import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
// The import attribute lets plain Node import this file too (scripts/checks.mjs tests it).
import manifest from '../data/images.json' with { type: 'json' };

export interface ManifestEntry {
  width: number;
  height: number;
  widths: number[];
  /** sha256 (first 16 hex digits) of the plain `<name>.webp` that `npm run images` wrote. */
  hash: string;
}

const entries = manifest as Record<string, ManifestEntry>;

export interface ResolvedImage {
  src: string;
  width: number;
  height: number;
  /** Present only for images processed by `npm run images`. */
  avif?: string;
  webp?: string;
}

/** Placeholders and hand-dropped files have no manifest entry; 16:10 is what the layout expects. */
const DEFAULT_SIZE = { width: 1280, height: 800 };

const hashes = new Map<string, string | null>();

/** Hash of a file in public/, read once per build; null if it does not exist. */
function publicFileHash(src: string): string | null {
  if (!hashes.has(src)) {
    const file = path.join(process.cwd(), 'public', src.replace(/^\//, ''));
    hashes.set(
      src,
      existsSync(file) ? createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 16) : null,
    );
  }
  return hashes.get(src) ?? null;
}

/**
 * `/projects/x/cover.webp` → the srcset of every size `npm run images`
 * generated for it, plus its real dimensions.
 *
 * The variants are used only when the frontmatter names the exact plain
 * `.webp` that `npm run images` produced and that file is unchanged. Anything
 * else is served as it is: the SVG placeholders, a `.png` or `.jpg` copied into
 * public/ by hand, or a `cover.webp` overwritten with a new screenshot (whose
 * old variants would otherwise hide it).
 */
export function resolveImage(src: string): ResolvedImage {
  const key = src.replace(/\.[a-z0-9]+$/i, '');
  const entry = entries[key];
  return selectImage(src, entry, entry ? publicFileHash(src) : null);
}

/** The decision itself, without file access (so it can be tested with any hash). */
export function selectImage(
  src: string,
  entry: ManifestEntry | undefined,
  fileHash: string | null,
): ResolvedImage {
  const key = src.replace(/\.[a-z0-9]+$/i, '');
  if (!entry || !src.endsWith('.webp') || fileHash !== entry.hash) {
    return { src, ...DEFAULT_SIZE };
  }

  const set = (format: 'avif' | 'webp') =>
    entry.widths.map((width) => `${key}-${width}.${format} ${width}w`).join(', ');

  return {
    src: `${key}-${entry.width}.webp`,
    width: entry.width,
    height: entry.height,
    avif: set('avif'),
    webp: set('webp'),
  };
}
