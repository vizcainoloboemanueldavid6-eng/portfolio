/**
 * Behavioural checks against the production build in dist/, in a real
 * (headless) browser. Every acceptance criterion that a machine can assert is
 * asserted here; the Lighthouse bar lives in scripts/lighthouse.mjs.
 *
 *   npm run build && npm run checks
 *
 * The projects are read from src/content/projects/{en,es}/*.md, so adding,
 * renaming or publishing a project needs no change in this file.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { profile } from '../src/config/profile.ts';
import { startStaticServer } from './static-server.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const CONTENT = path.join(ROOT, 'src', 'content', 'projects');
const PORT = Number(process.env.CHECKS_PORT) || 4335;
const BASE = `http://localhost:${PORT}`;
const LANGS = ['en', 'es'];
const TYPE_ORDER = ['website', 'chrome-extension', 'web-app'];
/** The spec's portfolio: projects 01–05. */
const EXPECTED_PROJECTS = 5;
/** Owner's real deployment of project 01; a stranger owns bella-cucina.vercel.app. */
const FORBIDDEN_HOSTS = ['bella-cucina.vercel.app'];

const STATUS = {
  en: { one: 'Showing 1 project', many: (n) => `Showing ${n} projects` },
  es: { one: 'Mostrando 1 proyecto', many: (n) => `Mostrando ${n} proyectos` },
};
const PERSONAL = { en: 'Personal project', es: 'Proyecto personal' };

/**
 * Wording that would claim experience, clients or social proof that does not
 * exist. A sentence that says the thing is invented (the case studies disclose
 * that the fictional businesses show sample reviews) is a disclosure, not a claim.
 */
const CLAIMS = [
  /testimonial/i,
  /\breviews?\b/i,
  /\bratings?\b/i,
  /trusted by/i,
  /\bclients?\b/i,
  /\bcustomers? (say|love)/i,
  /years? of experience/i,
  /\b\d+\+?\s*years\b/i,
  /\bworked (at|for)\b/i,
  /\bemployers?\b/i,
  /[★⭐]/,
  /\b\d(\.\d)?\s*\/\s*5\b/,
  /\bstars?\b/i,
  /testimonio/i,
  /reseñas?/i,
  /valoraciones/i,
  /\bclientes?\b/i,
  /años de experiencia/i,
  /\btrabaj[ée] (en|para)\b/i,
  /\bestrellas?\b/i,
];
const DISCLOSURE = /invent|fictional|ficticio|ficticia/i;

let passed = 0;
const failures = [];

function check(condition, message) {
  if (condition) passed += 1;
  else failures.push(message);
}

async function exists(file) {
  return fs.stat(file).then(
    (stat) => stat.isFile(),
    () => false,
  );
}

/** URL path (no query, no hash) → file in dist/. */
function distFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0] ?? '');
  return clean.endsWith('/') ? path.join(DIST, clean, 'index.html') : path.join(DIST, clean);
}

async function pngSize(file) {
  const buffer = await fs.readFile(file);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const decodeEntities = (value) =>
  value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/** Minimal frontmatter reader: enough for the flat keys the checks need. */
async function loadProjects(lang) {
  const dir = path.join(CONTENT, lang);
  const files = (await fs.readdir(dir)).filter((file) => file.endsWith('.md'));
  const projects = [];
  for (const file of files) {
    const text = await fs.readFile(path.join(dir, file), 'utf8');
    const front = text.split(/^---\s*$/m)[1] ?? '';
    const field = (key) => {
      const raw = front.match(new RegExp(`^${key}:[ \\t]*(.+)$`, 'm'))?.[1]?.trim() ?? '';
      const quoted = raw.match(/^(['"])(.*?)\1/);
      return quoted ? quoted[2] : raw.split(/\s+#/)[0].trim();
    };
    const shotsBlock = front.split(/^screenshots:/m)[1] ?? '';
    projects.push({
      slug: file.replace(/\.md$/, ''),
      title: field('title'),
      type: field('type'),
      liveUrl: field('liveUrl'),
      repoUrl: field('repoUrl'),
      order: Number(field('order')),
      screenshots: (shotsBlock.split(/^\S/m)[0].match(/^\s+- src:/gm) ?? []).length,
    });
  }
  return projects.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

const PROJECTS = await loadProjects('en');
const PROJECTS_ES = await loadProjects('es');
const SLUGS = PROJECTS.map((project) => project.slug);
const PAGES = [
  { path: '/', lang: 'en', alt: '/es/' },
  { path: '/es/', lang: 'es', alt: '/' },
  ...SLUGS.flatMap((slug) => [
    { path: `/projects/${slug}/`, lang: 'en', alt: `/es/projects/${slug}/` },
    { path: `/es/projects/${slug}/`, lang: 'es', alt: `/projects/${slug}/` },
  ]),
];

/* ------------------------------------------------------------------------ */
/* Files in dist/: sitemap, robots, generated images, links and assets       */
/* ------------------------------------------------------------------------ */

async function contentChecks() {
  check(SLUGS.length === EXPECTED_PROJECTS, `${EXPECTED_PROJECTS} projects in src/content/projects/en (found ${SLUGS.length})`);
  check(
    PROJECTS_ES.length === PROJECTS.length && PROJECTS_ES.every((p) => SLUGS.includes(p.slug)),
    'every project has a Spanish version with the same slug',
  );
  for (const project of PROJECTS) {
    check(TYPE_ORDER.includes(project.type), `${project.slug}: type "${project.type}" is website | chrome-extension | web-app`);
    for (const key of ['liveUrl', 'repoUrl']) {
      const value = project[key];
      check(value === '#' || /^https:\/\//.test(value), `${project.slug}: ${key} is "#" or an https URL (got "${value}")`);
    }
  }

  // profile.ts: every field carries the TODO the owner has to act on.
  const source = await fs.readFile(path.join(ROOT, 'src', 'config', 'profile.ts'), 'utf8');
  const body = source.slice(source.indexOf('export const profile'));
  const valueLines = body
    .split('\n')
    .filter((line) => /^\s+[\w]+: (['"\d]|true|false)/.test(line) || /^\s+\],/.test(line));
  const missing = valueLines.filter((line) => !line.includes('// TODO: replace with your real data'));
  check(valueLines.length >= 20 && missing.length === 0, `every profile.ts field has the TODO comment (${valueLines.length} fields, ${missing.length} without)`);
  check(profile.name === 'Mateo Rivas' && profile.username === 'mateobuilds' && profile.email === 'hello@example.com', 'profile.ts holds the Mateo Rivas example');
  // Placeholder links must not name a stranger's account.
  for (const url of [profile.links.fiverr, profile.links.github, ...Object.values(profile.services).map((s) => s.gigUrl)]) {
    const { pathname } = new URL(url);
    check(pathname.replace(/\/+$/, '') === '' || !url.includes('mateobuilds'), `profile link ${url} is a site root, not a made-up username`);
  }
}

async function staticChecks() {
  const html = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');
  const site = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]?.replace(/\/$/, '') ?? '';
  const origin = site ? new URL(site).origin : '';
  check(/^https?:\/\//.test(site), `home page has an absolute canonical URL (got "${site}")`);

  // Both languages generated for every page.
  for (const page of PAGES) check(await exists(distFile(page.path)), `${page.path} was built`);
  check(await exists(path.join(DIST, '404.html')), '404.html was built');

  // Sitemap: the index points at the file, which lists every page with reciprocal alternates.
  const index = await fs.readFile(path.join(DIST, 'sitemap-index.xml'), 'utf8');
  check(index.includes(`<loc>${site}/sitemap-0.xml</loc>`), 'sitemap-index.xml points at sitemap-0.xml on the same origin');
  const sitemap = await fs.readFile(path.join(DIST, 'sitemap-0.xml'), 'utf8');
  const entries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => {
    const loc = m[1].match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '';
    const alternates = Object.fromEntries(
      [...m[1].matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\s*\/>/g)].map((a) => [a[1], a[2]]),
    );
    return { loc, alternates };
  });
  check(entries.length === PAGES.length, `sitemap lists ${PAGES.length} pages (found ${entries.length})`);
  for (const page of PAGES) {
    const entry = entries.find((e) => e.loc === `${site}${page.path}`);
    check(Boolean(entry), `sitemap contains ${site}${page.path}`);
    if (!entry) continue;
    check(
      entry.alternates[page.lang] === `${site}${page.path}` && entry.alternates[page.lang === 'en' ? 'es' : 'en'] === `${site}${page.alt}`,
      `sitemap: ${page.path} lists itself and ${page.alt} as alternates`,
    );
  }
  check(entries.every((e) => e.loc.startsWith(`${origin}/`) && Object.values(e.alternates).every((href) => href.startsWith(`${origin}/`))), 'sitemap URLs are absolute, on the site origin');
  check(!sitemap.includes('404'), 'sitemap does not list the 404 page');

  const robots = await fs.readFile(path.join(DIST, 'robots.txt'), 'utf8');
  check(robots.includes(`Sitemap: ${site}/sitemap-index.xml`), 'robots.txt points at the sitemap on the same origin');

  // Generated images.
  for (const lang of LANGS) {
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
  const manifest = JSON.parse(await fs.readFile(path.join(DIST, 'site.webmanifest'), 'utf8'));
  for (const icon of manifest.icons ?? []) check(await exists(distFile(icon.src)), `site.webmanifest icon ${icon.src} exists`);

  // Every reference in every built page resolves: links, images, srcsets,
  // scripts, preloads, Open Graph images, CSS url()s and #fragments.
  const htmlFiles = (await walk(DIST)).filter((file) => file.endsWith('.html'));
  const idsCache = new Map();
  const idsOf = async (file) => {
    if (!idsCache.has(file)) {
      const text = await fs.readFile(file, 'utf8');
      idsCache.set(file, new Set([...text.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
    }
    return idsCache.get(file);
  };
  const broken = [];
  const external = new Set();
  let references = 0;
  for (const file of htmlFiles) {
    const text = await fs.readFile(file, 'utf8');
    const rel = path.relative(DIST, file).replace(/\\/g, '/');
    const pagePath = rel === '404.html' ? '/404.html' : `/${rel.replace(/index\.html$/, '')}`;
    const pageUrl = new URL(pagePath, BASE);
    const refs = [];
    for (const m of text.matchAll(/\s(href|src|poster)="([^"]*)"/g)) refs.push(decodeEntities(m[2]));
    for (const m of text.matchAll(/\ssrcset="([^"]*)"/g)) {
      for (const candidate of decodeEntities(m[1]).split(',')) refs.push(candidate.trim().split(/\s+/)[0]);
    }
    for (const m of text.matchAll(/<meta (?:property|name)="(?:og:image|twitter:image)" content="([^"]+)"/g)) refs.push(decodeEntities(m[1]));
    for (const m of text.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
      if (!m[1].startsWith('data:') && !m[1].startsWith('#')) refs.push(m[1]);
    }
    check(!/\shref="#"/.test(text), `${pagePath}: no link points at a bare "#"`);

    for (const ref of refs) {
      if (!ref || ref.startsWith('data:')) continue;
      references += 1;
      if (/^(mailto|tel):/.test(ref)) {
        external.add(ref);
        continue;
      }
      let url;
      try {
        url = new URL(ref, pageUrl);
      } catch {
        broken.push(`${pagePath}: unparsable ${ref}`);
        continue;
      }
      const local = url.origin === BASE || (origin && url.origin === origin);
      if (!local) {
        external.add(url.href);
        continue;
      }
      const target = url.pathname === pagePath && ref.startsWith('#') ? file : distFile(url.pathname);
      if (!(await exists(target))) {
        broken.push(`${pagePath}: ${ref}`);
        continue;
      }
      if (url.hash && target.endsWith('.html') && !(await idsOf(target)).has(decodeURIComponent(url.hash.slice(1)))) {
        broken.push(`${pagePath}: ${ref} (no element with that id)`);
      }
    }
  }
  check(references > 500 && broken.length === 0, `every link, asset and #fragment resolves (${references} references in ${htmlFiles.length} pages; broken: ${broken.slice(0, 5).join(' | ')})`);
  check(![...external].some((href) => FORBIDDEN_HOSTS.some((host) => href.includes(`//${host}`))), `no link to ${FORBIDDEN_HOSTS.join(', ')}`);
  check([...external].every((href) => /^(https:|mailto:)/.test(href)), `external links are https or mailto (${[...external].filter((h) => !/^(https:|mailto:)/.test(h)).join(', ')})`);
  for (const project of PROJECTS) {
    for (const key of ['liveUrl', 'repoUrl']) {
      if (project[key] !== '#') check(external.has(new URL(project[key]).href), `${project.slug}: ${key} ${project[key]} is linked`);
    }
  }

  return site;
}

/* ------------------------------------------------------------------------ */
/* Every page in the browser: SEO, hreflang, overflow, console, honesty      */
/* ------------------------------------------------------------------------ */

async function pageChecks(browser, site) {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const errors = [];
  const warnings = [];
  const expect404 = (url) => url.includes('/no-such-page/');
  context.on('console', (message) => {
    const where = message.location().url;
    if (message.type() === 'error' && !expect404(where)) errors.push(`${where}: ${message.text()}`);
    if (message.type() === 'warning') warnings.push(`${where}: ${message.text()}`);
  });
  context.on('weberror', (error) => errors.push(`uncaught: ${error.error().message}`));
  context.on('requestfailed', (request) => errors.push(`request failed: ${request.url()}`));
  context.on('response', (response) => {
    if (response.status() >= 400 && !expect404(response.url())) errors.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  const page = await context.newPage();
  const seen = new Map();

  for (const target of [...PAGES, { path: '/no-such-page/', lang: 'en', notFound: true }]) {
    const response = await page.goto(`${BASE}${target.path}`, { waitUntil: 'networkidle' });
    check(response?.status() === (target.notFound ? 404 : 200), `${target.path} answers ${target.notFound ? 404 : 200}`);
    // Scroll through the page so lazy images load (and would fail loudly if missing).
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 40));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle');

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
        switchHref: attr('header a[data-lang-switch]', 'href'),
        scrollWidth: document.documentElement.scrollWidth,
        widest: Math.max(...[...document.querySelectorAll('body *')].map((el) => el.getBoundingClientRect().right)),
        imagesWithoutAlt: [...document.querySelectorAll('img')].filter((img) => !img.hasAttribute('alt')).length,
        brokenImages: [...document.querySelectorAll('img')].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
        // Rendered text: block boundaries become line breaks, so sentences split cleanly.
        text: document.body.innerText,
        experience: [...document.querySelectorAll('#experience li')].map((li) => li.textContent ?? ''),
      };
    });

    check(info.scrollWidth <= 375, `${target.path}: no horizontal scroll at 375 px (document width ${info.scrollWidth})`);
    check(info.brokenImages.length === 0, `${target.path}: every image decodes (${info.brokenImages.join(', ')})`);
    check(info.imagesWithoutAlt === 0, `${target.path}: every <img> has an alt attribute`);

    // Honesty: no sentence claims clients, reviews, ratings, employers or years of experience.
    const sentences = info.text.split(/(?<=[.!?])\s+|\n+/).map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const claims = sentences.filter((s) => CLAIMS.some((re) => re.test(s)) && !DISCLOSURE.test(s));
    check(claims.length === 0, `${target.path}: no invented clients, reviews, ratings or experience (${claims.slice(0, 2).join(' | ')})`);

    if (target.notFound) continue;

    check(info.lang === target.lang, `${target.path}: <html lang="${target.lang}"> (got ${info.lang})`);
    check(info.h1 === 1, `${target.path}: exactly one <h1> (got ${info.h1})`);
    check(Boolean(info.title) && info.title.length <= 110, `${target.path}: has a title`);
    check(info.description && info.description.length >= 50 && info.description.length <= 200, `${target.path}: meta description of 50–200 characters`);
    check(info.canonical === `${site}${target.path}`, `${target.path}: canonical is ${site}${target.path} (got ${info.canonical})`);
    check(info.ogUrl === info.canonical, `${target.path}: og:url matches the canonical`);
    const own = target.lang;
    const other = own === 'en' ? 'es' : 'en';
    check(Object.keys(info.alternates).sort().join() === 'en,es,x-default', `${target.path}: hreflang en, es and x-default (got ${Object.keys(info.alternates).join(', ')})`);
    check(Object.values(info.alternates).every((href) => /^https?:\/\//.test(href) && href.startsWith(`${site}/`)), `${target.path}: every hreflang URL is absolute on ${site}`);
    check(info.alternates[own] === `${site}${target.path}`, `${target.path}: hreflang="${own}" points at itself`);
    check(info.alternates[other] === `${site}${target.alt}`, `${target.path}: hreflang="${other}" points at ${target.alt}`);
    check(info.alternates['x-default'] === `${site}${own === 'en' ? target.path : target.alt}`, `${target.path}: hreflang="x-default" points at the English page`);
    check(info.switchHref === target.alt, `${target.path}: the language switcher leads to ${target.alt} (got ${info.switchHref})`);
    check(Boolean(info.ogImage) && /^https?:\/\//.test(info.ogImage) && (await exists(distFile(new URL(info.ogImage).pathname))), `${target.path}: og:image is absolute and exists`);
    check(info.twitter === 'summary_large_image', `${target.path}: Twitter large card`);
    seen.set(info.canonical, { lang: own, alternates: info.alternates });

    let parsed = [];
    try {
      parsed = info.jsonLd.map((text) => JSON.parse(text));
      check(parsed.length > 0 && parsed.every((item) => item['@context'] === 'https://schema.org' && item['@type']), `${target.path}: JSON-LD has @context and @type`);
    } catch {
      failures.push(`${target.path}: JSON-LD parses`);
    }
    const serialized = JSON.stringify(parsed);
    check(!/aggregateRating|"review"|"worksFor"|"alumniOf"|"award"/.test(serialized), `${target.path}: no ratings, reviews, awards or employers in the structured data`);
    if (target.path === '/' || target.path === '/es/') {
      const person = parsed.find((item) => item['@type'] === 'Person');
      check(person?.name === profile.name && person?.email === `mailto:${profile.email}`, `${target.path}: JSON-LD Person built from profile.ts`);
      check(!person?.sameAs, `${target.path}: placeholder profile links are not published as sameAs`);
      check(
        info.experience.length === SLUGS.length &&
          info.experience.every((text) => text.includes(PERSONAL[own]) && !/\b(19|20)\d{2}\b/.test(text)),
        `${target.path}: experience lists only the ${SLUGS.length} projects, each "${PERSONAL[own]}", with no dates`,
      );
    } else {
      const project = parsed.find((item) => item['@type'] === 'CreativeWork');
      check(Boolean(project?.name) && project?.author?.['@id'] === `${site}/#person`, `${target.path}: JSON-LD CreativeWork credits the same Person`);
    }
  }

  // hreflang is reciprocal: if A says its <lang> version is B, B says the same back.
  for (const [url, pageInfo] of seen) {
    for (const lang of LANGS) {
      const target = pageInfo.alternates[lang];
      const back = seen.get(target);
      check(Boolean(back) && back.lang === lang && back.alternates[pageInfo.lang] === url, `hreflang ${url} → ${lang} → back to ${url}`);
    }
  }

  check(errors.length === 0, `zero console errors, uncaught exceptions or failed requests (${errors.slice(0, 3).join(' | ')})`);
  if (warnings.length > 0) console.log(`Console warnings (not failures):\n  ${[...new Set(warnings)].join('\n  ')}`);
  await context.close();
}

/* ------------------------------------------------------------------------ */
/* Work filter, per language                                                  */
/* ------------------------------------------------------------------------ */

async function filterChecks(browser, lang) {
  const home = lang === 'en' ? '/' : '/es/';
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  context.setDefaultTimeout(10000);
  const errors = [];
  context.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  context.on('weberror', (error) => errors.push(error.error().message));
  const page = await context.newPage();
  await page.goto(`${BASE}${home}`, { waitUntil: 'networkidle' });

  const visibleTypes = () =>
    page.$$eval('[data-project-grid] > [data-type]', (items) =>
      items.filter((item) => !item.hidden && item.getBoundingClientRect().height > 0).map((item) => item.dataset.type),
    );
  const status = async () => (await page.textContent('[data-filter-status]'))?.trim();
  const pressed = () => page.$$eval('button[data-filter]', (buttons) => buttons.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.filter));

  check(await page.isVisible('[data-filter-group]'), `${home} filter: buttons appear once JavaScript runs`);
  check((await visibleTypes()).length === SLUGS.length, `${home} filter: all ${SLUGS.length} projects shown at first`);
  const filters = await page.$$eval('button[data-filter]', (buttons) => buttons.map((b) => b.dataset.filter));
  const presentTypes = TYPE_ORDER.filter((type) => PROJECTS.some((p) => p.type === type));
  check(filters.join() === ['all', ...presentTypes].join(), `${home} filter: one button per project type, plus "All" (got ${filters.join(', ')})`);
  check((await page.getAttribute('[data-filter-group]', 'role')) === 'group' && Boolean(await page.getAttribute('[data-filter-group]', 'aria-label')), `${home} filter: a labelled group`);

  // Mouse: each type shows exactly its own cards.
  for (const type of presentTypes) {
    const expected = PROJECTS.filter((p) => p.type === type).length;
    await page.click(`button[data-filter="${type}"]`);
    const types = await visibleTypes();
    check(types.length === expected && types.every((t) => t === type), `${home} filter: "${type}" shows its ${expected} project(s) only (got ${types.join(', ')})`);
    check((await pressed()).join() === type, `${home} filter: only "${type}" is aria-pressed`);
    check((await status()) === (expected === 1 ? STATUS[lang].one : STATUS[lang].many(expected)), `${home} filter: the count is announced for "${type}" (got "${await status()}")`);
  }

  // Keyboard only: Tab reaches the buttons, Enter and Space press them.
  await page.click('button[data-filter="all"]');
  // Start from the section heading (made focusable for the test only).
  await page.evaluate(() => {
    const heading = document.querySelector('#work h2');
    if (heading instanceof HTMLElement) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  });
  await page.keyboard.press('Tab');
  check((await page.evaluate(() => document.activeElement?.getAttribute('data-filter'))) === 'all', `${home} filter: Tab from the heading reaches "All" first`);
  const [first, second] = presentTypes;
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  let types = await visibleTypes();
  check(types.length > 0 && types.every((t) => t === first), `${home} filter: Tab + Enter selects "${first}"`);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  types = await visibleTypes();
  check(types.length > 0 && types.every((t) => t === second), `${home} filter: Tab + Space selects "${second}"`);
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Enter');
  check((await visibleTypes()).length === SLUGS.length && (await pressed()).join() === 'all', `${home} filter: Shift+Tab back to "All" and Enter shows everything`);
  check(
    await page.evaluate(() => {
      const el = document.activeElement;
      return el instanceof HTMLElement && getComputedStyle(el).outlineStyle !== 'none';
    }),
    `${home} filter: the focused button shows a focus outline`,
  );

  // Each card links to its case study and carries its type.
  const cards = await page.$$eval('[data-project-grid] > [data-type]', (items) =>
    items.map((item) => ({ type: item.dataset.type, href: item.querySelector('a')?.getAttribute('href') })),
  );
  const prefix = lang === 'en' ? '' : '/es';
  check(
    cards.length === SLUGS.length && PROJECTS.every((p, i) => cards[i]?.href === `${prefix}/projects/${p.slug}/` && cards[i]?.type === p.type),
    `${home}: cards follow the project order, link to ${prefix}/projects/[slug]/ and carry their type`,
  );
  check(errors.length === 0, `${home} filter: no console errors (${errors.join(' | ')})`);
  await context.close();
}

/* ------------------------------------------------------------------------ */
/* Home page behaviour, project pages, navigation                             */
/* ------------------------------------------------------------------------ */

async function behaviourChecks(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  context.setDefaultTimeout(10000);
  const errors = [];
  context.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  context.on('weberror', (error) => errors.push(error.error().message));
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

  const headings = await page.$$eval('h2, h3', (nodes) => nodes.map((node) => node.textContent?.trim() ?? ''));
  check(!headings.some((text) => /testimonial|review|client|trusted by|what people say/i.test(text)), 'no testimonials, reviews or client sections');
  check((await page.$$('form')).length === 0, 'no contact form: the call to action is Fiverr');
  check((await page.getAttribute('#contact .btn-primary', 'href')) === profile.links.fiverr, 'the main contact button goes to Fiverr');
  check((await page.getAttribute('#hero-title ~ div .btn-primary', 'href')) === profile.links.fiverr, '"Hire me on Fiverr" uses the link from profile.ts');
  check((await page.$$('#services a[href]')).length === 3, 'three service cards, each with a gig button');
  check((await page.$$('#process li')).length === 4, 'process: four steps');
  check((await page.$$('#faq details')).length === 6, 'FAQ: six questions');

  // Language switch keeps the section: /#faq → /es/#faq.
  await page.goto(`${BASE}/#faq`, { waitUntil: 'networkidle' });
  await page.click('header a[data-lang-switch]');
  await page.waitForURL(/\/es\/#faq$/).catch(() => {});
  check(page.url() === `${BASE}/es/#faq`, `switching language keeps the section (got ${page.url()})`);
  check((await page.getAttribute('html', 'lang')) === 'es', 'switching language swaps <html lang>');

  // Client-side navigation (View Transitions): card → case study → other language → back.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const firstProject = PROJECTS[0];
  await page.click(`[data-project-grid] a[href="/projects/${firstProject.slug}/"]`);
  await page.waitForURL(`${BASE}/projects/${firstProject.slug}/`);
  await page.waitForLoadState('networkidle');
  check((await page.textContent('h1'))?.trim() === firstProject.title, `client-side navigation opens the ${firstProject.title} case study`);
  check((await page.title()).startsWith(firstProject.title), 'client-side navigation updates the document title');
  check((await page.getAttribute('link[rel="canonical"]', 'href'))?.endsWith(`/projects/${firstProject.slug}/`), 'client-side navigation updates the canonical');
  await page.click('header a[data-lang-switch]');
  await page.waitForURL(`${BASE}/es/projects/${firstProject.slug}/`);
  check((await page.getAttribute('html', 'lang')) === 'es', 'the switcher on a case study opens its Spanish version');
  await page.goBack();
  await page.waitForURL(`${BASE}/projects/${firstProject.slug}/`);
  await page.goBack();
  await page.waitForURL(`${BASE}/`);
  await page.waitForLoadState('networkidle');
  await page.click('button[data-filter="web-app"]').catch(() => {});
  const afterBack = await page.$$eval('[data-project-grid] > [data-type]', (items) => items.filter((i) => !i.hidden).length);
  check(afterBack === PROJECTS.filter((p) => p.type === 'web-app').length, 'the filter still works after navigating back through the client router');

  // Case study pages: the sections the spec asks for, and honest buttons.
  for (const lang of LANGS) {
    const list = lang === 'en' ? PROJECTS : PROJECTS_ES;
    for (const [i, project] of list.entries()) {
      const url = `${BASE}${lang === 'en' ? '' : '/es'}/projects/${project.slug}/`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const info = await page.evaluate(() => ({
        cover: Boolean(document.querySelector('article img[fetchpriority="high"]')),
        sections: ['problem-title', 'solution-title', 'features-title', 'stack-title'].every((id) => document.getElementById(id)),
        features: document.querySelectorAll('#features-title ~ ul li').length,
        stack: document.querySelectorAll('#stack-title ~ ul li').length,
        figures: document.querySelectorAll('#screenshots-title ~ div figure').length,
        live: [...document.querySelectorAll('article header a[target="_blank"]')].map((a) => ({ href: a.getAttribute('href'), rel: a.getAttribute('rel') })),
        disabled: document.querySelectorAll('article header .btn-disabled').length,
        pager: [...document.querySelectorAll('nav .pager')].map((a) => a.getAttribute('href')),
        cta: document.querySelector('#cta-title')?.closest('section')?.querySelector('a')?.getAttribute('href'),
        personal: document.querySelector('article dl')?.textContent ?? '',
      }));
      const where = `${lang === 'en' ? '' : '/es'}/projects/${project.slug}/`;
      check(info.cover && info.sections && info.features >= 3 && info.stack >= 3, `${where}: cover, problem, solution, features and stack`);
      check(info.figures === project.screenshots, `${where}: ${project.screenshots} screenshot(s) shown`);
      const expectedLinks = [project.liveUrl, project.repoUrl].filter((u) => u !== '#');
      check(
        info.live.length === expectedLinks.length && expectedLinks.every((u) => info.live.some((l) => l.href === u && l.rel?.includes('noopener'))),
        `${where}: "Live demo" / "Source code" link to ${expectedLinks.join(' and ') || 'nothing yet'}`,
      );
      check(info.disabled === 2 - expectedLinks.length, `${where}: every "#" link shows the disabled "Coming soon" state`);
      check(info.personal.includes(PERSONAL[lang]), `${where}: labelled "${PERSONAL[lang]}"`);
      check(info.cta === profile.links.fiverr, `${where}: the call to action goes to Fiverr`);
      const expectedPager = [list[i - 1], list[i + 1]].filter(Boolean).map((p) => `${lang === 'en' ? '' : '/es'}/projects/${p.slug}/`);
      check(info.pager.join() === expectedPager.join(), `${where}: previous/next links`);
    }
  }

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

  check(errors.length === 0, `behaviour checks: no console errors (${errors.join(' | ')})`);
  await context.close();
}

/* ------------------------------------------------------------------------ */
/* Reduced motion                                                             */
/* ------------------------------------------------------------------------ */

async function motionChecks(browser) {
  const measure = async (reducedMotion, url) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion });
    const page = await context.newPage();
    await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);
    const result = await page.evaluate(() => {
      const running = document.getAnimations().filter((a) => a.playState === 'running');
      const seconds = (value) => Math.max(...value.split(',').map((v) => parseFloat(v) * (v.trim().endsWith('ms') ? 0.001 : 1)));
      const transitions = [...document.querySelectorAll('body *')].map((el) => seconds(getComputedStyle(el).transitionDuration));
      return {
        running: running.map((a) => (a instanceof CSSAnimation ? a.animationName : a.constructor.name)),
        infinite: running.filter((a) => a.effect?.getTiming().iterations === Infinity).length,
        aurora: getComputedStyle(document.querySelector('.aurora')).animationName,
        longestTransition: Math.max(...transitions),
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      };
    });
    await context.close();
    return result;
  };

  // The control: without a preference, things do move (otherwise the checks below prove nothing).
  const normal = await measure('no-preference', '/');
  check(normal.infinite > 0 && normal.aurora !== 'none', `without a preference the background and avatar ring animate (${normal.running.join(', ')})`);
  check(normal.scrollBehavior === 'smooth', 'without a preference in-page links scroll smoothly');

  for (const url of ['/', '/es/', `/projects/${SLUGS[0]}/`, `/es/projects/${SLUGS.at(-1)}/`]) {
    const reduced = await measure('reduce', url);
    check(reduced.running.length === 0, `${url} prefers-reduced-motion: no animation is running (got ${reduced.running.join(', ')})`);
    check(reduced.aurora === 'none', `${url} prefers-reduced-motion stops the background animation`);
    check(reduced.longestTransition <= 0.001, `${url} prefers-reduced-motion: transitions are instant (longest ${reduced.longestTransition}s)`);
    check(reduced.scrollBehavior === 'auto', `${url} prefers-reduced-motion: no smooth scrolling`);
  }
}

/* ------------------------------------------------------------------------ */
/* Without JavaScript, and the 404 page                                       */
/* ------------------------------------------------------------------------ */

async function noJsChecks(browser) {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  for (const home of ['/', '/es/']) {
    await page.goto(`${BASE}${home}`, { waitUntil: 'load' });
    check(!(await page.isVisible('[data-filter-group]')), `${home} without JavaScript: the filter buttons stay hidden`);
    const visible = await page.$$eval('[data-project-grid] > [data-type]', (items) => items.filter((item) => item.getBoundingClientRect().height > 0).length);
    check(visible === SLUGS.length, `${home} without JavaScript: all ${SLUGS.length} project cards are visible (got ${visible})`);
    check(await page.isVisible('#faq details summary'), `${home} without JavaScript: the FAQ still works (native <details>)`);
  }
  await page.goto(`${BASE}/projects/${SLUGS[0]}/`, { waitUntil: 'load' });
  check(await page.isVisible('article h1'), 'case studies render without JavaScript');
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
  if (!(await exists(path.join(DIST, 'index.html')))) throw new Error('No dist/ build — run `npm run build` first.');
  const server = await startStaticServer({ root: DIST, port: PORT });
  const browser = await chromium.launch();
  try {
    await contentChecks();
    const site = await staticChecks();
    await pageChecks(browser, site);
    for (const lang of LANGS) await filterChecks(browser, lang);
    await behaviourChecks(browser);
    await motionChecks(browser);
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
