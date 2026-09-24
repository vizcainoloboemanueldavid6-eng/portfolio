import type { APIRoute, GetStaticPaths } from 'astro';
import type { Lang } from '../../i18n/ui';
import { langs, useTranslations } from '../../i18n/utils';
import { ogHomePng } from '../../lib/brand-images';

/** /og/en.png and /og/es.png — the social card for the home page and the 404. */
export const getStaticPaths = (() => langs.map((lang) => ({ params: { lang } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang as Lang;
  const png = await ogHomePng(lang, useTranslations(lang).meta.ogTagline);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
