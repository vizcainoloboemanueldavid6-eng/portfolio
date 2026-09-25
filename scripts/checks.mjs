/**
 * Behavioural checks against the production build in dist/, in a real
 * (headless) browser. Every acceptance criterion that a machine can assert is
 * asserted here; the Lighthouse bar lives in scripts/lighthouse.mjs.
 *
 *   npm run build && npm run checks
 *
 * The projects are read from src/content/projects/{en,es}/*.md, so adding,
 * renaming or publishing a project needs no change in this file. (Going below
 * the spec's five projects does: lower MIN_PROJECTS.)
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { profile } from '../src/config/profile.ts';
import imageManifest from '../src/data/images.json' with { type: 'json' };
import { resolveImage, selectImage } from '../src/lib/images.ts';
import { loadProjects } from './lib/content.mjs';
import { placeholderSvg, PLACEHOLDERS } from './placeholders.mjs';
import { startStaticServer } from './static-server.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.CHECKS_PORT) || 4335;
const BASE = `http://localhost:${PORT}`;
const LANGS = ['en', 'es'];
const TYPE_ORDER = ['website', 'chrome-extension', 'web-app'];
/** The spec's portfolio: projects 01–05. More is fine. */
const MIN_PROJECTS = 5;
/** Owner's real deployment of project 01; a stranger owns bella-cucina.vercel.app. */
const FORBIDDEN_HOSTS = ['bella-cucina.vercel.app'];

const STATUS = {
  en: { one: 'Showing 1 project', many: (n) => `Showing ${n} projects` },
  es: { one: 'Mostrando 1 proyecto', many: (n) => `Mostrando ${n} proyectos` },
};
const PERSONAL = { en: 'Personal project', es: 'Proyecto personal' };
/** Default live button text, and the status line of a published project, per type. */
const LIVE_DEFAULT = { en: 'Live demo', es: 'Demo en vivo' };
const STATUS_LIVE = {
  en: { default: 'Live', 'chrome-extension': 'Released' },
  es: { default: 'Publicado', 'chrome-extension': 'Publicada' },
};
/** Demo logins must never be printed on the site: a reserved-.test address or a "password:" line. */
const CREDENTIALS = [/[\w.+-]+@[\w-]+\.test\b/i, /\b(password|passwd|contraseña)\s*[:=]/i];

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
  check(SLUGS.length >= MIN_PROJECTS, `at least ${MIN_PROJECTS} projects in src/content/projects/en (found ${SLUGS.length})`);
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

  // Project repositories on GitHub belong to the owner's GitHub profile (or, while
  // the profile is still the example, at least to one single account).
  const accountOf = (url) => new URL(url).pathname.split('/').filter(Boolean)[0]?.toLowerCase() ?? '';
  const githubRepos = PROJECTS.filter((p) => p.repoUrl !== '#' && new URL(p.repoUrl).hostname === 'github.com');
  const profileAccount = accountOf(profile.links.github);
  const repoAccounts = [...new Set(githubRepos.map((p) => accountOf(p.repoUrl)))];
  if (profileAccount) {
    check(repoAccounts.every((account) => account === profileAccount), `every GitHub repoUrl is on profile.links.github's account "${profileAccount}" (found ${repoAccounts.join(', ')})`);
  } else {
    check(repoAccounts.length <= 1, `GitHub repoUrls all belong to one account (found ${repoAccounts.join(', ')})`);
  }

  // Cover placeholders: the project name and colour only (no English label on
  // Spanish pages), and the committed SVGs are what the generator makes today.
  for (const item of PLACEHOLDERS) {
    const file = path.join(ROOT, 'public', 'projects', item.slug, 'cover.svg');
    if (!(await exists(file))) continue;
    const svg = await fs.readFile(file, 'utf8');
    check(svg === placeholderSvg(item), `public/projects/${item.slug}/cover.svg is up to date with scripts/placeholders.mjs`);
    const textPaths = (svg.match(/<path /g) ?? []).length - 1; // minus the dot grid
    check(textPaths === 1, `${item.slug} placeholder shows the name only, no language-specific label (${textPaths} text line(s))`);
  }

  // A project whose screenshots are in media/ uses them: the cover and every
  // screenshot are optimised images, and the SVG placeholder is only a fallback.
  for (const lang of LANGS) {
    for (const project of lang === 'en' ? PROJECTS : PROJECTS_ES) {
      if (!(await fs.stat(path.join(ROOT, 'media', 'projects', project.slug)).catch(() => null))) continue;
      const front = (await fs.readFile(path.join(ROOT, 'src', 'content', 'projects', lang, `${project.slug}.md`), 'utf8')).split(/^---\s*$/m)[1] ?? '';
      const images = [project.cover, ...[...front.matchAll(/^\s+- src: (\S+)/gm)].map((m) => m[1])];
      const plain = images.filter((src) => Boolean(resolveImage(src).avif));
      check(
        images.length > 1 && plain.length === images.length && project.screenshots === images.length - 1,
        `${lang}/${project.slug}: cover and ${images.length - 1} screenshot(s) are optimised images from media/ (${images.filter((src) => !resolveImage(src).avif).join(', ') || 'all'})`,
      );
    }
  }

  // Optimised images: the variants are used only for the unchanged plain .webp
  // that `npm run images` wrote. A cover replaced by hand (README "Forma rápida")
  // must be served as it is, never hidden behind the old variants.
  const entries = Object.entries(imageManifest);
  check(entries.length > 0 && entries.every(([, entry]) => /^[0-9a-f]{16}$/.test(entry.hash ?? '')), 'every src/data/images.json entry records the hash of its plain .webp');
  for (const [key, entry] of entries) {
    const file = path.join(ROOT, 'public', `${key}.webp`);
    const hash = (await exists(file)) ? createHash('sha256').update(await fs.readFile(file)).digest('hex').slice(0, 16) : null;
    const resolved = resolveImage(`${key}.webp`);
    const optimised = Boolean(resolved.avif) && resolved.src === `${key}-${entry.width}.webp`;
    check(optimised === (hash === entry.hash), `${key}.webp: ${hash === entry.hash ? 'unchanged, served through its variants' : 'changed by hand, served as it is'}`);
  }
  const [sampleKey, sampleEntry] = entries[0] ?? [];
  if (sampleKey) {
    const replaced = selectImage(`${sampleKey}.webp`, sampleEntry, '0000000000000000');
    check(replaced.src === `${sampleKey}.webp` && !replaced.avif && !replaced.webp, 'a hand-replaced .webp is served as it is, not through its old variants');
    const png = selectImage(`${sampleKey}.png`, sampleEntry, sampleEntry.hash);
    check(png.src === `${sampleKey}.png` && !png.avif, 'a .png with the same name as an optimised image is served as it is');
    const same = selectImage(`${sampleKey}.webp`, sampleEntry, sampleEntry.hash);
    check(Boolean(same.avif) && same.width === sampleEntry.width, 'the unchanged plain .webp gets its AVIF/WebP srcset and real size');
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
  for (const lang of LANGS) {
    const file = lang === 'en' ? 'site.webmanifest' : `${lang}/site.webmanifest`;
    const manifest = await fs.readFile(path.join(DIST, file), 'utf8').then(JSON.parse, () => ({}));
    for (const icon of manifest.icons ?? []) check(await exists(distFile(icon.src)), `${file} icon ${icon.src} exists`);
    const home = lang === 'en' ? '/' : `/${lang}/`;
    check(
      manifest.lang === lang && manifest.start_url === home && manifest.name === `${profile.name} · ${profile.jobTitle[lang]}`,
      `${file} is in ${lang}: lang, start_url ${home} and the ${lang} job title (got ${manifest.lang}, ${manifest.start_url}, "${manifest.name}")`,
    );
  }

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
    check(!CREDENTIALS.some((re) => re.test(text)), `${pagePath}: no demo login (e-mail or password) is printed`);

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
        manifest: attr('link[rel="manifest"]', 'href'),
        avatarDots: document.querySelectorAll('.avatar-dot').length,
        availableBadge: document.querySelectorAll('.status-dot').length,
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

    if (target.notFound) {
      // Like the canonical, og:url is left out: /404/ is not a page anyone can open.
      check(info.ogUrl === null && info.canonical === null, `${target.path} (404): no og:url and no canonical (got ${info.ogUrl})`);
      continue;
    }

    check(info.lang === target.lang, `${target.path}: <html lang="${target.lang}"> (got ${info.lang})`);
    check(info.manifest === (target.lang === 'en' ? '/site.webmanifest' : `/${target.lang}/site.webmanifest`), `${target.path}: links the ${target.lang} web app manifest (got ${info.manifest})`);
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
      check(JSON.stringify(person?.knowsAbout) === JSON.stringify(profile.knowsAbout[own]), `${target.path}: JSON-LD knowsAbout is the ${own} list from profile.ts`);
      check(
        info.avatarDots === (profile.available ? 1 : 0) && info.availableBadge === (profile.available ? 1 : 0),
        `${target.path}: the "available" badge and the avatar's online dot both follow profile.available (${profile.available}; dots ${info.avatarDots}, badges ${info.availableBadge})`,
      );
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
        liveText: document.querySelector('article header a.btn-primary')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
        status: document.querySelector('article dl > div:last-child dd')?.textContent?.trim() ?? '',
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
      if (project.liveUrl !== '#') {
        const label = project.liveLabel || LIVE_DEFAULT[lang];
        check(info.liveText.startsWith(label), `${where}: the live button says "${label}" (got "${info.liveText}")`);
        const status = STATUS_LIVE[lang][project.type] ?? STATUS_LIVE[lang].default;
        check(info.status === status, `${where}: status "${status}" (got "${info.status}")`);
      }
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
/* Section links, language switch and history, with smooth scrolling on       */
/* ------------------------------------------------------------------------ */

/** The scroll-padding-top in global.css (4.5rem): where a section's top lands. */
const SECTION_TOP = 72;

/** Waits until #id has stopped moving on screen (smooth scrolling done) and returns its top. */
async function settledTop(page, id) {
  return page.evaluate(
    (targetId) =>
      new Promise((resolve) => {
        const started = performance.now();
        let last = Number.NaN;
        let still = 0;
        const tick = () => {
          const el = document.getElementById(targetId);
          const top = el ? Math.round(el.getBoundingClientRect().top) : Number.NaN;
          still = top === last && top < window.innerHeight ? still + 1 : 0;
          last = top;
          if (still >= 25 || performance.now() - started > 8000) resolve(top);
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    id,
  );
}

async function navigationChecks(browser) {
  const sample = PROJECTS.at(-1);
  const errors = [];

  for (const viewport of [
    { width: 375, height: 812 },
    { width: 1440, height: 900 },
  ]) {
    // Default motion on purpose: smooth scrolling is where the offsets went wrong.
    const context = await browser.newContext({ viewport });
    context.setDefaultTimeout(15000);
    context.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
    context.on('weberror', (error) => errors.push(error.error().message));
    const page = await context.newPage();
    const w = viewport.width;

    // One offset only (scroll-padding), not scroll-padding + scroll-margin.
    const direct = {};
    for (const id of ['process', 'faq', 'contact']) {
      await page.goto(`${BASE}/#${id}`, { waitUntil: 'networkidle' });
      direct[id] = await settledTop(page, id);
    }
    check(Math.abs(direct.process - SECTION_TOP) <= 2 && Math.abs(direct.faq - SECTION_TOP) <= 2, `${w}px: /#process and /#faq land ${SECTION_TOP}px from the top, just under the header (got ${direct.process}, ${direct.faq})`);

    // From a case study to a home section below the Work filter, through the
    // client router: must land exactly where a direct load lands.
    for (const id of ['process', 'faq', 'contact']) {
      await page.goto(`${BASE}/projects/${sample.slug}/`, { waitUntil: 'networkidle' });
      if (w < 1024) await page.click('[data-mobile-menu] summary');
      await page.locator(`header a[href="/#${id}"]:visible`).first().click();
      await page.waitForURL(`${BASE}/#${id}`).catch(() => {});
      const top = await settledTop(page, id);
      check(page.url() === `${BASE}/#${id}` && Math.abs(top - direct[id]) <= 3, `${w}px: header link from a case study to /#${id} lands where a direct load does (${top} vs ${direct[id]}, at ${page.url().replace(BASE, '')})`);
    }

    // Switching language from a section keeps the visitor on that section.
    await page.goto(`${BASE}/es/#faq`, { waitUntil: 'networkidle' });
    await settledTop(page, 'faq');
    await page.click('header a[data-lang-switch]');
    await page.waitForURL(`${BASE}/#faq`).catch(() => {});
    const switched = await settledTop(page, 'faq');
    check(page.url() === `${BASE}/#faq` && Math.abs(switched - direct.faq) <= 3, `${w}px: /es/#faq → English lands on the FAQ like a direct load (${switched} vs ${direct.faq})`);

    // Focusing something in the sticky header (Tab, or a click on Menu) must
    // not scroll the page: the header is always in view.
    const scrollY = () => page.evaluate(() => Math.round(window.scrollY));
    const before = await scrollY();
    const jumps = [];
    if (w < 1024) {
      const summary = await page.locator('[data-mobile-menu] summary').boundingBox();
      if (summary) await page.mouse.click(summary.x + summary.width / 2, summary.y + summary.height / 2);
      await page.waitForTimeout(300);
      const y = await scrollY();
      if (Math.abs(y - before) > 2) jumps.push(`Menu click: ${before} → ${y}`);
      await page.keyboard.press('Escape');
    }
    await page.evaluate(() => document.querySelector('header a')?.focus({ preventScroll: true }));
    let tabs = 0;
    for (; tabs < 12; tabs += 1) {
      await page.keyboard.press('Tab');
      if (!(await page.evaluate(() => Boolean(document.activeElement?.closest('header'))))) break;
      await page.waitForTimeout(150);
      const y = await scrollY();
      if (Math.abs(y - before) > 2) jumps.push(`Tab ${tabs + 1}: ${before} → ${y}`);
    }
    check(before > 1000 && tabs >= 2 && jumps.length === 0, `${w}px: focusing header items (menu click, ${tabs} Tabs) does not scroll the page (${jumps.join(', ') || `stays at ${before}`})`);
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  context.setDefaultTimeout(15000);
  context.on('weberror', (error) => errors.push(error.error().message));
  const page = await context.newPage();

  // The switch carries the section being read now, not the last #hash in the URL.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.click('#hero-title ~ div a[href="#work"]');
  await page.waitForURL(`${BASE}/#work`);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(200);
  await page.click('footer a[data-lang-switch]');
  await page.waitForURL(/\/es\/(#.*)?$/);
  const lastSection = await page.evaluate(() => [...document.querySelectorAll('main section[id]')].at(-1)?.id);
  check(page.url() === `${BASE}/es/#${lastSection}`, `after jumping to #work and scrolling to the bottom, the switch leads to /es/#${lastSection} (got ${page.url().replace(BASE, '')})`);

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.getElementById('faq')?.scrollIntoView());
  await page.click('header a[data-lang-switch]');
  await page.waitForURL(/\/es\/(#.*)?$/);
  check(page.url() === `${BASE}/es/#faq`, `scrolled to the FAQ without a #hash, the switch leads to /es/#faq (got ${page.url().replace(BASE, '')})`);

  await page.goto(`${BASE}/es/`, { waitUntil: 'networkidle' });
  await page.click('header a[data-lang-switch]');
  await page.waitForURL(/localhost:\d+\/(#.*)?$/);
  check(page.url() === `${BASE}/`, `from the top of /es/ the switch leads to / with no section (got ${page.url().replace(BASE, '')})`);

  // Back to a #hash entry the router did not create (typed into the address bar).
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.goto(`${BASE}/#faq`);
  const nullState = await page.evaluate(() => history.state === null);
  await page.click(`[data-project-grid] a[href="/projects/${PROJECTS[0].slug}/"]`);
  await page.waitForURL(`${BASE}/projects/${PROJECTS[0].slug}/`);
  await page.waitForLoadState('networkidle');
  await page.goBack();
  await page.waitForURL(`${BASE}/#faq`);
  // The fix reloads the page, so the document may be replaced while this looks.
  let restored = false;
  for (let i = 0; i < 50 && !restored; i += 1) {
    await page.waitForTimeout(100);
    restored = await page
      .evaluate(() => Boolean(document.getElementById('hero-title') && document.querySelector('[data-project-grid]')))
      .catch(() => false);
  }
  check(nullState && restored, `Back to a typed /#faq entry shows the home page again, not the case study (state null: ${nullState}, home shown: ${restored})`);

  check(errors.length === 0, `navigation checks: no console errors (${errors.slice(0, 3).join(' | ')})`);
  await context.close();
}

/* ------------------------------------------------------------------------ */
/* Header: fits every width, readable over bright content, labels in names   */
/* ------------------------------------------------------------------------ */

function luminance([r, g, b]) {
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

async function headerChecks(browser) {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const widths = [320, 360, 375, 414, 640, 700, 768, 800, 820, 834, 900, 1000, 1024, 1100, 1280, 1440];

  for (const url of ['/', '/es/', `/es/projects/${SLUGS[0]}/`]) {
    await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
    const overflow = [];
    for (const width of widths) {
      await page.setViewportSize({ width, height: 800 });
      const worst = await page.evaluate(() => {
        const limit = document.documentElement.clientWidth;
        let right = 0;
        for (const el of document.querySelectorAll('header *')) {
          const box = el.getBoundingClientRect();
          if (box.width > 1 && box.height > 1 && !el.closest('.menu-panel')) right = Math.max(right, box.right);
        }
        return right - limit;
      });
      if (worst > 0.5) overflow.push(`${width}px +${Math.round(worst)}`);
    }
    check(overflow.length === 0, `${url}: every header item fits from 320 to 1440 px (overflow at ${overflow.join(', ')})`);
  }

  // The translucent header over the brightest possible content (white): the
  // muted nav links must still reach 4.5:1.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/es/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const white = document.createElement('div');
    white.style.cssText = 'position:fixed;inset:0 0 auto 0;height:240px;background:#fff;z-index:30';
    document.body.append(white);
  });
  await page.waitForTimeout(100);
  const link = page.locator('header nav a').first();
  const box = await link.boundingBox();
  const textColor = await link.evaluate((el) => getComputedStyle(el).color.match(/\d+/g).slice(0, 3).map(Number));
  if (box) {
    const shot = await page.screenshot({ clip: { x: Math.round(box.x) + 3, y: Math.round(box.y) + 3, width: 1, height: 1 } });
    const { default: sharp } = await import('sharp');
    const pixel = [...(await sharp(shot).removeAlpha().raw().toBuffer())].slice(0, 3);
    const ratio = contrast(textColor, pixel);
    check(ratio >= 4.5, `header nav links keep ${ratio.toFixed(2)}:1 (≥ 4.5) over white content scrolling under the header (background rgb(${pixel.join(', ')}))`);
  } else {
    failures.push('header nav link not found for the contrast check');
  }

  // Label in Name (WCAG 2.5.3): the visible text of the logo and the language
  // switcher is part of their accessible name, at every size.
  for (const [width, url] of [
    [320, '/'],
    [375, '/es/'],
    [375, '/'],
    [1440, '/'],
    [1440, '/es/'],
  ]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
    for (const selector of ['header a[data-lang-switch]', 'header a.group']) {
      const locator = page.locator(selector).first();
      const snapshot = await locator.ariaSnapshot();
      const name = (snapshot.match(/^- link "([^"]*)"/m)?.[1] ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
      const visible = (
        await locator.evaluate((el) => {
          const parts = [];
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const node = walker.currentNode;
            const parent = node.parentElement;
            if (!parent || !node.textContent?.trim()) continue;
            const style = getComputedStyle(parent);
            const rect = parent.getBoundingClientRect();
            const hidden = style.display === 'none' || style.visibility === 'hidden' || (rect.width <= 1 && rect.height <= 1);
            if (!hidden && parent.checkVisibility()) parts.push(node.textContent.trim());
          }
          return parts.join(' ');
        })
      )
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
      // Whole words: "es" inside "español" does not count.
      const inName = new RegExp(`(^|\\s)${visible.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`).test(name);
      check(Boolean(visible) && inName, `${url} at ${width}px: ${selector} shows "${visible}" and its accessible name "${name}" contains it`);
    }
  }
  await context.close();
}

/** The local server survives malformed requests (it serves checks, audit and shots). */
async function serverChecks() {
  const bad = await fetch(`${BASE}/%E0%A4%A`);
  check(bad.status === 400, `static server answers 400 to a malformed %-escape (got ${bad.status})`);
  const outside = await fetch(`${BASE}/..%2f..%2fpackage.json`);
  check(outside.status === 404, `static server never serves files outside dist/ (got ${outside.status})`);
  const home = await fetch(`${BASE}/`);
  check(home.status === 200, 'static server still answers after a bad request');
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
    await navigationChecks(browser);
    await headerChecks(browser);
    await serverChecks();
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
