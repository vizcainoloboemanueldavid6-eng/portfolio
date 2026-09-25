---
title: TabZen
tagline: Tab manager Chrome extension
summary: A keyboard-first Manifest V3 tab manager for Chrome. Find any open tab in a keystroke, save windows as sessions, group tabs by site and let idle tabs sleep.
type: chrome-extension
stack: [React, TypeScript, Vite, Tailwind CSS, Chrome Extensions API, Vitest, Playwright]
liveUrl: https://github.com/vizcainoloboemanueldavid6-eng/tabzen/releases/tag/v1.0.0 # TODO: the v1.0.0 release (installable zip) — switch to the Chrome Web Store listing once it is published
liveLabel: Install (v1.0.0)
repoUrl: https://github.com/vizcainoloboemanueldavid6-eng/tabzen # TODO: this project's repository — keep it on the same GitHub account as profile.links.github
cover: /projects/tabzen/cover.webp
coverAlt: The TabZen popup searching open tabs for "plan", with the matching letters highlighted in two results, next to the headline "Find any tab in a keystroke"
order: 3
featured: false
problem: >-
  Forty open tabs means a slow browser, lost context and the fear of closing anything in case it
  is needed later. Tidying them up should not require an account, a sync server or permission to
  read every site you visit, which is a lot of trust to hand over just to organise a window.
solution: >-
  A Manifest V3 extension built with React, Vite and TypeScript that keeps everything on the
  device: no account, no analytics and no network requests by default, with only five permissions
  and no access to the content of any page. The popup is built for the keyboard: the search box is
  focused on open, arrow keys move, Enter jumps to the tab and every action is reachable with Tab.
  A background service worker suspends idle tabs by rules that never touch the ones you still need.
features:
  - Fuzzy search over the titles and addresses of the tabs in every window, with the matching letters highlighted; arrow keys move and Enter switches to the tab and its window
  - Save a window as a named session, optionally closing its tabs; restore it into a new window, rename it, export it to JSON or delete it with a five-second undo
  - Group by domain with chrome.tabGroups, each site always getting the same colour, plus optional automatic grouping of new tabs
  - Auto-suspend tabs idle for a configurable time (30 minutes by default), never the active tab, pinned tabs, tabs playing audio or sites on the never-suspend list
  - Right-click menu items, keyboard shortcuts (Ctrl+Shift+K opens the popup, Ctrl+Shift+S saves the window) and a badge with the tab count
  - Settings page with light, dark and system themes, the never-suspend list and a validated JSON backup and import of every session; the interface is in English and Spanish
screenshots:
  - src: /projects/tabzen/sessions.webp
    alt: The TabZen popup in the dark theme showing saved sessions, each with Restore, Rename, Export and Delete buttons and its list of tabs
    caption: Sessions restore into a new window; a deleted one can be brought back with Undo.
  - src: /projects/tabzen/options.webp
    alt: The TabZen settings page with the automatic suspension switch, the idle time in minutes and the list of sites that are never suspended
    caption: Suspension rules and the never-suspend list, saved on the device only.
---

**Five permissions, justified one by one.** TabZen asks for `tabs`, `tabGroups`, `storage`,
`alarms` and `contextMenus`, and nothing else: no `<all_urls>` and no host permissions. Its privacy
policy explains each one, and a unit test fails if the manifest ever asks for more. Website icons
are the only thing that could reach the network, so they are off until the user turns them on.

**Suspension rules you can trust.** Chrome stops an idle service worker after 30 seconds, so the
time each tab was last used lives in session storage and survives those restarts. The decision of
which tabs may sleep is a pure function with a test for every rule (pinned, audible, active,
never-suspend list with subdomains, unknown age, threshold edges), and a browser test lets real idle
tabs be discarded while the pinned, audible and listed ones survive.

**Tested the way it is used.** Vitest covers the logic (search, grouping, sessions, import
validation), and Playwright drives the real toolbar popup with keyboard and mouse events (search,
Enter, saving, grouping) and tabs through every page checking for a visible focus ring at each stop.
Version 1.0.0 is published on GitHub as a zip ready to load in Chrome, and the repository holds the
listing text and screenshots prepared for the Chrome Web Store.
