---
title: FitCoach Pro
tagline: 5-page business website with blog
summary: A five-page website for a personal trainer, with pricing plans, a Markdown-powered blog, an about page that builds trust and a validated contact form.
type: website
stack: [Next.js, TypeScript, Tailwind CSS, React, MDX, sharp]
liveUrl: https://fitcoach-pro-mu.vercel.app # TODO: this project's live site (already deployed) — update it if the address changes
repoUrl: https://github.com/vizcainoloboemanueldavid6-eng/fitcoach-pro # TODO: this project's repository — keep it on the same GitHub account as profile.links.github
cover: /projects/fitcoach-pro/cover.webp
coverAlt: FitCoach Pro home page on a desktop screen, with a bold "Get stronger" headline in lime and white on a dark background
order: 2
featured: true
problem: >-
  An independent coach who sells online and in-person programs needs more than a landing page:
  pricing that is easy to compare, a story that builds trust, articles that bring in search traffic
  and a simple way to get in touch. And it has to be something the coach can keep up to date without
  calling a developer every time a price changes or a new article is ready.
solution: >-
  A statically exported Next.js site with five pages: Home, Programs, About, Blog and Contact.
  Articles are MDX files the coach can write in any editor. Prices live in one data file, and the
  annual prices, the comparison table and the structured data are all derived from it, so they can
  never disagree. The site is dark by default, with a light theme that is applied before the first
  paint so it never flashes.
features:
  - Pricing cards with an accessible monthly/annual switch (annual prices calculated at 20% off) and a grouped feature comparison table
  - Blog written in MDX with tag filtering, reading time, an automatic table of contents with scroll spy and related articles
  - Before/after comparison slider built on a native range input, so it works with the keyboard and screen readers
  - Contact form with loading, success and error states, ready to post to Formspree once configured
  - Light and dark themes, remembered between visits and applied before the first paint
  - JSON-LD for Person, LocalBusiness, BlogPosting, FAQPage and breadcrumbs, plus sitemap, robots.txt and an RSS feed
screenshots:
  - src: /projects/fitcoach-pro/programs.webp
    alt: Three pricing cards, Starter, Transform and Elite 1-on-1, with a monthly and annual switch above them
    caption: Pricing plans with a monthly/annual switch; annual prices are calculated, never typed twice.
  - src: /projects/fitcoach-pro/blog.webp
    alt: The blog listing with tag filter buttons and article cards with photos
    caption: The blog is a folder of MDX files, with tag filtering and reading time.
  - src: /projects/fitcoach-pro/article.webp
    alt: An article page with its title, author line, reading time and a large photograph
    caption: Article pages get a table of contents, related posts and their own Open Graph card.
  - src: /projects/fitcoach-pro/mobile.webp
    alt: The FitCoach Pro home page on a phone screen
    caption: Every page is designed for phones first.
---

FitCoach Pro is a fictional business, created as a portfolio piece. The coach, the sample
testimonials and the publications in the "As featured in" strip are invented, and the site labels
each of them as such.

**Zero third-party requests.** Fonts are self-hosted at build time, and there is no analytics, no
cookies and no cookie banner. Every photograph ships in three to five WebP widths with explicit
dimensions, so nothing shifts while the page loads.

**Checked, not assumed.** A headless-browser script asserts the behaviour of the exported site
(the pricing arithmetic, the theme without a flash, no page wider than a phone screen) and a
Lighthouse script audits every page on the mobile preset. Accessibility, best practices and SEO score
100 on every page.
