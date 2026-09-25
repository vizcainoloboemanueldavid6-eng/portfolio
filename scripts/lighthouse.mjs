/**
 * Mobile Lighthouse audit of the production build. Prints a score table and
 * exits non-zero if the median of any category on any audited page is below
 * 95 (the spec's bar).
 *
 *   npm run build && npm run audit
 *
 * - Browser: the installed Google Chrome (`channel: 'chrome'`), the browser
 *   people actually use. LH_CHANNEL=chromium uses Playwright's own Chromium.
 * - Runs: 3 passes per page, up to 5 when the passes disagree (a category
 *   straddles 95, or the performance scores spread by more than 5 points).
 *   LH_PASSES=5 runs exactly that many passes on every page instead.
 * - Pages: both home pages and two case studies (see below). LH_URLS takes a
 *   comma-separated list of paths to audit instead, e.g.
 *   LH_URLS=/projects/tabzen/,/es/projects/quicknotes/
 * - Score: the median of ALL passes. Nothing is excluded. Every pass's
 *   performance score and main-thread time is printed next to it, so a run
 *   slowed down by other work on the machine is visible — run it again.
 *
 * HTML reports (last pass per page) and summary.json go to lighthouse/
 * (git-ignored).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import lighthouse from 'lighthouse';
import { chromium } from 'playwright';
import { sampleProjectPages } from './lib/content.mjs';
import { startStaticServer } from './static-server.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const REPORTS = path.join(ROOT, 'lighthouse');
const PORT = Number(process.env.LH_PORT) || 4336;
const DEBUG_PORT = Number(process.env.LH_DEBUG_PORT) || 4339;
const CHANNEL = process.env.LH_CHANNEL || 'chrome';
const THRESHOLD = 95;
const MIN_PASSES = 3;
const MAX_PASSES = 5;
/** 0 = adaptive (3 to 5 passes); any other number = exactly that many passes. */
const FIXED_PASSES = Math.max(0, Math.trunc(Number(process.env.LH_PASSES) || 0));
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];

// The case studies come from the content folder (first project in English,
// last in Spanish), so renaming or removing a project needs no change here.
const samples = await sampleProjectPages();
const pages = process.env.LH_URLS
  ? process.env.LH_URLS.split(',')
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url) => ({ slug: url.replace(/^\/|\/$/g, '').replace(/\W+/g, '-') || 'home', url }))
  : [
      { slug: 'home', url: '/' },
      { slug: 'home-es', url: '/es/' },
      { slug: 'project', url: samples.en },
      { slug: 'project-es', url: samples.es },
    ];

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

/** More passes are worth running when the ones so far do not agree. */
function undecided(passes) {
  for (const key of CATEGORIES) {
    const scores = passes.map((pass) => pass.scores[key]);
    if (Math.min(...scores) < THRESHOLD && Math.max(...scores) >= THRESHOLD) return true;
  }
  const perf = passes.map((pass) => pass.scores.performance);
  return Math.max(...perf) - Math.min(...perf) > 5;
}

async function main() {
  await fs.access(path.join(DIST, 'index.html')).catch(() => {
    throw new Error('No dist/ build — run `npm run build` first.');
  });
  await fs.mkdir(REPORTS, { recursive: true });
  const server = await startStaticServer({ root: DIST, port: PORT });
  const browser = await chromium.launch({
    channel: CHANNEL === 'chromium' ? undefined : CHANNEL,
    args: [`--remote-debugging-port=${DEBUG_PORT}`],
  });
  const version = browser.version();

  const rows = [];
  const failures = [];

  try {
    for (const target of pages) {
      const passes = [];
      while (passes.length < (FIXED_PASSES || MAX_PASSES)) {
        const result = await lighthouse(`http://localhost:${PORT}${target.url}`, {
          port: DEBUG_PORT,
          output: 'html',
          logLevel: 'error',
        });
        if (!result) throw new Error(`Lighthouse returned nothing for ${target.url}`);
        const { lhr, report } = result;
        passes.push({
          scores: Object.fromEntries(
            CATEGORIES.map((key) => [key, Math.round((lhr.categories[key]?.score ?? 0) * 100)]),
          ),
          mainThread: Math.round(lhr.audits['mainthread-work-breakdown']?.numericValue ?? 0),
          fcp: Math.round(lhr.audits['first-contentful-paint']?.numericValue ?? 0),
          lcp: Math.round(lhr.audits['largest-contentful-paint']?.numericValue ?? 0),
          tbt: Math.round(lhr.audits['total-blocking-time']?.numericValue ?? 0),
          cls: lhr.audits['cumulative-layout-shift']?.numericValue ?? 0,
          warnings: lhr.runWarnings ?? [],
        });
        await fs.writeFile(path.join(REPORTS, `${target.slug}.html`), String(report));
        if (!FIXED_PASSES && passes.length >= MIN_PASSES && !undecided(passes)) break;
      }

      const scores = Object.fromEntries(CATEGORIES.map((key) => [key, median(passes.map((p) => p.scores[key]))]));
      const row = {
        page: target.slug,
        url: target.url,
        ...scores,
        fcp: median(passes.map((p) => p.fcp)),
        lcp: median(passes.map((p) => p.lcp)),
        tbt: median(passes.map((p) => p.tbt)),
        cls: median(passes.map((p) => p.cls)),
        passes,
      };
      rows.push(row);
      for (const [key, value] of Object.entries(scores)) {
        if (value < THRESHOLD) failures.push(`${target.slug} · ${key}: ${value}`);
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  await fs.writeFile(
    path.join(REPORTS, 'summary.json'),
    JSON.stringify({ date: new Date().toISOString(), browser: `${CHANNEL} ${version}`, threshold: THRESHOLD, rows }, null, 2),
  );

  const lhVersion = JSON.parse(await fs.readFile(path.join(ROOT, 'node_modules', 'lighthouse', 'package.json'), 'utf8')).version;
  console.log(`\nLighthouse ${lhVersion} · mobile preset · ${CHANNEL} ${version} · median of every pass\n`);
  console.log(['PAGE'.padEnd(11), 'PERF', 'A11Y', 'BEST', ' SEO', '   FCP', '   LCP', '  TBT', '  CLS', '  PASSES (perf / main-thread ms)'].join('  '));
  for (const row of rows) {
    console.log(
      [
        row.page.padEnd(11),
        ...[row.performance, row.accessibility, row['best-practices'], row.seo].map((v) => String(v).padStart(4)),
        `${row.fcp}ms`.padStart(6),
        `${row.lcp}ms`.padStart(6),
        `${row.tbt}ms`.padStart(5),
        row.cls.toFixed(3).padStart(5),
        `  ${row.passes.length}: ${row.passes.map((p) => `${p.scores.performance}/${p.mainThread}`).join(', ')}`,
      ].join('  '),
    );
  }
  const warnings = [...new Set(rows.flatMap((row) => row.passes.flatMap((p) => p.warnings)))];
  if (warnings.length > 0) console.log(`\nLighthouse warnings:\n  - ${warnings.join('\n  - ')}`);

  if (failures.length > 0) {
    console.error(`\nBelow ${THRESHOLD} (median of every pass):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    console.error('If the main-thread times above are much higher than usual, the machine was busy: run it again.');
    process.exit(1);
  }
  console.log(`\nEvery category is ${THRESHOLD}+ on every audited page.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
