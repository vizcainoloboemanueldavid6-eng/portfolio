/**
 * JSON-LD built only from profile.ts and the project Markdown. Nothing here is
 * invented: no employer, no ratings, no reviews. Profile links that are still
 * placeholders (a bare https://github.com/) are left out of `sameAs`.
 */
import { profile } from '../config/profile';
import { isPlaceholderUrl } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

export function personId(site: URL): string {
  return new URL('/#person', site).href;
}

export function personJsonLd(site: URL, lang: Lang, description: string): Record<string, unknown> {
  const sameAs = [profile.links.fiverr, profile.links.github].filter((url) => !isPlaceholderUrl(url));
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId(site),
    name: profile.name,
    alternateName: profile.username,
    jobTitle: profile.jobTitle[lang],
    description,
    url: new URL(lang === 'en' ? '/' : `/${lang}/`, site).href,
    email: `mailto:${profile.email}`,
    image: profile.photo
      ? new URL(profile.photo, site).href
      : new URL('/icon-512.png', site).href,
    knowsAbout: profile.knowsAbout[lang],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

interface ProjectLd {
  title: string;
  summary: string;
  url: URL;
  image: URL;
  stack: string[];
  liveUrl: string;
  repoUrl: string;
  lang: Lang;
  site: URL;
}

export function projectJsonLd(project: ProjectLd): Record<string, unknown> {
  const sameAs = [project.liveUrl, project.repoUrl].filter((url) => url !== '#');
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    url: project.url.href,
    image: project.image.href,
    inLanguage: project.lang,
    keywords: project.stack.join(', '),
    author: { '@type': 'Person', '@id': personId(project.site), name: profile.name },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}
