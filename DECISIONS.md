# Decisions

Every judgement call the specification left open, and why it went the way it did. Grouped from
"affects the whole project" to "affects one component".

---

## Stack

### Astro 7, the latest stable major, not Astro 4

The spec asks for "Astro 4+". Astro 7.3 is what `npm create astro` installs today, it keeps every
API the spec relies on (Content Collections, i18n routing, View Transitions through
`<ClientRouter />`, static output) and it is the version that will keep receiving fixes. Content
Collections use the current Content Layer API: `src/content.config.ts` with the `glob()` loader.

### TypeScript 6.0, not 7.0

npm's `latest` TypeScript is 7.0, but `@astrojs/check` 0.9.10 declares a peer range of
`^5.0.0 || ^6.0.0`, and `astro check` is an acceptance criterion. TypeScript 6.0.3 is the newest
version inside that range. The project extends `astro/tsconfigs/strict` and adds
`noUncheckedIndexedAccess` and `noImplicitOverride`.

### Tailwind CSS 4 through `@tailwindcss/vite`

`@astrojs/tailwind` only supports Tailwind 3. Tailwind 4's own Vite plugin is what the Astro docs
recommend now. The design tokens live in `@theme` inside `src/styles/global.css`, so the colours
the spec prescribes exist once and generate the utilities (`bg-ink`, `text-primary-soft`…).

### Exact versions everywhere

Every dependency is pinned without `^` or `~`, like the rest of this portfolio series. npm 11
blocks install scripts by default; `package.json` allows only esbuild's (`allowScripts`), which
it needs to verify its binary.

### No ESLint or Prettier

The acceptance criteria are `npm run build` and `astro check`, and both are clean. For a static
site with almost no JavaScript, `npm run checks` (over 300 assertions in a real browser) catches
far more than a linter would.

---

## Content and honesty

### "Mateo Rivas" is an example, and every field says so

All personal data comes from `src/config/profile.ts`, filled with the example profile the spec
asks for (Mateo Rivas, `mateobuilds`, `hello@example.com`). Every field carries
`// TODO: replace with your real data`, and `npm run checks` fails if one is missing. Prices,
delivery days, response time and support days are in the same file because they are the owner's
commercial terms, and the FAQ and service cards read them from there.

### Placeholder links point at the sites themselves, never at a person

The Fiverr profile, the three gig links and GitHub are `https://www.fiverr.com/` and
`https://github.com/`. Any plausible username (`fiverr.com/mateobuilds`) could belong to a real
stranger, so a placeholder must not contain one. The GitHub button still shows `@mateobuilds` as
text, because that is part of the example profile the owner replaces. A link that still points
at a site's root is treated as a placeholder by `isPlaceholderUrl()`, and placeholders are never
published as `sameAs` in the JSON-LD.

### No invented experience, clients or reviews

The Experience section lists the five portfolio projects and nothing else, each labelled
"Personal project" / "Proyecto personal", with the role "Design & development". There are no
employers, dates, client logos, testimonials, ratings or "trusted by" strips. The JSON-LD
`Person` is built from profile.ts only: no `worksFor`, no `alumniOf`, no `aggregateRating`.
`npm run checks` asserts all of this.

### Real URLs for projects 01 and 02

The spec says `liveUrl` and `repoUrl` start as `#` with a TODO, but two of the five already exist:

- Bella Cucina: live at `https://bella-cucina-steel.vercel.app`, source at
  `github.com/vizcainoloboemanueldavid6-eng/bella-cucina`.
- FitCoach Pro: live at `https://fitcoach-pro-mu.vercel.app`; no public repository yet, so
  `repoUrl: '#'` with a TODO.

`https://bella-cucina.vercel.app` (without `-steel`) belongs to somebody else and is never used;
a check guards against it. TabZen, QuickNotes and StockFlow keep `#` + TODO for both links.

### Projects 03–05 are written from their specifications

They were being built in parallel, so their case studies describe what their specs commit to
(features, permissions, architecture), in the present tense, without invented metrics. The two
sibling projects that already shipped quote their own measured Lighthouse numbers from their
READMEs. Bella Cucina and FitCoach Pro are fictional businesses, and their case studies say so.

### A `#` link is a disabled "Coming soon" state, not a dead link

When `liveUrl` or `repoUrl` is `#`, the page renders a non-interactive element styled as a
dashed button with a "Coming soon" tag, and the status reads "Launching soon". It is not an
`<a href="#">`, so nobody tabs to or clicks a link that goes nowhere; screen readers hear
"Live demo: coming soon".

### The case-study structure lives in the frontmatter

The spec lists the required fields (title, summary, type, stack, liveUrl, repoUrl, cover, order,
featured). The project page also needs a problem, a solution, features and screenshots, so those
are frontmatter fields too (`problem`, `solution`, `features[]`, `screenshots[]`), plus
`tagline` and `coverAlt`. Being structured means the Zod schema can require them, and the page
can lay them out consistently. The Markdown body is optional and becomes the "Behind the build"
section. The schema is a `strictObject`, so a misspelt field fails the build instead of being
ignored.

### Both languages must stay in sync

`src/lib/projects.ts` refuses to build if a project exists in one language but not the other, or
if `type`, `order`, `cover` or the links differ between translations. The alternative is a
language switcher that sometimes leads to a 404.

---

## Images

### Real screenshots for 01 and 02, generated placeholders for 03–05

The sibling projects ship full-page Playwright screenshots in their `docs/` folders. Those were
cropped (read-only, nothing in those folders was changed) into 16:10 sources in
`media/projects/<slug>/`: the desktop hero as the cover, three sections as screenshots, and the
phone capture composited into a 16:10 frame so every image shares the card's ratio. TabZen,
QuickNotes and StockFlow get an SVG placeholder (name + one-line label on their own brand
colour from their specs: `#5B5BD6`, `#F2B705`, `#2563EB`) until real captures exist. Their
`screenshots` lists are empty, and the Screenshots section only renders when the list has items,
so there is no "coming soon" gallery. The placeholder labels are English in both languages:
they are pictures meant to be replaced, not copy.

### `npm run images`: sources in `media/`, output in `public/`

For each source, sharp writes AVIF and WebP at 640, 960 and 1280 px wide (never upscaled), plus a
plain `<name>.webp`, and records the real sizes in `src/data/images.json`. `<ProjectImage>` reads
that manifest to print a `<picture>` with `srcset`, `sizes`, `width` and `height`. Frontmatter
references the plain file (`/projects/bella-cucina/cover.webp`); an image that is not in the
manifest (the SVG placeholders, or a file the owner drops into `public/` by hand) is served as
it is, inside the same fixed 16:10 box, so nothing shifts either way.

Covers stay in `public/projects/` as the spec requires, rather than going through
`astro:assets`, so replacing one is a file operation the README can describe in two lines.

### Generated images are built from profile.ts at build time

`/og/en.png`, `/og/es.png`, one card per project and language (`/og/<lang>/<slug>.png`, with the
cover inside), `favicon.svg`, `favicon.ico` (16/32/48 PNG entries), `apple-touch-icon.png`
(full-bleed, because iOS applies its own mask), `icon-192.png`, `icon-512.png` and
`site.webmanifest` are Astro endpoints. Changing the name or initials in profile.ts updates all
of them on the next build; there is no image to redraw by hand.

The text in those images is converted to outlines with opentype.js from the Space Grotesk WOFF
files, because sharp rasterises SVG with the operating system's fonts, and a build server has none
of ours (often none at all).

### opentype.js 1.3.4, not 2.0.0

opentype.js 2.0.0 parsed these WOFF files but produced broken outlines from the first `s`
onwards (glyphs missing, counters filled). 1.3.4 renders every glyph correctly, including the
Spanish accents, `¿`, `«»`, `—` and `…` used in the copy. Verified visually in Chromium.

---

## Design

### Contrast: the brand purple is for accents, not for text

`#7C5CFF` on `#0B0C10` measures 4.50:1, and white on `#7C5CFF` only 4.35:1, which fails
WCAG AA for normal-size text. So:

- text in the brand colour uses `primary-soft` `#A594FF` (7.7:1 on the background);
- primary buttons use `primary-strong` `#6B4EFF` with white text (5.1:1), and darken to
  `#5B3DF5` (6.1:1) on hover instead of lightening;
- `#7C5CFF` itself is kept for borders, glows, gradients and the logo;
- secondary `#2EE6A6` is 12.1:1 on the background and is used for labels, ticks and badges;
- muted text is `#A1A1AA` (7.6:1).

### The animated background only animates `transform`

Three soft radial gradients on one fixed layer drift over 36 seconds. Only `transform` changes,
so the compositor moves it without repainting the page, which keeps it off the main thread (and
out of Lighthouse's "non-composited animations"). The "available" dot pulses with a pseudo
element scaled with `transform` and `opacity` for the same reason. With
`prefers-reduced-motion: reduce`, the background, the avatar ring, the pulse, every transition
and the page transitions stop.

### Project cards lift and reveal the stack

On hover, or when the card's link has keyboard focus (`:focus-within`), the card rises 6 px, its
border lights up and the first six technologies slide up over the cover. On touch screens
(`(hover: hover) and (pointer: fine)` does not match) the stack is always visible, because there
is no hover to reveal it. The whole card is clickable through a stretched link whose accessible
name is just the project title, and the focus ring is drawn around the card with `:has()`.

### Work filter: progressive enhancement

The filter buttons ship with the `hidden` attribute and a tiny script unhides them. Without
JavaScript, every project is simply listed. They are native `<button>`s with `aria-pressed`
inside a labelled group, so Tab, Enter and Space work with nothing extra; a polite live region
announces "Showing 2 projects". When the browser supports it and the visitor has not asked for
reduced motion, the change runs inside `document.startViewTransition()`, so the covers glide to
their new positions.

### View Transitions with `<ClientRouter />`

Page changes use Astro's client router. The cover image carries the same `transition:name` on the
card and on the case study, so it morphs from one to the other. The header and footer are
`transition:animate="none"` (they are the frame, not the content) and the background layer is
`transition:persist`, so its drift does not restart on every navigation. Scripts that touch the
page run on `astro:page-load`; document-level listeners are registered once.

### Fonts: self-hosted variable fonts, preloaded, with metric-matched fallbacks

Space Grotesk and Inter come from `@fontsource-variable` (one file per subset, `font-display:
swap`), so the site makes no request to Google. The two Latin files are preloaded from the layout
with `?url` imports, which resolve to the same hashed files the `@font-face` rules use (checked
in the build output). While they load, Arial stands in with `size-adjust` and ascent/descent
overrides computed from the font files themselves (Inter 107.03 % / 90.51 % / 22.54 %, Space
Grotesk 108.4 % / 90.78 % / 26.94 %), so the swap barely moves the text. Measured CLS is 0.

### The stylesheet is inlined

`build.inlineStylesheets: 'always'`. The whole CSS, fonts' `@font-face` rules included, is
~40 KB before compression, and inlining it removes the only render-blocking request on each page.
For a site of a dozen pages, the lost cross-page caching is worth less than the faster first
paint.

### Tech stack icons: Simple Icons, inlined at build time

The spec asks for Simple Icons as inline SVG. The `simple-icons` package (pinned) is imported only
in the frontmatter of Astro components, so each page receives just the `<path>` of the icons it
shows, with no icon font, sprite request or client-side JavaScript. The slugs live in
`profile.ts → techStack` and an unknown slug stops the build with a message pointing at
simpleicons.org. The same lookup puts a small mark next to each technology on the project pages
when one exists (a few names are aliased, e.g. "Chrome Extensions API" → Google Chrome). Icons are
monochrome (`currentColor`) at rest; on hover they take the brand colour, lightened at build time
just enough to keep 3:1 against the card. Near-black, hueless marks (Next.js, GitHub, Vercel, Prisma:
under 2:1 against the card) keep the text colour on hover, because lightening black only yields a grey
that is dimmer than the icon at rest and looks disabled. They are decorative (`aria-hidden`)
because the name is always written next to them.

### Mobile menu: a native `<details>`

It opens and closes without JavaScript, is keyboard operable and announces its state. A few
lines of script only add closing after choosing a link, on Escape and on an outside click.

### Scoped styles and child components

Astro scopes a component's CSS to its own elements. Classes handed to a child component
(`<Icon class="icon-close">`, `<ProjectImage class="project-cover">`) are therefore targeted with
`:global()` from the parent. The first build missed this and showed both menu icons at once.

---

## Internationalisation and SEO

### `/` is English, `/es/` is Spanish, and the paths match

The spec's routes. Project pages are `/projects/<slug>/` and `/es/projects/<slug>/`, with the same
slug in both languages, and section ids are the same in both languages (`#work`, `#faq`…). So the
language switcher always maps to the equivalent page, and on the home page it keeps the section
you were reading (`/#faq` → `/es/#faq`). Every string lives in `src/i18n/ui.ts`, typed by one
`UiStrings` interface: a missing translation is a type error.

### The switcher is a link with the language's own name

"Español" on English pages and "English" on Spanish ones, with `lang` and `hreflang` set. On
phones the header shows "ES"/"EN" to fit 375 px, while the full name stays in the accessible
name. The footer always shows the full name.

### One 404 page, in both languages

Static hosts serve a single `404.html` for every unknown path, so the page is in English with
the Spanish version under it (`lang="es"`), links to both home pages and `noindex`.

### The site URL comes from the environment

`astro.config.mjs` resolves the public origin as: `SITE_URL` → Vercel's
`VERCEL_PROJECT_PRODUCTION_URL` (set on every Vercel build, and it follows a custom domain) →
Netlify's `URL` → the obviously fake `https://mateobuilds.example.com` with a TODO. The
production address is decided at deploy time, and the fallback can never point at a stranger's
site. Canonicals, hreflang, Open Graph, the sitemap, robots.txt and the JSON-LD all derive from it.

### `hreflang` everywhere: head and sitemap

Every page links `en`, `es` and `x-default` (the English page). `@astrojs/sitemap` is configured
with the same locales, so each sitemap entry carries both alternates. The 404 page is filtered out
of the sitemap and has no canonical.

### Structured data

`Person` on both home pages; `CreativeWork` on each case study, with the author referencing the
same `Person` `@id`, the stack as keywords, and the live URL and repository as `sameAs` only when
they exist.

---

## Behaviour and verification

### No contact form

Fiverr's terms keep orders and payments on the platform, so every primary call to action goes to
Fiverr, and email and GitHub are secondary links. The spec says so explicitly; a check asserts
there is no `<form>` on the home page.

### Host configuration ships with the code

`vercel.json` turns on `trailingSlash: true`, so `/projects/tabzen` answers with a permanent
redirect to `/projects/tabzen/`, the address the canonical tags and the sitemap use, instead of
serving the same page at two URLs. Both `vercel.json` and `netlify.toml` mark the content-hashed
files in `/_astro/` as immutable. `netlify.toml` also sets the build command and the `dist`
folder, so importing the repository needs no manual settings on either host.

`vercel` run from a local folder uploads the source without reading `.gitignore`, and Vercel's
default ignore list skips `.env.local` but not `.env`. A `.env` copied from `.env.example` would
then ship `SITE_URL=https://mateobuilds.example.com`, and since an explicit `SITE_URL` wins over
`VERCEL_PROJECT_PRODUCTION_URL`, every canonical would point at the fake domain. `.vercelignore`
keeps `.env*` (and `dist/`, `docs/`, Lighthouse reports) out of CLI uploads. The origin read from
the environment is also trimmed, because a value pasted or piped into a host's settings often
carries a trailing newline.

### Deployment guide: `docs/DEPLOY.es.md`, in Spanish

The spec asks for "the commands to push to GitHub and deploy on Vercel" at the end. They live in
a file the owner can follow later rather than only in a chat message: GitHub (empty repository,
remote, first push), Vercel through the dashboard and through the CLI, when `SITE_URL` is needed
and how to set it in both, a custom domain, and `curl` commands to verify the live site. It is in
Spanish like the README, because the owner is its reader. The commands are PowerShell-first
(the owner's machine is Windows) and include the one-line `PATH` fix for the portable Node and Git
installs on that machine. Nothing in it was executed: no remote, push or deployment was made.

### How the numbers were measured

`scripts/static-server.mjs` serves `dist/` with brotli/gzip and immutable caching on
`/_astro/`, like Vercel and Netlify do, and answers unknown paths with `404.html` and status 404.
`npm run audit` runs Lighthouse's mobile preset in the installed Google Chrome (the browser
visitors actually use; `LH_CHANNEL=chromium` switches to Playwright's Chromium) three times per
page, up to five when the passes disagree (a category straddles 95, or performance spreads by more
than 5 points), and reports the median of every pass. No pass is ever excluded: an earlier version
dropped passes with an unusually long main thread as "contended", which made the number easier to
defend but harder to trust. Each pass's performance score and main-thread time are printed instead,
so a run slowed down by other work on the laptop (other projects were being built at the same
time) is visible and can simply be repeated. The last HTML report per page and a `summary.json`
go to `lighthouse/`.

All scripts use ports 4330–4339 (dev 4330, preview 4332, screenshots 4333, checks 4335,
Lighthouse 4336 with the browser's debugging port on 4339).

### Screenshots

`npm run shots` captures the home page in both languages, a case study in each language and the
404 page, full-page at 375 and 1440 px, into `docs/` as JPEG at quality 80 and 1× scale (PNG at
2× would weigh ten times as much in the repository). The capture runs with reduced motion so the
background is deterministic, and it fails on any console error or failed request.
