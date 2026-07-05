# Sruvalle — Women's Fashion Frontend

A premium women's fashion eCommerce **frontend** built with **Next.js 15 (App
Router) + TypeScript + Tailwind CSS**. Fully responsive, production-quality UI,
running entirely on **local dummy data** — no backend, no API routes, no
database.

> This lives alongside the separate `../backend` data layer (Mongoose models +
> seed). The two are independent: this app never talks to MongoDB.

---

## Tech stack

| Concern         | Choice |
|-----------------|--------|
| Framework       | Next.js 15 (App Router, RSC) |
| Language        | TypeScript (strict) |
| Styling         | Tailwind CSS + custom theme tokens |
| Icons           | lucide-react |
| Animations      | Framer Motion + CSS transitions |
| Forms           | react-hook-form |
| Validation      | zod (available) |
| State           | Zustand (persisted cart & wishlist) |
| Data fetching   | @tanstack/react-query (wired, ready for real APIs) |
| UI primitives   | Hand-built in the shadcn style (cva + `cn`) |

---

## Getting started

```bash
cd frontend
npm install
npm run dev       # http://localhost:3000
```

Other scripts:

```bash
npm run build     # production build (prerenders 150+ static pages)
npm run start     # serve the production build
npm run lint      # next lint
npm run typecheck # tsc --noEmit
```

---

## Project structure

```
frontend/
├── src/
│   ├── app/                        # App Router pages
│   │   ├── layout.tsx  page.tsx    # root layout + homepage
│   │   ├── providers.tsx           # React Query provider
│   │   ├── products/               # PLP + [slug] PDP
│   │   ├── collections/            # all + [slug] category
│   │   ├── cart/  wishlist/
│   │   ├── checkout/  checkout/success/
│   │   ├── profile/                # layout + dashboard/orders/addresses/account
│   │   ├── blog/  blog/[slug]/
│   │   ├── about/  contact/
│   │   ├── login/  signup/  forgot-password/
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                      # Button, Badge, Rating, Price, Accordion, …
│   │   ├── common/                  # ProductCard, ProductGrid, CategoryCard, Newsletter
│   │   ├── layout/                  # Announcement, Navbar, Footer, drawers, search
│   │   ├── home/                    # Hero, carousels, flash sale, features, …
│   │   ├── product/                 # Gallery, Info, Tabs, Filters, Listing
│   │   ├── profile/                 # ProfileSidebar
│   │   └── auth/                    # AuthShell
│   ├── data/                        # ALL dummy data (typed TS)
│   │   ├── _pools.ts                # curated content pools + image helper
│   │   ├── products.ts  categories.ts  reviews.ts  blogs.ts
│   │   ├── banners.ts  testimonials.ts  faq.ts  coupons.ts
│   │   ├── orders.ts  cart.ts  wishlist.ts  notifications.ts
│   ├── store/                       # Zustand: cart, wishlist, ui
│   ├── hooks/                       # useMounted, useMediaQuery
│   ├── lib/                         # utils (cn, formatPrice, seededRandom), constants
│   └── types/                       # shared interfaces
├── tailwind.config.ts  next.config.mjs  tsconfig.json
```

---

## Dummy data

All data is generated **deterministically** at module load (see
`lib/utils.ts → seededRandom`). The same values are produced on the server and
the client, so there are **no hydration mismatches**.

- **100 products** with variants, pricing, ratings, colours & sizes
- **12 categories**, **250 reviews**, **20 blog posts**, **15 FAQs**,
  **15 testimonials**, **5 coupons**, sample **orders** & **notifications**

To change realism (product names, copy, coupons, blog topics), edit
`src/data/_pools.ts` — the generators do the rest.

### Images

Images use `https://picsum.photos` (deterministic seeded URLs — always render).
To switch to curated Unsplash fashion photos, change the single `img()` helper
in `src/data/_pools.ts`. Remote hosts are allow-listed in `next.config.mjs`.

---

## Theme

Defined in `tailwind.config.ts` + `globals.css`:

| Token         | Value    |
|---------------|----------|
| background    | `#FFFFFF` |
| secondary     | `#F8F5F2` |
| ink (text)    | `#111111` |
| accent        | `#D8C6B2` |
| Headings font | Playfair Display |
| Body font     | Montserrat |

---

## Pages included

Home · Product Listing (filters, sort, grid/list, load-more) · Product Details
(gallery zoom, variants, tabs, reviews, related) · Cart (coupons, summary) ·
Wishlist · Checkout (form + payment) · Order Success · Profile
(dashboard/orders/addresses/account) · Blog list & detail · About · Contact
(form, map placeholder, FAQ) · Login · Signup · Forgot Password · 404.

---

## Connecting a real backend later

React Query is already provided in `app/providers.tsx`. To go live, replace the
imports from `src/data/*` with `useQuery` hooks that call your API (e.g. the
Mongoose data layer in `../backend`). Component props are already typed against
`src/types`, so the swap is localised.
