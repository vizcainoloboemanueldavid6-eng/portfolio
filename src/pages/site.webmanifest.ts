import type { APIRoute } from 'astro';
import { profile } from '../config/profile';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: `${profile.name} · ${profile.jobTitle.en}`,
        short_name: profile.username,
        start_url: '/',
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
