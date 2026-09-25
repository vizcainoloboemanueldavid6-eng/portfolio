---
title: StockFlow
tagline: Inventory management web app
summary: A full-stack inventory app for small shops, covering products, stock movements, suppliers and reports, with roles enforced on the server and a public one-click demo.
type: web-app
stack: [Next.js, TypeScript, Prisma, PostgreSQL, SQLite, Auth.js, Tailwind CSS, shadcn/ui, TanStack Table, Recharts, Zod, Vitest, Playwright]
liveUrl: https://stockflow-seven-sage.vercel.app # TODO: this project's live demo (already deployed) — update it if the address changes
repoUrl: https://github.com/vizcainoloboemanueldavid6-eng/stockflow # TODO: this project's repository — keep it on the same GitHub account as profile.links.github
cover: /projects/stockflow/cover.webp
coverAlt: The StockFlow dashboard in the dark theme, with inventory value, product, low-stock and movement cards, a 30-day stock in versus stock out chart and the five best sellers
order: 5
featured: false
problem: >-
  Small shops often track their stock in a spreadsheet nobody fully trusts: quantities are edited
  by hand, there is no record of who changed what, and the first sign that an item is running low is
  an empty shelf. Off-the-shelf systems tend to be either too simple to trust or too expensive for a
  team of three.
solution: >-
  A Next.js App Router application with Server Actions and Prisma. A product's quantity changes
  only through a recorded stock movement, inside a database transaction, with a single conditional
  update, so it can never go below zero, not even when two sales arrive at the same moment. Every
  action checks the user's role on the server, re-read from the database, instead of trusting the
  interface. It runs on PostgreSQL, or with no database service at all in a SQLite demo mode, which
  is how the public demo runs: its data resets on its own, and a "Try the demo" button on the sign-in
  page opens it in one click.
features:
  - Dashboard with inventory value, low-stock and today's movement cards, a 30-day chart of stock in versus out, the five best sellers and low-stock alerts with a one-click restock
  - Products table with server-side search, filters, sorting and pagination kept in the URL; create and edit in a dialog, archive and restore, and a detail page with each product's movement history
  - Stock in, stock out and adjustments with a searchable product picker and a live preview of the resulting stock, plus a history filterable by date, type and user
  - Admin, Staff and Demo roles checked by every server action, with an audit-log entry written in the same transaction as each change
  - CSV export of products and movements and a stock valuation report by category
  - Command palette (Ctrl+K), collapsible sidebar, light and dark themes, toasts, loading skeletons and layouts that work down to a 390 px phone
screenshots:
  - src: /projects/stockflow/products.webp
    alt: The StockFlow products table in the light theme, with search, category, supplier and stock filters, stock status badges, prices and pagination
    caption: Search, filters, sorting and pagination run on the server and stay in the URL.
  - src: /projects/stockflow/movements.webp
    alt: The movements history in the dark theme, listing stock in, stock out and adjustments with their date, product, change, reason and user
    caption: Stock only changes through a movement, and every movement is recorded.
  - src: /projects/stockflow/alerts.webp
    alt: The low-stock alerts table in the light theme, listing products out of stock or at their reorder level with their supplier and a Restock button on each row
    caption: Low-stock alerts come emptiest first, each with a one-click restock.
  - src: /projects/stockflow/mobile.webp
    alt: The StockFlow dashboard on a phone screen in the light theme, with the indicator cards and the stock chart
    caption: Tables drop columns by breakpoint, so no page scrolls sideways on a phone.
---

**Stock that cannot go negative.** A decrease is one statement, "take n units where at least n
are left", so the database decides on the row it locks. Two overlapping sales of the last units
cannot both succeed: the second gets "not enough stock". An integration test forces that
interleaving on real PostgreSQL, where a `CHECK (quantity >= 0)` constraint also backs the rule up.

**Security on the server.** Middleware protects every private route, and each server action checks
the role again, so calling an action directly, without the interface, is refused just the same. Zod validates
every input on the server with the same schemas the forms use, passwords are hashed with bcrypt and
sign-in is rate limited. While the public demo is on, the shared demo accounts cannot be deleted or
have their password changed, so no visitor can lock the others out.

**Tested at three levels.** Vitest covers the business rules, the permission matrix and every
restricted action called with a Staff or Demo session. Integration tests run against a real
database. Playwright goes through every page as each role in both themes, and replays the exact
request an admin's browser sends to delete a product with a Staff session, which the server must
refuse. The sample shop is generated: 60 products with generic names, 5 suppliers and 400 movements
over 90 days, with no real brands.
