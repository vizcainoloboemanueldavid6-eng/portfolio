/**
 * Every piece of personal data on the site comes from this file: the hero, the
 * services prices, the contact links, the footer, the JSON-LD `Person`, the
 * favicon initials and the generated Open Graph images.
 *
 * The values below are an EXAMPLE profile ("Mateo Rivas"). Replace each one
 * marked TODO with your own details, then run `npm run build`.
 *
 * Links that still point at a site's home page (https://www.fiverr.com/,
 * https://github.com/) are treated as placeholders: they are never published
 * as `sameAs` in the structured data.
 */

export type ServiceId = 'websites' | 'extensions' | 'webapps';

export interface Service {
  /** Starting price in US dollars, shown as "from $X". */
  fromPrice: number;
  /** Shortest usual delivery time, in days. */
  deliveryDays: number;
  /** Link to the matching Fiverr gig. */
  gigUrl: string;
}

export interface Profile {
  name: string;
  firstName: string;
  username: string;
  jobTitle: { en: string; es: string };
  email: string;
  /** Path under public/ (e.g. '/avatar.webp') or empty for the generated initials. */
  photo: string;
  /** Two letters used by the avatar placeholder and the favicon. */
  initials: string;
  available: boolean;
  responseHours: number;
  supportDays: number;
  links: { fiverr: string; github: string };
  services: Record<ServiceId, Service>;
  /** Simple Icons slugs (https://simpleicons.org) shown in the Tech stack section. */
  techStack: string[];
  /** Topics for the JSON-LD `knowsAbout` property, in each language. */
  knowsAbout: { en: string[]; es: string[] };
}

export const profile: Profile = {
  name: 'Mateo Rivas', // TODO: replace with your real data
  firstName: 'Mateo', // TODO: replace with your real data
  username: 'mateobuilds', // TODO: replace with your real data
  jobTitle: {
    en: 'Freelance web developer', // TODO: replace with your real data
    es: 'Desarrollador web freelance', // TODO: replace with your real data
  },
  email: 'hello@example.com', // TODO: replace with your real data
  photo: '', // TODO: replace with your real data — e.g. '/avatar.webp' (square, 400×400)
  initials: 'MR', // TODO: replace with your real data
  available: true, // TODO: replace with your real data — false hides the "available" badge and the avatar's green dot
  responseHours: 24, // TODO: replace with your real data
  supportDays: 30, // TODO: replace with your real data
  links: {
    fiverr: 'https://www.fiverr.com/', // TODO: replace with your real data — your Fiverr profile URL
    github: 'https://github.com/', // TODO: replace with your real data — your GitHub profile URL
  },
  services: {
    websites: {
      fromPrice: 150, // TODO: replace with your real data
      deliveryDays: 4, // TODO: replace with your real data
      gigUrl: 'https://www.fiverr.com/', // TODO: replace with your real data — your website gig URL
    },
    extensions: {
      fromPrice: 200, // TODO: replace with your real data
      deliveryDays: 5, // TODO: replace with your real data
      gigUrl: 'https://www.fiverr.com/', // TODO: replace with your real data — your Chrome extension gig URL
    },
    webapps: {
      fromPrice: 450, // TODO: replace with your real data
      deliveryDays: 10, // TODO: replace with your real data
      gigUrl: 'https://www.fiverr.com/', // TODO: replace with your real data — your web app gig URL
    },
  },
  techStack: [
    'html5',
    'css',
    'javascript',
    'typescript',
    'react',
    'nextdotjs',
    'astro',
    'preact',
    'tailwindcss',
    'nodedotjs',
    'vite',
    'vitest',
    'prisma',
    'postgresql',
    'zod',
    'googlechrome',
    'git',
    'github',
    'vercel',
    'netlify',
  ], // TODO: replace with your real data
  knowsAbout: {
    en: [
      'Web development',
      'Landing pages',
      'Chrome extensions',
      'Web applications',
      'TypeScript',
      'React',
      'Next.js',
      'Astro',
      'Accessibility',
      'Technical SEO',
    ], // TODO: replace with your real data
    es: [
      'Desarrollo web',
      'Landing pages',
      'Extensiones de Chrome',
      'Aplicaciones web',
      'TypeScript',
      'React',
      'Next.js',
      'Astro',
      'Accesibilidad',
      'SEO técnico',
    ], // TODO: replace with your real data
  },
};
