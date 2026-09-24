import type { APIRoute } from 'astro';
import { iconPng } from '../lib/brand-images';

/** 180×180 for iOS home screens. iOS rounds the corners itself, so the icon is full-bleed. */
export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await iconPng(180, { fullBleed: true })), {
    headers: { 'Content-Type': 'image/png' },
  });
