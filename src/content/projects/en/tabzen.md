---
title: TabZen
tagline: Tab manager Chrome extension
summary: A Manifest V3 Chrome extension that tames tab overload with fuzzy search, saved sessions, one-click grouping by domain and auto-suspension of idle tabs.
type: chrome-extension
stack: [React, TypeScript, Vite, Tailwind CSS, Chrome Extensions API, Vitest]
liveUrl: '#' # TODO: add the Chrome Web Store URL once the extension is published
repoUrl: '#' # TODO: add the public repository URL once it exists
cover: /projects/tabzen/cover.svg
coverAlt: TabZen cover image with the project name on an indigo background
order: 3
featured: false
problem: >-
  Forty open tabs means a slow browser, lost context and the fear of closing anything in case it
  is needed later. Most tab managers want an account, sync your browsing history to their own
  servers or ask for permission to read every site you visit, which is a lot of trust to hand over
  just to tidy up a window.
solution: >-
  A Manifest V3 extension built with React, Vite and TypeScript that keeps everything on the
  device: no network requests, no analytics and only five permissions, none of them host access.
  The popup is keyboard-first, with an autofocused search, arrow keys to move and Enter to jump to a
  tab, while a background service worker takes care of suspending idle tabs, the context menu and the
  keyboard shortcuts.
features:
  - Fuzzy search across open tabs by title and URL, with highlighted matches; arrow keys move and Enter switches to the tab
  - Save a window as a named session and optionally close it; restore it in a new window, rename it, export it to JSON or delete it with a five-second undo
  - Group by domain with chrome.tabGroups, giving each domain its own colour and label
  - Auto-suspend tabs left idle for a configurable time, while skipping pinned tabs, tabs playing audio and whitelisted sites
  - Context menu entries, keyboard shortcuts (Ctrl+Shift+K opens the popup, Ctrl+Shift+S saves the session) and a badge with the tab count
  - Options page with light, dark and system themes, a domain whitelist and validated JSON import and export of every session
---

**Permissions, justified one by one.** TabZen asks for `tabs`, `tabGroups`, `storage`, `alarms`
and `contextMenus`, and nothing else: no `<all_urls>`, no host permissions. Each one is explained
in the privacy policy that ships with the extension.

**Logic you can test.** Grouping, searching and serialising sessions are pure functions, kept
apart from the `chrome.*` calls, so they are covered by Vitest unit tests, including the rules that
stop the extension from suspending pinned tabs, tabs playing audio and whitelisted sites.

**Ready for the Chrome Web Store.** The interface is in English with `_locales` prepared for
Spanish, and the project includes the store listing texts, 1280×800 screenshots, a promotional
tile and an `npm run zip` script that packages the release.
