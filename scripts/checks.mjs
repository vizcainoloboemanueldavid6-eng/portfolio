/**
 * Behavioural checks against the production build in dist/, in a real
 * (headless) browser. Every acceptance criterion that can be asserted by a
 * machine is asserted here.
 *
 *   npm run build && npm run checks
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { profile } from '../src/config/profile.ts';
import { startStaticServer } from './static-server.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.CHECKS_PORT) || 4335;
const BASE = `http://localhost:${PORT}`;
const SLUGS = ['bella-cucina', 'fitcoach-pro', 'tabzen', 'quicknotes', 'stockflow'];
const TYPES = { 'bella-cucina': 'website', 'fitcoach-pro': 'website', tabzen: 'chrome-extension', quicknotes: 'chrome-extension', stockflow: 'web-app' };
const PAGES = [
  { path: '/', lang: 'en', alt: '/es/' },
  { path: '/es/', lang: 'es', alt: '/' },
  ...SLUGS.flatMap((slug) => [
    { path: `/projects/${slug}/`, lang: 'en', alt: `/es/projects/${slug}/` },
    { path: `/es/projects/${slug}/`, lang: 'es', alt: `/projects/${slug}/` },
  ]),
];

let passed = 0;
const failures = [];

function check(condition, message) {
  if (condition) passed += 1;
  else failures.push(message);
}

async function exists(file) {
  return fs.access(file).then(
    () => true,
    () => false,
  );
}

function distFile(urlPath) {
  const clean = urlPath.split('#')[0];
  return clean.endsWith('/') ? path.join(DIST, clean, 'index.html') : path.join(DIST, clean);
}

async function pngSize(file) {
  const buffer = await fs.readFile(file);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function staticChecks() {
  const html = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');
  const site = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]?.replace(/\/$/, '');
  check(Boolean(site), 'home page has a canonical URL');

  // Sitemap: every page, with its alternates, and no 404.
  const sitemap = await fs.readFile(path.join(DIST, 'sitemap-0.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check(locs.length === PAGES.length, `sitemap lists ${PAGES.length} pages (found ${locs.length})`);
  for (const page of PAGES) {
    check(locs.includes(`${site}${page.path}`), `sitemap contains ${page.path}`);
  }
  check(!sitemap.includes('404'), 'sitemap does not list the 404 page');
  check(
    (sitemap.match(/hreflang="en"/g) ?? []).length === PAGES.length &&
      (sitemap.match(/hreflang="es"/g) ?? []).length === PAGES.length,
    'every sitemap entry links its English and Spanish versions',
  );

  const robots = await fs.readFile(path.join(DIST, 'robots.txt'), 'utf8');
  check(robots.includes(`Sitemap: ${site}/sitemap-index.xml`), 'robots.txt points at the sitemap on the same origin');

  // Generated images.
  for (const lang of ['en', 'es']) {
    const size = await pngSize(path.join(DIST, 'og', `${lang}.png`));
    check(size.width === 1200 && size.height === 630, `og/${lang}.png is 1200×630`);
    for (const slug of SLUGS) {
      const project = await pngSize(path.join(DIST, 'og', lang, `${slug}.png`));
      check(project.width === 1200 && project.height === 630, `og/${lang}/${slug}.png is 1200×630`);
    }
  }
  for (const [file, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
    const actual = await pngSize(path.join(DIST, file));
    check(actual.width === size && actual.height === size, `${file} is ${size}×${size}`);
  }
  const ico = await fs.readFile(path.join(DIST, 'favicon.ico'));
  check(ico.readUInt16LE(2) === 1 && ico.readUInt16LE(4) === 3, 'favicon.ico holds three icon sizes');
  const favicon = await fs.readFile(path.join(DIST, 'favicon.svg'), 'utf8');
  check(favicon.startsWith('<svg') && favicon.includes('<path'), 'favicon.svg is an SVG with the initials as outlines');

  // profile.ts: every field carries the TODO the owner has to act on.
  const source = await fs.readFile(path.join(ROOT, 'src', 'config', 'profile.ts'), 'utf8');
  const body = source.slice(source.indexOf('export const profile'));
  const valueLines = body
    .split('\n')
    .filter((line) => /^\s+[\w]+: (['"\d]|true|false)/.test(line) || /^\s+\],/.test(line));
  const missing = valueLines.filter((line) => !line.includes('// TODO: replace with your real data'));
  check(valueLines.length >= 20 && missing.length === 0, `every profile.ts field has the TODO comment (${missing.length} without)`);
  check(profile.name === 'Mateo Rivas' && profile.username === 'mateobuilds' && profile.email === 'hello@example.com', 'profile.ts holds the Mateo Rivas example');
}

async function pageChecks(browser) {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const errors = [];
  context.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${message.location().url}: ${message.text()}`);
  });
  context.on('requestfailed', (request) => errors.push(`request failed: ${request.url()}`));
  context.on('response', (response) => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  const page = await context.newPage();
  let site = '';

  for (const target of PAGES) {
    const response = await page.goto(`${BASE}${target.path}`, { waitUntil: 'networkidle' });
    check(response?.status() === 200, `${target.path} answers 200`);

    const info = await page.evaluate(() => {
      const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) ?? null;
      return {
        lang: document.documentElement.lang,
        h1: document.querySelectorAll('h1').length,
        title: document.title,
        description: attr('meta[name="description"]', 'content'),
        canonical: attr('link[rel="canonical"]', 'href'),
        alternates: Object.fromEntries(
          [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((link) => [
            link.getAttribute('hreflang'),
            link.getAttribute('href'),
          ]),
        ),
        ogImage: attr('meta[property="og:image"]', 'content'),
        ogUrl: attr('meta[property="og:url"]', 'content'),
        twitter: attr('meta[name="twitter:card"]', 'content'),
        jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
        switchHref: attr('a[data-lang-switch]', 'href'),
        scrollWidth: document.documentElement.scrollWidth,
        preloads: [...document.querySelectorAll('link[rel="preload"][as="font"]')].map((l) => l.getAttribute('href')),
        imagesWithoutAlt: [...document.querySelectorAll('img')].filter((img) => !img.hasAttribute('alt')).length,
      };
    });

    if (!site) site = info.canonical?.replace(/\/$/, '') ?? '';
    check(info.lang === target.lang, `${target.path}: <html lang="${target.lang}"> (got ${info.lang})`);
    check(info.h1 === 1, `${target.path}: exactly one <h1> (got ${info.h1})`);
    check(Boolean(info.title) && info.title.length <= 110, `${target.path}: has a title`);
    check(info.description && info.description.length >= 50 && info.description.length <= 200, `${target.path}: meta description of 50–200 characters`);
    check(info.canonical === `${site}${target.path}`, `${target.path}: canonical is ${site}${target.path} (got ${info.canonical})`);
    check(info.ogUrl === info.canonical, `${target.path}: og:url matches the canonical`);
    const own = target.lang;
    const other = own === 'en' ? 'es' : 'en';
    check(info.alternates[own] === `${site}${target.path}`, `${target.path}: hreflang="${own}" points at itself`);
    check(info.alternates[other] === `${site}${target.alt}`, `${target.path}: hreflang="${other}" points at ${target.alt}`);
    check(info.alternates['x-default'] === `${site}${own === 'en' ? target.path : target.alt}`, `${target.path}: hreflang="x-default" points at the English page`);
    check(await exists(distFile(target.alt)), `${target.path}: its translation ${target.alt} was built`);
    check(info.switchHref === target.alt, `${target.path}: the language switcher leads to ${target.alt} (got ${info.switchHref})`);
    check(Boolean(info.ogImage) && (await exists(distFile(new URL(info.ogImage).pathname))), `${target.path}: og:image exists`);
    check(info.twitter === 'summary_large_image', `${target.path}: Twitter large card`);
    check(info.scrollWidth <= 375, `${target.path}: no horizontal scroll at 375 px (width ${info.scrollWidth})`);
    check(info.imagesWithoutAlt === 0, `${target.path}: every <img> has an alt attribute`);
    for (const href of info.preloads) check(await exists(distFile(href)), `${target.path}: preloaded font ${href} exists`);

    let parsed = [];
    try {
      parsed = info.jsonLd.map((text) => JSON.parse(text));
      passed += 1;
    } catch {
      failures.push(`${target.path}: JSON-LD parses`);
    }
    const serialized = JSON.stringify(parsed);
    check(!/aggregateRating|"review"|"worksFor"|"alumniOf"/.test(serialized), `${target.path}: no ratings, reviews or employers in the structured data`);
    if (target.path === '/' || target.path === '/es/') {
      const person = parsed.find((item) => item['@type'] === 'Person');
      check(person?.name === profile.name && person?.email === `mailto:${profile.email}`, `${target.path}: JSON-LD Person built from profile.ts`);
      check(!person?.sameAs, `${target.path}: placeholder profile links are not published as sameAs`);
    }
  }

  // Internal links resolve to built files.
  const hrefs = new Set();
  for (const target of PAGES) {
    await page.goto(`${BASE}${target.path}`, { waitUntil: 'domcontentloaded' });
    for (const href of await page.$$eval('a[href^="/"]', (links) => links.map((a) => a.getAttribute('href')))) hrefs.add(href);
  }
  for (const href of hrefs) check(await exists(distFile(href)), `internal link ${href} resolves`);

  check(errors.length === 0, `no console errors or failed requests (${errors.slice(0, 3).join(' | ')})`);
  await context.close();
}

async function filterChecks(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

  const visibleTypes = () =>
    page.$$eval('[data-project-grid] > [data-type]', (items) =>
      items.filter((item) => !item.hidden && item.getBoundingClientRect().height > 0).map((item) => item.dataset.type),
    );

  check(await page.isVisible('[data-filter-group]'), 'filter: buttons appear once JavaScript runs');
  check((await visibleTypes()).length === 5, 'filter: all five projects shown at first');

  await page.click('button[data-filter="chrome-extension"]');
  let types = await visibleTypes();
  check(types.length === 2 && types.every((type) => type === 'chrome-extension'), `filter: "Chrome extensions" shows the two extensions (got ${types.join(', ')})`);
  check((await page.getAttribute('button[data-filter="chrome-extension"]', 'aria-pressed')) === 'true', 'filter: the active button is aria-pressed="true"');
  check((await page.getAttribute('button[data-filter="all"]', 'aria-pressed')) === 'false', 'filter: the other buttons are aria-pressed="false"');
  check((await page.textContent('[data-filter-status]'))?.trim() === 'Showing 2 projects', 'filter: the result count is announced');

  // Keyboard only: focus a button and press Enter, then Space.
  await page.focus('button[data-filter="web-app"]');
  await page.keyboard.press('Enter');
  types = await visibleTypes();
  check(types.length === 1 && types[0] === 'web-app', 'filter: Enter on "Web apps" shows the web app');
  check((await page.textContent('[data-filter-status]'))?.trim() === 'Showing 1 project', 'filter: singular announcement');
  await page.focus('button[data-filter="website"]');
  await page.keyboard.press('Space');
  types = await visibleTypes();
  check(types.length === 2 && types.every((type) => type === 'website'), 'filter: Space on "Websites" shows the two websites');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Enter');
  check((await visibleTypes()).length === 5, 'filter: Shift+Tab back to "All" and Enter shows everything');

  // Each card links to its case study.
  const links = await page.$$eval('[data-project-grid] a', (anchors) => anchors.map((a) => a.getAttribute('href')));
  check(SLUGS.every((slug) => links.includes(`/projects/${slug}/`)), 'every card links to /projects/[slug]/');
  const cardTypes = await page.$$eval('[data-project-grid] > [data-type]', (items) =>
    Object.fromEntries(items.map((item) => [item.querySelector('a')?.getAttribute('href'), item.dataset.type])),
  );
  check(SLUGS.every((slug) => cardTypes[`/projects/${slug}/`] === TYPES[slug]), 'every card carries its project type');

  // Honesty: experience lists only the portfolio, each marked as a personal project.
  const experience = await page.$$eval('#experience li', (items) => items.map((item) => item.textContent ?? ''));
  check(experience.length === 5 && experience.every((text) => text.includes('Personal project')), 'experience: the five projects, each labelled "Personal project"');
  const headings = await page.$$eval('h2, h3', (nodes) => nodes.map((node) => node.textContent?.trim() ?? ''));
  check(!headings.some((text) => /testimonial|review|client|trusted by|what people say/i.test(text)), 'no testimonials, reviews or client sections');
  check((await page.$$('form')).length === 0, 'no contact form: the call to action is Fiverr');
  check((await page.getAttribute('#contact .btn-primary', 'href')) === profile.links.fiverr, 'the main contact button goes to Fiverr');
  check((await page.getAttribute('#hero-title ~ div .btn-primary', 'href')) === profile.links.fiverr, '"Hire me on Fiverr" uses the link from profile.ts');

  // Reduced motion: the background stops moving.
  const animation = await page.$eval('.aurora', (el) => getComputedStyle(el).animationName);
  check(animation === 'none', 'prefers-reduced-motion stops the background animation');

  // Language switch keeps the section: /#faq → /es/#faq.
  await page.goto(`${BASE}/#faq`, { waitUntil: 'networkidle' });
  await page.click('header a[data-lang-switch]');
  await page.waitForURL(/\/es\/#faq$/, { timeout: 10000 }).catch(() => {});
  check(page.url() === `${BASE}/es/#faq`, `switching language keeps the section (got ${page.url()})`);
  check((await page.getAttribute('html', 'lang')) === 'es', 'switching language swaps <html lang>');

  // Case study buttons: real links, or a disabled "Coming soon" state for "#".
  await page.goto(`${BASE}/projects/bella-cucina/`, { waitUntil: 'networkidle' });
  const bellaLinks = await page.$$eval('article header a[target="_blank"]', (anchors) => anchors.map((a) => a.href));
  check(bellaLinks.includes('https://bella-cucina-steel.vercel.app/') && bellaLinks.some((href) => href.includes('github.com/vizcainoloboemanueldavid6-eng/bella-cucina')), 'Bella Cucina: live demo and source code link out');
  check(!bellaLinks.some((href) => href.startsWith('https://bella-cucina.vercel.app')), 'Bella Cucina never points at the unrelated bella-cucina.vercel.app');
  await page.goto(`${BASE}/projects/tabzen/`, { waitUntil: 'networkidle' });
  check((await page.$$('article header .btn-disabled')).length === 2, 'TabZen: "Live demo" and "Source code" show the disabled Coming soon state');
  check((await page.$$('article header a[href="#"]')).length === 0, 'no button links to "#"');
  await page.goto(`${BASE}/projects/fitcoach-pro/`, { waitUntil: 'networkidle' });
  check((await page.$$('article header a[href="https://fitcoach-pro-mu.vercel.app"]')).length === 1, 'FitCoach Pro: live demo links to the deployed site');
  check((await page.$$('article header .btn-disabled')).length === 1, 'FitCoach Pro: source code shows Coming soon');

  // Mobile menu opens and closes with the keyboard.
  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const phone = await mobile.newPage();
  await phone.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await phone.focus('[data-mobile-menu] summary');
  await phone.keyboard.press('Enter');
  check(await phone.isVisible('[data-mobile-menu] .menu-panel'), 'mobile menu opens from the keyboard');
  await phone.keyboard.press('Escape');
  check(!(await phone.isVisible('[data-mobile-menu] .menu-panel')), 'mobile menu closes on Escape');
  await mobile.close();
  await context.close();
}

async function noJsChecks(browser) {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  check(!(await page.isVisible('[data-filter-group]')), 'without JavaScript the filter buttons stay hidden');
  const visible = await page.$$eval('[data-project-grid] > [data-type]', (items) => items.filter((item) => item.getBoundingClientRect().height > 0).length);
  check(visible === 5, 'without JavaScript all five projects are shown');
  check(await page.isVisible('#faq details summary'), 'without JavaScript the FAQ still works (native <details>)');
  await context.close();
}

async function notFoundChecks(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const response = await page.goto(`${BASE}/no-such-page/`, { waitUntil: 'load' });
  check(response?.status() === 404, 'unknown URLs get the 404 page with status 404');
  check((await page.textContent('h1'))?.includes('Page not found'), '404 page explains itself');
  check((await page.getAttribute('meta[name="robots"]', 'content'))?.includes('noindex'), '404 page is noindex');
  check((await page.$$('[lang="es"] a[href="/es/"]')).length === 1, '404 page offers the Spanish home');
  await context.close();
}

async function main() {
  if (!(await exists(DIST))) throw new Error('No dist/ folder — run `npm run build` first.');
  const server = await startStaticServer({ root: DIST, port: PORT });
  const browser = await chromium.launch();
  try {
    await staticChecks();
    await pageChecks(browser);
    await filterChecks(browser);
    await noJsChecks(browser);
    await notFoundChecks(browser);
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\n${passed} checks passed.`);
  if (failures.length > 0) {
    console.error(`${failures.length} failed:`);
    for (const failure of failures) console.error(`  ✗ ${failure}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
