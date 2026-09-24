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
