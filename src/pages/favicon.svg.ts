import type { APIRoute } from 'astro';
import { iconSvg } from '../lib/brand-images';

/** The initials from profile.ts, drawn as outlines so they look the same everywhere. */
export const GET: APIRoute = () =>
  new Response(iconSvg(64), { headers: { 'Content-Type': 'image/svg+xml' } });
