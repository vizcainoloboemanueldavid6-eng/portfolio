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

### Node.js 22.19 or newer

Astro 7 itself runs on 22.12, but `scripts/placeholders.mjs` and `scripts/checks.mjs` import `.ts`
files (profile.ts, glyphs.ts, images.ts) directly, which plain Node only does without a flag from
22.18, and the pinned Lighthouse 13.5 declares `>=22.19`. `engines` and the README say 22.19, the
same floor as the FitCoach Pro project, instead of a number that only holds for `npm run build`.

### No ESLint or Prettier

The acceptance criteria are `npm run build` and `astro check`, and both are clean. For a static
site with almost no JavaScript, `npm run checks` (over 600 assertions, most of them in a real
browser) catches far more than a linter would.

---

## Content and honesty

### "Mateo Rivas" is an example, and every field says so

All personal data comes from `src/config/profile.ts`, filled with the example profile the spec
asks for (Mateo Rivas, `mateobuilds`, `hello@example.com`). Every field carries
`// TODO: replace with your real data`, and `npm run checks` fails if one is missing. Prices,
delivery days, response time and support days are in the same file because they are the owner's
commercial terms, and the FAQ and service cards read them from there. `available: false` hides both
availability signals, the hero badge and the avatar's green "online" dot.

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

### Real URLs for every project

The spec says `liveUrl` and `repoUrl` start as `#` with a TODO, but all five projects are now
published, and a "Coming soon" button for something that exists would be the less honest option:

- Bella Cucina: `https://bella-cucina-steel.vercel.app`, source
  `github.com/vizcainoloboemanueldavid6-eng/bella-cucina`.
- FitCoach Pro: `https://fitcoach-pro-mu.vercel.app`, source `…/fitcoach-pro`.
- TabZen: the v1.0.0 GitHub release (`…/tabzen/releases/tag/v1.0.0`), source `…/tabzen`.
- QuickNotes: the v1.0.0 GitHub release (`…/quicknotes/releases/tag/v1.0.0`), source
  `…/quicknotes`. The release was being published by the main session while this round ran, so the
  link answered 404 when the site was built; nothing on the site depends on it resolving at build
  time, and `npm run checks` only checks that the link is there, not the remote page.
- StockFlow: the public demo `https://stockflow-seven-sage.vercel.app`, source `…/stockflow`.

Every one of those lines keeps the spec's TODO comment, worded as "confirm/keep in sync" rather
than "add" (for the two extensions: "switch to the Chrome Web Store listing once it is
published"). `https://bella-cucina.vercel.app` (without `-steel`) belongs to somebody else and is
never used; a check guards against it.

### Extensions link to their release, and the button says "Install (v1.0.0)"

Neither extension is in the Chrome Web Store yet (a store listing needs the owner's developer
account). What exists is a GitHub release with the zip that loads in Chrome. A button that says
"Live demo" and opens a download page would promise something else, so a project can set an
optional, translated `liveLabel`: "Install (v1.0.0)" / "Instalar (v1.0.0)" for both extensions.
StockFlow, Bella Cucina and FitCoach Pro keep the default "Live demo" / "Demo en vivo", because
their link really is the running site. The label is text, so it may differ between languages, but
the build refuses a label set in only one of them. The status line under the title follows the same
logic: a published Chrome extension is "Released" / "Publicada"; a website or web app is "Live" /
"Publicado". A version number in the label has to be updated with each release; that is the price
of saying exactly what the button downloads. When the store listings exist, the owner swaps
`liveUrl` for the listing and the label for something like "Add to Chrome" (README §1).

### Project repositories and the example profile name two different people

The repositories live on the owner's real GitHub account, while the example profile the spec
prescribes is "Mateo Rivas" with a placeholder GitHub link. Until the owner fills in profile.ts, a
visitor would see `@mateobuilds` in Contact and a different account behind "Source code". That is
accepted, because the site is not meant to go live with the example profile (the README says so
first thing), and the alternative, hiding real links behind "Coming soon", misrepresents the work.
To keep the two from drifting apart once the profile is real, the repoUrl TODO says "same GitHub
account as `profile.links.github`", README §1 tells the owner, and `npm run checks` fails when
`profile.links.github` is a real profile and a GitHub `repoUrl` belongs to another account (while
it is still the placeholder, it checks that all GitHub `repoUrl`s at least share one account).

### Projects 03–05 were reconciled with the finished projects

Their case studies were first written from what their specs committed to, while the projects were
still being built. Once TabZen, QuickNotes and StockFlow had passed their own acceptance gates and
were published, the six Markdown files were rewritten against each project's README and DECISIONS,
in both languages. What changed, and why:

- **TabZen.** "No network requests" became "no network requests by default": website icons are an
  opt-in setting because showing a page's icon makes the browser fetch it. "_locales prepared for
  Spanish" became a Spanish interface, which it has. The Web Store packaging claim became what
  exists: a v1.0.0 zip on GitHub plus the listing text and screenshots in the repository. The
  build notes now cover the keyboard-only popup, the suspension rules (a pure, tested function; real
  discards in a browser test) and the Playwright suite, and Playwright joined the stack.
- **QuickNotes.** The Shadow DOM is described as closed (page scripts cannot read a note, which an
  open root would allow), anchoring as quote + context + XPath with a similarity threshold and
  orphans listed instead of misplaced, and the permission model as it shipped: nothing runs on a
  site until the user acts there, and automatic restore is an opt-in host permission that is given
  back when turned off. Playwright joined the stack.
- **StockFlow.** SQLite joined the stack, because the public demo runs in its zero-config SQLite
  mode (data that resets on its own) while PostgreSQL stays the default. The case study highlights
  the server-side role check on every action (re-read from the database), the single conditional
  update that keeps stock from going negative under concurrency, the integration test that forces
  that race on real PostgreSQL, and the Playwright test that replays an admin's request with a
  Staff session.

Nothing claims a number or a feature those READMEs do not state. Test counts were left out on
purpose: they change with every fix in the sibling repositories, and a stale count would be a false
claim. Bella Cucina and FitCoach Pro quote the Lighthouse numbers their own READMEs measured.

### StockFlow's demo logins are never printed

StockFlow publishes its demo credentials in its own README, on purpose. This site does not repeat
them: its sign-in page has a "Try the demo" button, and that is the only way the case study mentions
the demo accounts. `npm run checks` fails if any built page contains a reserved `.test` address or
a "password:" line.

### A `#` link is a disabled "Coming soon" state, not a dead link

When `liveUrl` or `repoUrl` is `#`, the page renders a non-interactive element styled as a
dashed button with a "Coming soon" tag, and the status reads "Launching soon". It is not an
`<a href="#">`, so nobody tabs to or clicks a link that goes nowhere; screen readers hear
"Live demo: coming soon" (or the project's own `liveLabel`). No project uses it any more, but a new
one can start that way (README §3).

### The case-study structure lives in the frontmatter

The spec lists the required fields (title, summary, type, stack, liveUrl, repoUrl, cover, order,
featured). The project page also needs a problem, a solution, features and screenshots, so those
are frontmatter fields too (`problem`, `solution`, `features[]`, `screenshots[]`), plus
`tagline` and `coverAlt`. Being structured means the Zod schema can require them, and the page
can lay them out consistently. The Markdown body is optional and becomes the "Behind the build"
section. The schema is a `strictObject`, so a misspelt field fails the build instead of being
ignored.

### Both languages must stay in sync

`src/lib/projects.ts` refuses to build if a project exists in one language but not the other, if
`type`, `order`, `cover` or the links differ between translations, or if `liveLabel` is set in only
one of them. The alternative is a language switcher that sometimes leads to a 404, or a button that
says "Install" in one language and "Live demo" in the other.

---

## Images

### Real screenshots for every project, taken from the projects themselves

Every source in `media/projects/<slug>/` is a 16:10 image made from captures the sibling projects
already ship (read-only: nothing in those folders was changed), so the portfolio shows exactly what
each project shows about itself:

- **Bella Cucina, FitCoach Pro:** their full-page Playwright screenshots in `docs/`, cropped: the
  desktop hero as the cover, three sections as screenshots, and the phone capture composited into a
  16:10 frame.
- **TabZen, QuickNotes:** their Chrome Web Store screenshots (`store-assets/`, 1280×800, already
  16:10), copied byte for byte. Each project's own `npm run store-assets` drives the real, built
  extension in the browser (popup, side panel, options, the QuickNotes demo article) and flattens
  the images to 24-bit, so there was nothing to gain from capturing the same screens a second way.
  The first image of each is the cover; the other two are the gallery. TabZen's store images put the
  real popup on an indigo canvas with a headline; that framing is the project's own and is kept.
- **StockFlow:** its README screenshots (`docs/`, captured signed in as the seeded admin): the top
  1440×900 of the dashboard (dark theme, the cover), of the products table (light) and of the
  movements history (dark), so the gallery shows both themes; the low-stock alerts card of the light
  dashboard on a dark 1440×900 canvas, because that card sits below the fold and a plain crop cut
  the chart above it in half; and the 390 px phone capture framed like the other two phone images,
  on a blue glow (StockFlow's `#2563EB`). The gallery has four images, like Bella Cucina's, so the
  two-column grid has no orphan.

The composites (phone frames, the alerts card) are drawn with sharp by a throwaway script; the
inputs are the files named above and the output is committed in `media/`, so `npm run images`
alone rebuilds everything in `public/`. QuickNotes was still getting small i18n and build fixes
from another session during this round, and its store images were regenerated while this work was
in progress; the regenerated files are byte-identical (sha256) to the copies in `media/`, and they
were compared again before the last commit. None of those fixes changes a claim in its case study.

### The SVG placeholders stay, as documented fallbacks

`public/projects/{tabzen,quicknotes,stockflow}/cover.svg` (the project name on its brand colour:
`#5B5BD6`, `#F2B705`, `#2563EB`) are no longer referenced by any page, but they stay in the
repository: they are what `npm run placeholders` generates, the README tells the owner they can be
put back with one line of frontmatter, and a new project starts with one. `npm run checks` still
compares them with the generator's output.

The placeholders show only the name, which reads the same in both languages. An earlier version
added an English one-line label ("Inventory management web app"), which then appeared on the
Spanish pages and Open Graph cards; the spec only asks for "name and colour". `npm run checks`
fails if a label comes back. It also fails if a project that has sources in `media/` shows a cover
or a screenshot that is not an optimised image, in either language.

### `npm run images`: sources in `media/`, output in `public/`

For each source, sharp writes AVIF and WebP at 640, 960 and 1280 px wide (never upscaled), plus a
plain `<name>.webp`, and records the real sizes in `src/data/images.json`. `<ProjectImage>` reads
that manifest to print a `<picture>` with `srcset`, `sizes`, `width` and `height`. Frontmatter
references the plain file (`/projects/bella-cucina/cover.webp`); an image that is not in the
manifest (the SVG placeholders, or a file the owner drops into `public/` by hand) is served as
it is, inside the same fixed 16:10 box, so nothing shifts either way.

The manifest also stores a short sha256 of each plain `.webp`, and the variants are used only when
the frontmatter names that exact `.webp` and the file is unchanged. Before, the lookup stripped the
extension, so the README's quick way (overwrite `cover.webp`, or add `cover.png`) silently kept
showing the old variants on the page while the Open Graph card, which reads the real file, showed
the new one. Hashing twenty-one files per build costs nothing; comparing modification times would
break on a fresh clone, where every file has the checkout's time.

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

The filter buttons are in the page from the first paint, and a `<noscript>` rule
(`[data-filter-group]{display:none}`) hides them when JavaScript is off, so without it every
project is simply listed. They used to ship with the `hidden` attribute and be unhidden by the
script on `astro:page-load`. That added 84 px (desktop) to 188 px (phone) above every later section
*after* the client router had started its smooth scroll to `/#faq`, `/#contact`… from another
page, so those links stopped short by exactly that much. Astro's router removes `<noscript>` from
the pages it swaps in, so the rule never applies after a client-side navigation, and a check
asserts the landing position with smooth scrolling on. They are native `<button>`s with `aria-pressed`
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

### One scroll offset, on the content, not on the page

The sticky header is 4 rem tall. `:where(main, footer) * { scroll-margin-top: 4.5rem }` makes
anything the page scrolls to (a `#section`, or a link or button receiving focus) stop just below
it, and nothing else adds to it: a section's own top padding provides the breathing room. Two
earlier choices were wrong. `scroll-padding-top` on `<html>` plus `scroll-mt-24` on each section
added up to 184 px, leaving 120 px of empty space under the header. And a page-wide
`scroll-padding-top` also covers the header itself: focusing one of its links (clicking the
language switch or "Menu", or tabbing through the nav) made Chrome "reveal" the focused item by
scrolling the page up about half a screen. A scroll-margin on the content keeps focused items clear
of the header without touching the header. Checks assert both: sections land 72 px from the top,
and focusing header items never scrolls.

### Header: full nav from 1024 px, 90 % opaque

The inline nav needs about 870 px in Spanish (Servicios, Proyectos, Proceso, Preguntas, Contacto,
English, Contrátame). From 768 px it pushed the "Contrátame" button off the right edge, where
`overflow-x: clip` made it unreachable, on the common tablet widths (768–864 px). The inline nav now
starts at `lg` (1024 px), with the menu button below that; a check sweeps 320–1440 px in both
languages for any header item past the edge. The background went from 65 % to 90 % ink, with the
same blur: over the cream Bella Cucina screenshots the muted nav links dropped to about 2.5:1. A
check puts white content under the header and requires 4.5:1.

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
you are reading (`/#faq` → `/es/#faq`). Every string lives in `src/i18n/ui.ts`, typed by one
`UiStrings` interface: a missing translation is a type error.

"The section you are reading" is worked out when the switch is clicked: the last section whose top
has passed a line 30 % down the visible area (at the very bottom of the page, a `#hash` section
still on screen wins, since the last sections cannot reach that line). The first version copied
`location.hash`, which only records the last in-page jump: after clicking "See my work" and
scrolling to the footer, switching language threw the visitor back to Work. Now a visitor who
scrolled to the FAQ without any link also keeps it, and one at the top of the page gets the plain
home page.

### The switcher is a link with the language's own name

"Español" on English pages and "English" on Spanish ones, with `lang` and `hreflang` set. On
phones the header shows "ES"/"EN" to fit 375 px; the accessible name is then "ES Español", so the
visible label is part of it (WCAG 2.5.3 Label in Name: saying "click ES" works with speech input).
The same applies to the logo, whose initials are the only visible text below 360 px: its name is
"MR mateobuilds". The footer always shows the full name.

### Everything in the Spanish pages' source is Spanish too

`knowsAbout` in profile.ts has an English and a Spanish list, like `jobTitle`, so the Spanish
JSON-LD `Person` no longer lists English topics. The web app manifest exists per language
(`/site.webmanifest` and `/es/site.webmanifest`, with `lang`, `start_url` and the job title in that
language), and each page links its own.

### One 404 page, in both languages

Static hosts serve a single `404.html` for every unknown path, so the page is in English with
the Spanish version under it (`lang="es"`), links to both home pages and `noindex`. Like the
canonical, `og:url` is left out: it used to say `/404/`, a URL that does not exist.

### The site URL comes from the environment

`astro.config.mjs` resolves the public origin as: `SITE_URL` → Vercel's
`VERCEL_PROJECT_PRODUCTION_URL` (set on every Vercel build, and it follows a custom domain) →
Netlify's `URL` → the obviously fake `https://mateobuilds.example.com` with a TODO. The
production address is decided at deploy time, and the fallback can never point at a stranger's
site. Canonicals, hreflang, Open Graph, the sitemap, robots.txt and the JSON-LD all derive from it.
Re-checked before the first Vercel deployment: a build with only
`VERCEL_PROJECT_PRODUCTION_URL=portfolio-test.vercel.app` set (no `SITE_URL`, no `.env`) put
`https://portfolio-test.vercel.app` in the canonical, robots.txt, the sitemap and the `og:image`
URLs.

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

### Back to a `#hash` typed in the address bar reloads that page

Astro's client router ignores history entries it did not create: a `#hash` typed into the address
bar (or `location.hash` set by hand) leaves `history.state` at `null`, and its `popstate` handler
returns early for those. Going Back to such an entry from a case study changed the URL to `/#faq`
but kept the case study on screen. A small `popstate` listener in the layout reloads the page when
the state is `null` and the path differs from the page on screen (it looks after a tick, because
the router's own hash steps briefly have a `null` state too). A full load is the only thing that
can show the right page for an entry the router knows nothing about.

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

`LH_PASSES=5` replaces the adaptive count with exactly five passes per page, and `LH_URLS` audits a
comma-separated list of paths instead of the default four pages. The numbers in the README are the
median of five passes on both home pages, the two default case studies (Bella Cucina in English,
StockFlow in Spanish) and, through `LH_URLS`, TabZen in English, QuickNotes in Spanish and StockFlow
in English, so every case study with the new screenshots was measured at least once.

All scripts use ports 4330–4339 (dev 4330, preview 4332, screenshots 4333, checks 4335,
Lighthouse 4336 with the browser's debugging port on 4339). The server answers a malformed
`%`-escape with 400 instead of crashing (the decode used to throw inside an unhandled async
handler, which ended the process under `checks`, `audit` and `shots`), and it only serves paths
inside `dist/` (the containment test compares against `dist` plus a path separator, so a sibling
such as `dist-old/` cannot match).

### The scripts read the projects from the content folder

`checks` requires at least the spec's five projects (not exactly five) and the same slugs in both
languages. `audit` and `shots` pick their two case studies from the content folder (the first
project in English, the last in Spanish) instead of hard-coding `bella-cucina`, `tabzen` and
`stockflow`, so adding, renaming or removing a project does not break `npm run verify`.

### Screenshots

`npm run shots` captures the home page in both languages, a case study in each language and the
404 page, full-page at 375 and 1440 px, into `docs/` as JPEG at quality 80 and 1× scale (PNG at
2× would weigh ten times as much in the repository). The capture runs with reduced motion so the
background is deterministic, and it fails on any console error or failed request.

---

## History

### Two `wip:` commits stay in the history

`9737117` and `60fcebb` are pause points saved when earlier sessions were stopped mid-stage; their
messages say so. They are not per-feature and are not conventional commits: the first only changes
`scripts/lighthouse.mjs` (median of every pass), the second the tech-stack icon hover colours plus
the matching README/DECISIONS text, completed by `9439aa2`. Squashing them into the commits that
followed means rewriting `main`; the fix round tried a scripted rebase and the environment's
permission policy refused it, so the history is left as it is and documented here. The owner can
still squash them before the first push if a clean history matters to them.
