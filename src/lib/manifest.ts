import { profile } from '../config/profile';
import type { Lang } from '../i18n/ui';
import { localizePath } from '../i18n/utils';

/**
 * The web app manifest for one language: /site.webmanifest (English) and
 * /es/site.webmanifest (Spanish). Each page links the one in its own language,
 * so the name a browser shows when the site is installed or pinned is never
 * English on the Spanish pages.
 */
export function webManifest(lang: Lang): Response {
  const home = localizePath(lang, '/');
  return new Response(
    JSON.stringify(
      {
        id: home,
        name: `${profile.name} · ${profile.jobTitle[lang]}`,
        short_name: profile.username,
        lang,
        dir: 'ltr',
        start_url: home,
        display: 'browser',
        background_color: '#0b0c10',
        theme_color: '#0b0c10',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
}

export function manifestPath(lang: Lang): string {
  return `${localizePath(lang, '/')}site.webmanifest`;
}
