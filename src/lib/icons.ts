import * as simpleIcons from 'simple-icons';

export interface BrandIcon {
  title: string;
  path: string;
  hex: string;
}

const registry = simpleIcons as unknown as Record<string, BrandIcon | undefined>;

/** Technology names used in the project Markdown that have a differently named icon. */
const aliases: Record<string, string> = {
  chromeextensionsapi: 'googlechrome',
  tanstacktable: 'reacttable',
  shadowdom: 'webcomponentsdotorg',
};

/**
 * Best-effort icon for a technology name as written in a project's `stack`
 * ("Next.js" → nextdotjs, "Tailwind CSS" → tailwindcss). Returns null when
 * Simple Icons has no mark for it; the name is shown on its own.
 */
export function stackIcon(name: string): BrandIcon | null {
  const slug = name
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/\./g, 'dot')
    .replace(/[^a-z0-9]/g, '');
  const key = aliases[slug] ?? slug;
  const icon = registry[`si${key.charAt(0).toUpperCase()}${key.slice(1)}`];
  return icon?.path ? icon : null;
}

type Rgb = [number, number, number];

const hexToRgb = (hex: string): Rgb => {
  const value = Number.parseInt(hex.replace('#', ''), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const luminance = ([r, g, b]: Rgb): number => {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as Rgb;
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

const contrast = (a: Rgb, b: Rgb): number => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
};

/** The lightest point of the card gradient the tech icons sit on. */
const CARD_BACKGROUND = hexToRgb('#1d1e25');

/**
 * The brand colour an icon takes on hover, mixed with as little white as
 * possible to reach 3:1 against the card (WCAG's bar for graphics). Computed
 * at build time.
 *
 * Brands whose mark is near-black and colourless (Next.js, GitHub, Vercel,
 * Prisma) have no colour to show on a dark card: lightening them only produces a grey that is
 * dimmer than the icon at rest and reads as "disabled". They keep the text
 * colour on hover instead.
 */
export function brandHoverColor(hex: string): string {
  const brand = hexToRgb(hex);
  const chroma = Math.max(...brand) - Math.min(...brand);
  if (contrast(brand, CARD_BACKGROUND) < 2 && chroma < 48) return 'var(--color-fg)';
  for (let white = 0.3; white <= 1; white += 0.05) {
    const mixed = brand.map((channel) => Math.round(channel * (1 - white) + 255 * white)) as Rgb;
    if (contrast(mixed, CARD_BACKGROUND) >= 3) {
      return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
    }
  }
  return '#ffffff';
}

/**
 * Looks an icon up by its Simple Icons slug (https://simpleicons.org), e.g.
 * `nextdotjs` or `tailwindcss`. Runs at build time only: the page receives
 * the inline SVG path, not the library.
 */
export function brandIcon(slug: string): BrandIcon {
  const key = `si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
  const icon = registry[key];
  if (!icon?.path) {
    throw new Error(
      `Unknown Simple Icons slug "${slug}" (in src/config/profile.ts → techStack). Find the slug at https://simpleicons.org`,
    );
  }
  return icon;
}
