---
title: Bella Cucina
tagline: Restaurant landing page
summary: A one-page site for an Italian restaurant, with a tabbed menu, a photo gallery and a booking form that hands the reservation straight to WhatsApp.
type: website
stack: [Next.js, TypeScript, Tailwind CSS, React, sharp, OpenStreetMap]
liveUrl: https://bella-cucina-steel.vercel.app # TODO: this project's live site (already deployed) — update it if the address changes
repoUrl: https://github.com/vizcainoloboemanueldavid6-eng/bella-cucina # TODO: this project's repository — keep it on the same GitHub account as profile.links.github
cover: /projects/bella-cucina/cover.webp
coverAlt: Bella Cucina home page on a desktop screen, with the headline over a dimly lit restaurant dining room
order: 1
featured: true
problem: >-
  A small restaurant needs one place where guests can read the menu, look at the room and book a
  table from their phone, without installing an app, creating an account or the restaurant paying a
  monthly fee to a booking platform. The usual shortcuts do the opposite: a PDF menu that is
  unreadable on a phone, photos that weigh several megabytes on a mobile connection, and forms that
  leave keyboard and screen-reader users behind.
solution: >-
  A static single-page site built with Next.js and exported as plain files, so hosting costs nothing
  and the page loads quickly on a phone. Everything the owner would want to change, from the phone
  number and opening hours to the whole menu and the photographs, lives in one config file and two
  data files. Reservations need no backend: the form checks the details, writes the booking out and
  opens WhatsApp with it, so the restaurant confirms in the app it already uses.
features:
  - Tabbed menu (antipasti, pasta, pizza, dolci, drinks) built on the WAI-ARIA tabs pattern, with arrow-key navigation and vegetarian or gluten-free badges
  - Masonry gallery with a hand-written lightbox that traps focus, closes on Escape, supports arrow keys and returns focus where it came from
  - Booking form that validates the date, time and party size, then opens WhatsApp with the reservation already written out
  - Opening-hours table, an OpenStreetMap embed with no API key and a floating WhatsApp button
  - Responsive WebP photographs with generated srcset variants, so a phone downloads a 64 KB hero image instead of the 190 KB desktop file
  - Restaurant JSON-LD, Open Graph card, sitemap and robots.txt; motion that respects prefers-reduced-motion and content that stays readable without JavaScript
screenshots:
  - src: /projects/bella-cucina/menu.webp
    alt: The menu section with the Antipasti tab open, listing dishes with prices and dietary badges
    caption: The menu is a real tab interface, usable with the keyboard alone.
  - src: /projects/bella-cucina/gallery.webp
    alt: A masonry gallery of pasta, pizza and dining-room photographs on a dark background
    caption: Masonry gallery built with CSS columns; each photo opens in an accessible lightbox.
  - src: /projects/bella-cucina/booking.webp
    alt: The reservation form with fields for name, phone, date, time, guests and notes
    caption: The booking form writes the reservation out and hands it to WhatsApp.
  - src: /projects/bella-cucina/mobile.webp
    alt: The Bella Cucina hero section on a phone screen
    caption: Designed for phones first, where most guests look up a restaurant.
---

Bella Cucina is a fictional restaurant, created as a portfolio piece. The menu, the reviews and the
address are invented, and the site says so in its footer.

**Built to be handed over.** There is no CMS, no database and no server to keep alive:
`npm run build` produces a folder of static files that can live on any host for free. The owner
edits a single TypeScript config file for the business details, and the structured data, the
sitemap and every component follow from it.

**Accessible by construction.** Real semantics throughout, a visible focus ring everywhere, a
mobile menu and a lightbox that trap focus and close on Escape, and scroll animations that hand over
the finished state when the visitor prefers reduced motion.

**Measured.** Lighthouse mobile, median of five runs on the production build: accessibility 100,
best practices 100, SEO 100 and performance 93.
