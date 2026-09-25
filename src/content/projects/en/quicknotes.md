---
title: QuickNotes
tagline: Web notes & highlighter extension
summary: Highlight text and pin sticky notes on any web page, anchored to the text itself so they find their place again on your next visit, with a side panel to search and export it all.
type: chrome-extension
stack: [Preact, TypeScript, Vite, Tailwind CSS, Chrome Extensions API, Shadow DOM, Vitest, Playwright]
liveUrl: https://github.com/vizcainoloboemanueldavid6-eng/quicknotes/releases/tag/v1.0.0 # TODO: the v1.0.0 release (installable zip) — switch to the Chrome Web Store listing once it is published
liveLabel: Install (v1.0.0)
repoUrl: https://github.com/vizcainoloboemanueldavid6-eng/quicknotes # TODO: this project's repository — keep it on the same GitHub account as profile.links.github
cover: /projects/quicknotes/cover.webp
coverAlt: A sample article with sentences highlighted in yellow, green and blue, the QuickNotes colour toolbar over a selection and a yellow sticky note with a bulleted list in the margin
order: 4
featured: false
problem: >-
  Research is spread across dozens of pages, and the notes about it end up in a separate app with
  no link back to the paragraph that mattered. Bookmarks remember the address, but not what you
  highlighted or why, and a highlight that lands on the wrong words after the page changes is worse
  than none.
solution: >-
  A Manifest V3 extension that draws its toolbar and notes inside a closed Shadow DOM, so the site's
  styles cannot break them and the site's scripts cannot read them. Each highlight is stored with
  the quoted text, the words around it and an XPath fallback, so it finds its place again after a
  reload even when the page has shifted, and anything it cannot place is listed as orphaned instead
  of being drawn somewhere wrong. By default it has no access to a site until you use it there;
  restoring notes automatically on every site is an opt-in permission you can take back.
features:
  - A toolbar on every text selection with four highlight colours and "Add note", also in the right-click menu; click a highlight to recolour it, attach a note or delete it
  - Sticky notes you can drag, resize and minimise, in four paper colours, with bold, italics and lists (Ctrl+B and Ctrl+I)
  - Highlights come back after a reload even when the text around them changed; repeated phrases are told apart by their context, and lost ones are listed as orphaned
  - Side panel with the notes of the current page (click one to scroll to it) and an "All notes" view with accent-insensitive full-text search and colour and site filters
  - Export one page or everything to Markdown or JSON; JSON import is validated as a whole and merges without deleting anything
  - Per-site pause, an Alt+N shortcut for a new note, light and dark themes and an interface in English and Spanish; no network requests and no analytics
screenshots:
  - src: /projects/quicknotes/side-panel.webp
    alt: The sample article next to the QuickNotes side panel, which lists the page's six highlights by colour and its notes
    caption: The side panel lists everything on the page; a click scrolls to it and makes it flash.
  - src: /projects/quicknotes/all-notes.webp
    alt: The QuickNotes popup with the page's counts and a New note button, over the side panel's All notes view searching for "reading"
    caption: '"All notes" searches every page at once, with colour and site filters.'
---

**Permissions that follow the user.** QuickNotes asks for `storage`, `activeTab`, `scripting`,
`contextMenus` and `sidePanel`, so installing it shows no "read and change all your data" warning.
Its script runs only on a tab you act on: the toolbar button, the right-click menu or Alt+N. The
option to restore notes automatically on every site requests host access at runtime, registers the
script, and gives the permission back when it is turned off; if the permission is revoked in Chrome,
the option switches itself off.

**Isolation both ways.** Everything QuickNotes draws lives in one closed shadow root: the page's
CSS cannot restyle it, its own CSS cannot leak out, and page scripts cannot reach a note, not even a
site's analytics tag. A demo article with deliberately hostile CSS (universal `!important` rules,
hidden toolbars, overlays at the maximum z-index) is part of the project to prove it.

**Tested where notes could be lost.** Vitest covers anchor serialisation and resolution (changed
text, repeated quotes, whitespace, the XPath fallback, orphans), URL normalisation, the HTML
sanitiser, export and import. Playwright loads the built extension and checks the real flows:
highlighting, notes restored at the same place after a reload, hostile CSS, the side panel, pausing a
site and revoking access, with zero errors in every extension context.
