---
title: QuickNotes
tagline: Web notes & highlighter extension
summary: Highlight text and pin sticky notes on any web page. Everything is saved per page and comes back when you return, with a side panel to search and export it all.
type: chrome-extension
stack: [Preact, TypeScript, Vite, Tailwind CSS, Chrome Extensions API, Shadow DOM, Vitest]
liveUrl: '#' # TODO: add the Chrome Web Store URL once the extension is published
repoUrl: '#' # TODO: add the public repository URL once it exists
cover: /projects/quicknotes/cover.svg
coverAlt: QuickNotes cover image with the project name on a warm yellow background
order: 4
featured: false
problem: >-
  Research is spread across dozens of pages, and the notes about it end up in a separate app with
  no link back to the paragraph that mattered. Bookmarks remember the address, but not what you
  highlighted or why, and a highlight that disappears after a reload is worse than none.
solution: >-
  A Manifest V3 extension that injects a small interface into the page inside a Shadow DOM, so the
  website's styles cannot break it and it cannot break the website. Highlights are anchored with the
  quoted text, the words around it and an XPath fallback, so they find their place again after a
  reload even when the page has shifted. Notes stay in chrome.storage.local and nothing ever leaves
  the browser.
features:
  - Floating toolbar on text selection with four highlight colours and an "Add note" button, also available from the right-click menu
  - Robust anchoring that restores highlights on reload, and lists any it cannot place as "orphaned" instead of losing them silently
  - Draggable, resizable and minimisable sticky notes with bold, italics and lists (Ctrl+B and Ctrl+I)
  - Side panel with the notes of the current page (click one to scroll to it) and an "All notes" view with full-text search and colour and domain filters
  - Export one page or everything to Markdown or JSON, and import JSON back
  - A per-site pause switch, an Alt+N shortcut for a new note and a content script injected only when it is needed
---

**Minimal permissions.** QuickNotes uses `storage`, `activeTab`, `scripting`, `contextMenus` and
`sidePanel`. The content script is injected only when you use the extension on a page, or on every
site if you opt in from the options page, through optional host permissions requested at runtime.

**Isolation both ways.** The toolbar and the notes are rendered with Preact inside a Shadow DOM
root, and a demo article page is part of the project to prove it: the host page's aggressive styles
do not leak in, and the extension's styles do not leak out.

**Tested where it is fragile.** URL normalisation, storage and the serialisation of highlight
anchors are covered by Vitest unit tests, because that is where a regression would silently lose
somebody's notes.
