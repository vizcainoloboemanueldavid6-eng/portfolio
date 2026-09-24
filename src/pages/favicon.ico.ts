import type { APIRoute } from 'astro';
import { iconIco } from '../lib/brand-images';

/** Fallback for browsers and tools that only ask for /favicon.ico (16, 32 and 48 px). */
export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await iconIco([16, 32, 48])), {
    headers: { 'Content-Type': 'image/x-icon' },
  });
