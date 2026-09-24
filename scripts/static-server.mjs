/**
 * Minimal static server for ./dist, shared by the screenshot, checks and
 * Lighthouse scripts. It compresses text responses and sets long-lived caching
 * on hashed assets, as Vercel, Netlify and every other static host do —
 * measuring without that would report a slower site than the one people get.
 * Unknown paths get dist/404.html with a 404 status, like on those hosts.
 */
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const brotli = promisify(zlib.brotliCompress);
const gzip = promisify(zlib.gzip);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};

const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.webmanifest', '.xml', '.txt', '.svg']);

export async function startStaticServer({ root, port }) {
  async function resolveFile(urlPath) {
    const clean = decodeURIComponent(new URL(urlPath, 'http://localhost').pathname);
    const candidates = clean.endsWith('/')
      ? [path.join(root, clean, 'index.html')]
      : [path.join(root, clean), path.join(root, clean, 'index.html')];
    for (const candidate of candidates) {
      if (!candidate.startsWith(root)) continue;
      try {
        if ((await fs.stat(candidate)).isFile()) return candidate;
      } catch {
        /* try the next candidate */
      }
    }
    return null;
  }

  const server = http.createServer(async (request, response) => {
    let file = await resolveFile(request.url ?? '/');
    let status = 200;
    if (!file) {
      file = path.join(root, '404.html');
      status = 404;
    }

    const extension = path.extname(file);
    const headers = {
      'Content-Type': TYPES[extension] ?? 'application/octet-stream',
      'Cache-Control': file.includes(`${path.sep}_astro${path.sep}`)
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=0, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    };

    let body = await fs.readFile(file);
    const accepted = String(request.headers['accept-encoding'] ?? '');
    if (COMPRESSIBLE.has(extension)) {
      if (accepted.includes('br')) {
        body = await brotli(body);
        headers['Content-Encoding'] = 'br';
      } else if (accepted.includes('gzip')) {
        body = await gzip(body);
        headers['Content-Encoding'] = 'gzip';
      }
      headers.Vary = 'Accept-Encoding';
    }

    headers['Content-Length'] = body.length;
    response.writeHead(status, headers);
    response.end(request.method === 'HEAD' ? undefined : body);
  });

  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  return server;
}

// `node scripts/static-server.mjs` serves dist/ on http://localhost:4332 until stopped.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT) || 4332;
  const root = path.resolve(import.meta.dirname, '..', 'dist');
  await startStaticServer({ root, port });
  console.log(`Serving ${root} on http://localhost:${port}`);
}
