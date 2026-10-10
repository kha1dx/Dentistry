# Dentistry

A UI/UX prototype for a one-person business that supplies dental students with instruments, materials and kits, and handles repairs for them. It has two connected sides:

- **Console** (`#/admin`) for the owner: one inbox for every channel, orders and repairs boards, clients, catalog and pricing, invoices and payments, automations, suppliers and partners, reports, and settings.
- **Storefront** (`#/shop`) for students: shop by year, a requirements-list builder, kits, checkout, repair booking with loaners and price approval, order and repair tracking, an account page, and a support widget (chat, call-back, WhatsApp).
- **Overview** (`#/`) is the pitch page: what the system is, which numbers matter and why, what's automated, and a rollout plan.

Everything runs on sample data in the browser. Actions work across both sides: place an order or send a chat message in the storefront and it shows up in the console.

The research behind the design is in [`docs/RESEARCH.md`](docs/RESEARCH.md). A short visual proposal to share with the owner is in [`docs/Cusp-proposal.pdf`](docs/Cusp-proposal.pdf).

## Run it

```bash
cd prototype
npm install
npm run dev          # http://localhost:5173
npm run build        # static build in prototype/dist (hash routing, host anywhere)
npm run build:single # one self-contained HTML file in prototype/dist-single
```

## Structure

```
prototype/
  src/
    config/brand.ts        brand name, owner, contact details, fixed "now" for the demo
    data/                  types, catalog (products, kits, requirement lists, partners), seeded sample data
    lib/metrics.ts         every KPI and breakdown, computed from the raw records
    store/useStore.ts      app state and actions (orders, repairs, payments, chat, cart…)
    components/            UI primitives, charts (hand-built SVG), instrument line drawings
    layouts/               console shell and storefront shell
    pages/admin/           console screens
    pages/store/           storefront screens
    pages/Overview.tsx     proposal page
```

Stack: React 18, TypeScript, Vite, Tailwind CSS, Zustand, lucide icons. The data layer is shaped like a real backend (clients, orders, line items, repairs, invoices, conversations), so the screens can be wired to an API later without being redesigned.

## Placeholders

"Cusp", the owner "Youssef", every client, figure and review are sample data. Change the brand and owner in `src/config/brand.ts`.
