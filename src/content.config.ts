import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** `#` means "not published yet": the page shows a disabled "Coming soon" button. */
const linkOrPending = z.union([
  z.literal('#'),
  z.url().refine((value) => value.startsWith('https://'), {
    message: 'Use a full https:// URL, or # if it is not published yet',
  }),
]);

/** Files under public/projects/<slug>/, e.g. `/projects/tabzen/cover.svg`. */
const publicImage = z
  .string()
  .regex(/^\/projects\/[a-z0-9-]+\/[\w.-]+\.(svg|webp|avif|png|jpe?g)$/, {
    message:
      'Images must live in public/projects/<slug>/ and be referenced as /projects/<slug>/<file>',
  });

/**
 * One Markdown file per project and language: src/content/projects/en/<slug>.md
 * and src/content/projects/es/<slug>.md. The Markdown body is optional and is
 * rendered as a "Behind the build" section on the project page.
 */
const projects = defineCollection({
  loader: glob({ pattern: '{en,es}/*.md', base: './src/content/projects' }),
  schema: z.strictObject({
    title: z.string().min(1),
    /** Short label shown under the title, e.g. "Restaurant landing page". */
    tagline: z.string().min(1),
    /** One or two sentences, used on the card and as the meta description. */
    summary: z.string().min(40).max(200),
    type: z.enum(['website', 'chrome-extension', 'web-app']),
    stack: z.array(z.string().min(1)).min(1),
    liveUrl: linkOrPending,
    /**
     * Text of the live button when "Live demo" would not say what it opens,
     * e.g. "Install (v1.0.0)" for an extension released as a zip. Optional;
     * if one language has it, the other must too.
     */
    liveLabel: z.string().min(1).max(32).optional(),
    repoUrl: linkOrPending,
    cover: publicImage,
    coverAlt: z.string().min(1),
    order: z.number().int().positive(),
    featured: z.boolean().default(false),
    problem: z.string().min(1),
    solution: z.string().min(1),
    features: z.array(z.string().min(1)).min(3),
    screenshots: z
      .array(
        z.strictObject({
          src: publicImage,
          alt: z.string().min(1),
          caption: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

export const collections = { projects };
