import { getCollection, type CollectionEntry } from 'astro:content';
import { langs } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

export type ProjectEntry = CollectionEntry<'projects'>;

export interface Project {
  slug: string;
  lang: Lang;
  entry: ProjectEntry;
  data: ProjectEntry['data'];
}

function split(id: string): { lang: string; slug: string } {
  const [lang = '', ...rest] = id.split('/');
  return { lang, slug: rest.join('/') };
}

let checked = false;

/**
 * Every project must exist in every language with the same slug, type and
 * order — otherwise the language switcher would lead to a 404. The build
 * stops with a readable message instead.
 */
async function assertTranslations(): Promise<void> {
  if (checked) return;
  const all = await getCollection('projects');
  const bySlug = new Map<string, Map<string, ProjectEntry>>();
  for (const entry of all) {
    const { lang, slug } = split(entry.id);
    if (!bySlug.has(slug)) bySlug.set(slug, new Map());
    bySlug.get(slug)?.set(lang, entry);
  }
  const problems: string[] = [];
  for (const [slug, versions] of bySlug) {
    for (const lang of langs) {
      if (!versions.has(lang)) problems.push(`"${slug}" is missing src/content/projects/${lang}/${slug}.md`);
    }
    const [first, ...others] = [...versions.values()];
    for (const other of others) {
      if (!first) break;
      for (const key of ['type', 'order', 'cover', 'liveUrl', 'repoUrl'] as const) {
        if (first.data[key] !== other.data[key]) {
          problems.push(`"${slug}": "${key}" differs between ${first.id} and ${other.id}`);
        }
      }
      // The label is translated, but one language cannot say "Install" while the other says "Live demo".
      if (Boolean(first.data.liveLabel) !== Boolean(other.data.liveLabel)) {
        problems.push(`"${slug}": "liveLabel" is set in only one of ${first.id} and ${other.id}`);
      }
    }
  }
  if (problems.length > 0) {
    throw new Error(`Project translations are out of sync:\n  - ${problems.join('\n  - ')}`);
  }
  checked = true;
}

export async function getProjects(lang: Lang): Promise<Project[]> {
  await assertTranslations();
  const entries = await getCollection('projects', (entry) => split(entry.id).lang === lang);
  return entries
    .map((entry) => ({ slug: split(entry.id).slug, lang, entry, data: entry.data }))
    .sort((a, b) => a.data.order - b.data.order || a.slug.localeCompare(b.slug));
}

export function isPublished(url: string): boolean {
  return url !== '#';
}
