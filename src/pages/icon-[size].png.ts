import type { APIRoute, GetStaticPaths } from 'astro';
import { iconPng } from '../lib/brand-images';

/** /icon-192.png and /icon-512.png, referenced by site.webmanifest and the JSON-LD. */
export const getStaticPaths = (() => [
  { params: { size: '192' } },
  { params: { size: '512' } },
]) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) =>
  new Response(new Uint8Array(await iconPng(Number(params.size))), {
    headers: { 'Content-Type': 'image/png' },
  });
