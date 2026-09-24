/**
 * Full-page screenshots at 375 px and 1440 px into docs/, taken from the
 * production build. Fails if a page logs a console error or a request fails.
 *
 *   npm run build && npm run shots
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { sampleProjectPages } from './lib/content.mjs';
import { startStaticServer } from './static-server.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const DOCS = path.join(ROOT, 'docs');
const PORT = Number(process.env.SHOTS_PORT) || 4333;

// Case studies from the content folder: the first project in English, the last in Spanish.
const samples = await sampleProjectPages();
const pages = [
  { name: 'home', url: '/' },
  { name: 'home-es', url: '/es/' },
  { name: 'project', url: samples.en },
  { name: 'project-es', url: samples.es },
  { name: '404', url: '/this-page-does-not-exist/' },
];

const viewports = [
  { label: '375', width: 375, height: 812 },
  { label: '1440', width: 1440, height: 900 },
];

async function main() {
  await fs.access(DIST).catch(() => {
    throw new Error('No dist/ folder — run `npm run build` first.');
  });
  await fs.mkdir(DOCS, { recursive: true });

  const server = await startStaticServer({ root: DIST, port: PORT });
  const browser = await chromium.launch();
  const problems = [];

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
        locale: 'en-US',
      });
      context.on('console', (message) => {
        // The 404 page is *meant* to answer 404, and Chrome logs that document status.
        const expected404 = message.location().url.includes('this-page-does-not-exist');
        if (message.type() === 'error' && !expected404) problems.push(`console: ${message.text()}`);
      });
      context.on('requestfailed', (request) => problems.push(`request failed: ${request.url()}`));
      context.on('response', (response) => {
        const expected404 = response.url().includes('this-page-does-not-exist');
        if (response.status() >= 400 && !expected404) {
          problems.push(`HTTP ${response.status()}: ${response.url()}`);
        }
      });

      const page = await context.newPage();
      for (const target of pages) {
        await page.goto(`http://localhost:${PORT}${target.url}`, { waitUntil: 'networkidle' });
        // A full-page capture paints sticky elements wherever the viewport is.
        await page.addStyleTag({ content: 'header { position: static !important; }' });
        // Lazy images below the fold: scroll through the page so they load.
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 120));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(300);

        const file = path.join(DOCS, `${target.name}-${viewport.label}.jpg`);
        await page.screenshot({ path: file, fullPage: true, type: 'jpeg', quality: 80 });
        console.log(`  ${path.relative(ROOT, file)}`);
      }
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (problems.length > 0) {
    console.error('\nProblems found while capturing:');
    for (const problem of [...new Set(problems)]) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log('\nNo console errors, no failed requests.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
