import { profile } from '../config/profile';
import { defaultLang, languages, ui, type Lang, type UiStrings } from './ui';

export const langs = Object.keys(languages) as Lang[];

/** Values every string may reference, all taken from profile.ts. */
const profileVars: Record<string, string | number> = {
  name: profile.name,
  firstName: profile.firstName,
  username: profile.username,
  responseHours: profile.responseHours,
  supportDays: profile.supportDays,
  websitesDays: profile.services.websites.deliveryDays,
  extensionsDays: profile.services.extensions.deliveryDays,
  webappsDays: profile.services.webapps.deliveryDays,
};

/** Replaces `{key}` placeholders. Unknown keys are left visible so they get noticed. */
export function fill(template: string, vars: Record<string, string | number> = {}): string {
  const all = { ...profileVars, ...vars };
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in all ? String(all[key]) : match,
  );
}

export function useTranslations(lang: Lang): UiStrings {
  return ui[lang];
}

/** Builds a path for a language: `('es', '/projects/x/')` → `/es/projects/x/`. */
export function localizePath(lang: Lang, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return lang === defaultLang ? clean : `/${lang}${clean}`;
}

export function formatPrice(amount: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-US', {
    maximumFractionDigits: 0,
    useGrouping: amount >= 10000,
  }).format(amount);
}

/**
 * A link is a placeholder while it still points at a site's home page — for
 * example `https://github.com/` before the owner fills in their username.
 */
export function isPlaceholderUrl(url: string): boolean {
  if (!url || url === '#') return true;
  try {
    return new URL(url).pathname.replace(/\/+$/, '') === '';
  } catch {
    return true;
  }
}
