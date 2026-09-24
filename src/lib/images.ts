import manifest from '../data/images.json';

interface ManifestEntry {
  width: number;
  height: number;
  widths: number[];
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

/**
 * `/projects/x/cover.webp` → the srcset of every size `npm run images`
 * generated for it, plus its real dimensions. Anything else (the SVG
 * placeholders, a file copied into public/ by hand) is served as-is.
 */
export function resolveImage(src: string): ResolvedImage {
  const key = src.replace(/\.[a-z0-9]+$/i, '');
  const entry = entries[key];
  if (!entry) return { src, ...DEFAULT_SIZE };

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
