/**
 * Reads the project Markdown (src/content/projects/<lang>/*.md) for the
 * scripts, so none of them hard-codes a slug: adding, renaming or removing a
 * project needs no change in checks.mjs, lighthouse.mjs or screenshots.mjs.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const CONTENT = path.resolve(import.meta.dirname, '..', '..', 'src', 'content', 'projects');

/** Minimal frontmatter reader: enough for the flat keys the scripts need. */
export async function loadProjects(lang) {
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
      cover: field('cover'),
      order: Number(field('order')),
      screenshots: (shotsBlock.split(/^\S/m)[0].match(/^\s+- src:/gm) ?? []).length,
    });
  }
  return projects.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

/**
 * The two case studies the audit and the screenshots use: the first project in
 * the grid (in English) and the last one (in Spanish), so both a project with
 * real screenshots and one further down the list are covered.
 */
export async function sampleProjectPages() {
  const projects = await loadProjects('en');
  const first = projects[0];
  const last = projects.at(-1);
  if (!first || !last) throw new Error('No projects in src/content/projects/en/.');
  return { en: `/projects/${first.slug}/`, es: `/es/projects/${last.slug}/` };
}
