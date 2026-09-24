---
title: StockFlow
tagline: Inventory management web app
summary: A full-stack inventory app for small shops, covering products, stock movements, suppliers and reports, with role-based access and a one-click demo account.
type: web-app
stack: [Next.js, TypeScript, Prisma, PostgreSQL, Auth.js, Tailwind CSS, shadcn/ui, TanStack Table, Recharts, Zod, Playwright]
liveUrl: '#' # TODO: add the live demo URL once it is deployed
repoUrl: '#' # TODO: add the public repository URL once it exists
cover: /projects/stockflow/cover.svg
coverAlt: StockFlow cover image with the project name on a blue background
order: 5
featured: false
problem: >-
  Small shops often track their stock in a spreadsheet nobody fully trusts: quantities are edited
  by hand, there is no record of who changed what, and the first sign that an item is running low is
  an empty shelf. Off-the-shelf systems tend to be either too simple to trust or too expensive for a
  team of three.
solution: >-
  A Next.js App Router application with Server Actions, Prisma and PostgreSQL. A product's
  quantity changes only through a recorded stock movement inside a database transaction, and it can
  never go below zero. Auth.js handles sign-in with bcrypt-hashed passwords, and every server action
  checks the user's role on the server, not only in the interface. A demo account lets anyone try
  the whole app without signing up.
features:
  - Dashboard with KPI cards, a 30-day chart of stock in versus stock out, the five best sellers and low-stock alerts
  - Products table with search, filters, sorting and server-side pagination; create and edit in a dialog, archive, and see each product's movement history
  - Stock in, stock out and adjustments with a product search, plus a movement history filterable by date, type and user
  - Admin, Staff and Demo roles enforced by middleware and by every server action, with an audit log of changes
  - CSV export of products and movements and a stock valuation report by category
  - Command palette (Ctrl+K), collapsible sidebar, dark mode, toasts and skeleton loading states on every screen
---

**Seeded to look real.** The seed script creates admin, staff and demo users, six categories, five
suppliers, sixty generic electronics products and four hundred movements spread over ninety days,
so the charts have something to say from the first login. The demo data can be reset with one
command.

**Security on the server.** Middleware protects every private route, Zod validates every input on
the server with the same schemas the forms use, the login is rate limited, and secrets live in
environment variables with a complete `.env.example`.

**Tested end to end.** Vitest covers the business rules, including the one that keeps stock from
going negative, and the rule that staff can never delete anything. Playwright drives the main flows
in a real browser as each role, including a staff user who is offered no way to archive or delete a
product.
