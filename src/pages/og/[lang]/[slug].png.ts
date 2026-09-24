import type { APIRoute, GetStaticPaths } from 'astro';
import { langs, useTranslations } from '../../../i18n/utils';
import { ogProjectPng } from '../../../lib/brand-images';
import { getProjects } from '../../../lib/projects';

/** /og/<lang>/<slug>.png — one social card per project and language, with its cover. */
export const getStaticPaths = (async () => {
  const paths = [];
  for (const lang of langs) {
    const t = useTranslations(lang);
    for (const project of await getProjects(lang)) {
      paths.push({
        params: { lang, slug: project.slug },
        props: {
          title: project.data.title,
          tagline: project.data.tagline,
          cover: project.data.cover,
          kicker: `${t.meta.ogKicker} · ${t.work.types[project.data.type]}`,
        },
      });
    }
  }
  return paths;
}) satisfies GetStaticPaths;

interface Props {
  title: string;
  tagline: string;
  cover: string;
  kicker: string;
}

export const GET: APIRoute<Props> = async ({ props }) => {
  const png = await ogProjectPng(props);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
