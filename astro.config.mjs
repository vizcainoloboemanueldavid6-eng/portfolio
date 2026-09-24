// @ts-check
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

const env = { ...loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), ''), ...process.env };

/**
 * The public origin of the site. Canonical URLs, hreflang links, Open Graph
 * images, the sitemap, robots.txt and the JSON-LD are all built from it.
 *
 * 1. SITE_URL, if you set it (locally in .env, or in your host's settings).
 * 2. On Vercel, the production domain Vercel injects on every build — it follows
 *    a custom domain as soon as you add one.
 * 3. On Netlify, the main site URL Netlify injects.
 * 4. Otherwise an obviously fake address, so nothing ever points at a real
 *    stranger's site by accident.
 */
// TODO: replace with your real data — set SITE_URL to your domain (see README.md)
const FALLBACK_SITE = 'https://mateobuilds.example.com';

const site = (
  env.SITE_URL ||
  (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
  (env.NETLIFY === 'true' && env.URL ? env.URL : '') ||
  FALLBACK_SITE
).replace(/\/+$/, '');

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // The whole stylesheet is small; inlining it removes the only
    // render-blocking request on every page.
    inlineStylesheets: 'always',
  },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      filter: (page) => !/\/404\/?$/.test(page),
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', es: 'es' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
