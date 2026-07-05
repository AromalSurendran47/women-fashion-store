# Sruvalle — Women's Fashion Store

A premium women's fashion eCommerce project, split into two independent folders:

```
women fashion store/
├── backend/    # Data layer: MongoDB + Mongoose models, TS types, seed generator
└── frontend/   # Storefront: Next.js 15 + TypeScript + Tailwind (local dummy data)
```

The two are **decoupled** — the frontend currently runs on its own local dummy
data and does not call the backend. The backend is a ready-to-use data layer
(models + seeded MongoDB) you can expose via API routes and connect later.

---

## backend/

Mongoose models, TypeScript interfaces, indexes and a deterministic seed
generator that fills MongoDB with realistic data (100 products, 250 reviews,
60 orders, and 11 more collections) and also dumps `backend/data/*.json`.

```bash
cd backend
npm install
cp .env.example .env        # set MONGODB_URI
npm run seed                # generate JSON + insert into MongoDB
```

See [backend/README.md](backend/README.md) for full details.

---

## frontend/

A complete, responsive Next.js 15 storefront — home, product listing & details,
cart, wishlist, checkout, profile, blog, about, contact and auth pages — built
on local typed dummy data with Zustand state and React Query wired for future
APIs.

```bash
cd frontend
npm install
npm run dev                 # http://localhost:3000
```

See [frontend/README.md](frontend/README.md) for full details.

---

## Running them together (connected)

The two are now wired: the backend exposes an **Express REST API** over the
seeded MongoDB, and the frontend fetches from it — falling back to its bundled
dummy data if the API is unreachable, so nothing ever crashes.

```bash
# 1. Backend — seed the DB (once) and start the API
cd backend
npm install
cp .env.example .env            # set MONGODB_URI (+ PORT, default 5000)
npm run seed                    # load dummy data into MongoDB
npm run dev                     # API at http://localhost:5000/api

# 2. Frontend — point at the API and start
cd ../frontend
npm install
cp .env.example .env.local      # NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev                     # storefront at http://localhost:3000
```

**Two run modes**, each internally consistent:

| Mode | How | Data source |
|------|-----|-------------|
| Connected | `NEXT_PUBLIC_API_URL` set + API running | Backend (MongoDB via Express) |
| Standalone | `NEXT_PUBLIC_API_URL` empty/unset | Frontend's bundled dummy data |

If the API is set but momentarily down, the frontend transparently falls back to
local data (pages return 200, never error).

### API endpoints

`GET /api/health` · `/products` (`?filter=new|best|trending`, `?category=`) ·
`/products/:slug` · `/products/:slug/related` · `/categories` · `/categories/:slug` ·
`/reviews?productId=` · `/blogs` · `/blogs/:slug` · `/testimonials` · `/faqs` ·
`/banners` · `/coupons` · `POST /coupons/validate` · `/orders`.

Documents are mapped to frontend-shaped DTOs in `backend/src/lib/mappers.ts`.

### What's wired vs. still local

Catalog content (products, product details, categories, reviews, related items,
blogs, testimonials) is served by the API. Static marketing bits (hero/offer
banners, Instagram tiles) and the cart's coupon check stay client-local by
design — move them behind the API the same way (`frontend/src/lib/api.ts`) if
you want them dynamic too.
