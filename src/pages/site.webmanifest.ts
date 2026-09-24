import type { APIRoute } from 'astro';
import { webManifest } from '../lib/manifest';

export const GET: APIRoute = () => webManifest('en');
