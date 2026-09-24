/**
 * Turns the screenshots in media/projects/<slug>/ into the responsive images
 * the site serves from public/projects/<slug>/.
 *
 *   npm run images
 *
 * For every media/projects/<slug>/<name>.(png|jpg|jpeg|webp) it writes
 *   public/projects/<slug>/<name>-640.avif  <name>-640.webp
 *   public/projects/<slug>/<name>-960.avif  <name>-960.webp
 *   public/projects/<slug>/<name>-1280.avif <name>-1280.webp
 *   public/projects/<slug>/<name>.webp      (the largest size, the plain fallback)
 * — never upscaling — and records the sizes in src/data/images.json, which is
 * what lets <ProjectImage> print a correct srcset, width and height.
 *
 * In the Markdown, reference the image by its plain fallback:
 *   cover: /projects/<slug>/<name>.webp
 *
 * Screenshots are best at 16:10 (for example 1440×900); other ratios work, the
 * cards crop them to 16:10 from the top.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const MEDIA = path.join(ROOT, 'media', 'projects');
const PUBLIC = path.join(ROOT, 'public', 'projects');
const MANIFEST = path.join(ROOT, 'src', 'data', 'images.json');
const WIDTHS = [640, 960, 1280];
const SOURCE = /\.(png|jpe?g|webp)$/i;

async function exists(file) {
  return fs.access(file).then(
    () => true,
    () => false,
  );
}

async function main() {
  if (!(await exists(MEDIA))) {
    console.error('Nothing to do: media/projects/ does not exist.');
    process.exit(1);
  }

  const manifest = {};
  let count = 0;

  for (const slug of (await fs.readdir(MEDIA)).sort()) {
    const sourceDir = path.join(MEDIA, slug);
    if (!(await fs.stat(sourceDir)).isDirectory()) continue;
    const outDir = path.join(PUBLIC, slug);
    await fs.mkdir(outDir, { recursive: true });

    for (const file of (await fs.readdir(sourceDir)).sort()) {
      if (!SOURCE.test(file)) continue;
      const name = path.parse(file).name.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
      const input = path.join(sourceDir, file);
      const meta = await sharp(input).metadata();
      if (!meta.width || !meta.height) throw new Error(`Cannot read the size of ${input}`);

      const widths = WIDTHS.filter((width) => width < meta.width);
      const largest = Math.min(meta.width, WIDTHS.at(-1));
      if (!widths.includes(largest)) widths.push(largest);

      for (const width of widths) {
        const resized = sharp(input).resize({ width, withoutEnlargement: true });
        await resized
          .clone()
          .avif({ quality: 55, effort: 6 })
          .toFile(path.join(outDir, `${name}-${width}.avif`));
        await resized
          .clone()
          .webp({ quality: 78, effort: 6 })
          .toFile(path.join(outDir, `${name}-${width}.webp`));
      }
      await fs.copyFile(
        path.join(outDir, `${name}-${largest}.webp`),
        path.join(outDir, `${name}.webp`),
      );

      const height = Math.round((meta.height * largest) / meta.width);
      manifest[`/projects/${slug}/${name}`] = { width: largest, height, widths };
      count += 1;
      console.log(`  ${slug}/${name}  ${widths.join(', ')} px`);
    }
  }

  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });
  await fs.writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\n${count} images → public/projects/, sizes in src/data/images.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
