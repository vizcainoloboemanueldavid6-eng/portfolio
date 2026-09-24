/**
 * Mobile Lighthouse audit of the production build. Prints a score table and
 * exits non-zero if any category of any page is below 95 (the spec's bar).
 *
 *   npm run build && npm run audit
 *
 * HTML reports are written to lighthouse/ (git-ignored).
 *
 * Performance on a laptop is noisy: Total Blocking Time moves with whatever
 * else the CPU is doing. A static page does the same main-thread work on every
 * load, so a pass that needed far more main-thread time than the best pass of
 * the same page was slowed down by the machine, not by the site. Those passes
 * are excluded — and printed, never hidden — and the median of the remaining
 * clean passes is reported. If there are not enough clean passes, the script
 * says so instead of printing a number.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import lighthouse from 'lighthouse';
import { chromium } from 'playwright';
import { startStaticServer } from './static-server.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const REPORTS = path.join(ROOT, 'lighthouse');
const PORT = Number(process.env.LH_PORT) || 4336;
const DEBUG_PORT = Number(process.env.LH_DEBUG_PORT) || 4339;
const THRESHOLD = 95;
const MIN_PASSES = Number(process.env.LH_PASSES) || 3;
const MAX_PASSES = Math.max(MIN_PASSES, Number(process.env.LH_MAX_PASSES) || 7);
const CLEAN_PASSES = Math.min(3, MIN_PASSES);
const INFLATION = 1.5;
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];

const pages = [
  { slug: 'home', url: '/' },
  { slug: 'home-es', url: '/es/' },
  { slug: 'project', url: '/projects/bella-cucina/' },
  { slug: 'project-es', url: '/es/projects/tabzen/' },
];

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

async function main() {
  await fs.access(DIST).catch(() => {
    throw new Error('No dist/ folder — run `npm run build` first.');
  });
  await fs.mkdir(REPORTS, { recursive: true });
  const server = await startStaticServer({ root: DIST, port: PORT });
  const browser = await chromium.launch({
    channel: process.env.LH_CHANNEL || undefined,
    args: [`--remote-debugging-port=${DEBUG_PORT}`, '--no-sandbox'],
  });

  const rows = [];
  const notes = [];
  const failures = [];
  const unreliable = [];

  try {
    for (const target of pages) {
      const passes = [];
      let clean = [];
      let best = Infinity;

      while (passes.length < MAX_PASSES) {
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
          lcp: Math.round(lhr.audits['largest-contentful-paint']?.numericValue ?? 0),
          tbt: Math.round(lhr.audits['total-blocking-time']?.numericValue ?? 0),
          cls: lhr.audits['cumulative-layout-shift']?.numericValue ?? 0,
        });
        await fs.writeFile(path.join(REPORTS, `${target.slug}.html`), String(report));

        best = Math.min(...passes.map((pass) => pass.mainThread));
        clean = passes.filter((pass) => pass.mainThread <= best * INFLATION);
        if (passes.length >= MIN_PASSES && clean.length >= CLEAN_PASSES) break;
      }

      const contended = passes.filter((pass) => !clean.includes(pass));
      if (contended.length > 0) {
        notes.push(
          `${target.slug}: ${contended.length} of ${passes.length} passes excluded as contended ` +
            `(main thread ${contended.map((pass) => pass.mainThread).join(', ')} ms vs best ${best} ms; ` +
            `their performance scores: ${contended.map((pass) => pass.scores.performance).join(', ')})`,
        );
      }
      if (clean.length < CLEAN_PASSES) {
        unreliable.push(target.slug);
        rows.push({ page: target.slug, busy: true, clean: clean.length, total: passes.length });
        continue;
      }

      const scores = Object.fromEntries(
        CATEGORIES.map((key) => [key, median(clean.map((pass) => pass.scores[key]))]),
      );
      const vitals = {
        lcp: median(clean.map((pass) => pass.lcp)),
        tbt: median(clean.map((pass) => pass.tbt)),
        cls: median(clean.map((pass) => pass.cls)),
      };
      rows.push({ page: target.slug, ...scores, ...vitals, clean: clean.length, total: passes.length });
      for (const [key, value] of Object.entries(scores)) {
        if (value < THRESHOLD) failures.push(`${target.slug} · ${key}: ${value}`);
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\nLighthouse (mobile preset) — median of uncontended passes\n`);
  console.log(['PAGE'.padEnd(11), 'PERF', 'A11Y', 'BEST', ' SEO', '   LCP', '  TBT', '  CLS', 'PASSES'].join('  '));
  for (const row of rows) {
    const cells = row.busy
      ? ['busy', 'busy', 'busy', 'busy', '     -', '    -', '    -']
      : [
          ...[row.performance, row.accessibility, row['best-practices'], row.seo].map((v) => String(v).padStart(4)),
          `${row.lcp}ms`.padStart(6),
          `${row.tbt}ms`.padStart(5),
          row.cls.toFixed(3).padStart(5),
        ];
    console.log([row.page.padEnd(11), ...cells, `${row.clean}/${row.total} clean`].join('  '));
  }
  if (notes.length > 0) {
    console.log('\nNotes:');
    for (const note of notes) console.log(`  - ${note}`);
  }
  if (failures.length > 0) {
    console.error(`\nBelow ${THRESHOLD}:`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  if (unreliable.length > 0) {
    console.error(`\nNo reliable score for: ${unreliable.join(', ')} — the machine was too busy. Run again.`);
    process.exit(2);
  }
  console.log(`\nEvery category is ${THRESHOLD}+ on every audited page.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
