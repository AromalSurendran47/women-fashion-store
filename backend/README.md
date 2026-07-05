# Sruvalle — Women's Fashion Store (Data Layer & Seed)

Production-quality **dummy data**, **Mongoose models**, **TypeScript types** and a
re-runnable **seed generator** for a premium women's fashion eCommerce store
(Next.js 15 + TypeScript + MongoDB + Mongoose).

Everything is generated from curated fashion content pools — no `Product 1`,
no lorem ipsum. Same seed → same data every run (deterministic).

---

## What you get

| Collection      | Count | Notes |
|-----------------|-------|-------|
| categories      | 12    | Dresses, Kurtis, Sarees, Ethnic, Party, Office… |
| products        | 100   | Real names, variants (colour × size), pricing, ratings |
| users           | 20    | 1 admin, 1 seller, 18 customers (+ addresses, cart, wishlist) |
| reviews         | 250   | Wired to real products & users; ratings roll up onto products |
| wishlist        | 18    | Standalone wishlist docs |
| cart            | ~9    | Standalone cart docs |
| coupons         | 15    | `WELCOME10`, `FESTIVE20`, `BUY2GET1`… |
| orders          | 60    | Full price breakdown, statuses, tracking, addresses |
| banners         | 12    | Hero / category / offer |
| testimonials    | 6     | |
| faq             | 15    | |
| newsletter      | 40    | |
| blogs           | 20    | Titled, tagged, HTML content |
| settings        | 1     | Store config, social, shipping, theme |

All image URLs use `https://picsum.photos` (deterministic seeded images).

---

## Folder structure

```
women fashion store/
├── package.json
├── tsconfig.json
├── .env.example              # copy to .env and set MONGODB_URI
├── README.md
├── data/                     # generated JSON output (git-ignore or commit)
│   ├── categories.json
│   ├── products.json
│   ├── users.json
│   ├── reviews.json
│   ├── wishlist.json
│   ├── cart.json
│   ├── coupons.json
│   ├── orders.json
│   ├── banners.json
│   ├── testimonials.json
│   ├── faq.json
│   ├── newsletter.json
│   ├── blogs.json
│   └── settings.json
├── src/
│   ├── lib/
│   │   └── db.ts             # cached Mongoose connection (Next.js-safe)
│   ├── types/
│   │   └── index.ts          # all TypeScript interfaces
│   └── models/               # Mongoose models (one per collection)
│       ├── index.ts          # barrel export
│       ├── User.ts  Category.ts  Product.ts  Review.ts
│       ├── Wishlist.ts  Cart.ts  Coupon.ts  Order.ts
│       └── Banner.ts  Testimonial.ts  Faq.ts  Newsletter.ts  Blog.ts  Settings.ts
└── seed/
    ├── pools.ts              # curated fashion content (names, copy, coupons, FAQs…)
    ├── generators.ts         # builds each collection + wires relationships
    ├── seed.ts               # main generator → writes JSON + inserts to MongoDB
    └── seed.js               # plain-JS importer: reads /data/*.json → MongoDB
```

---

## Setup

```bash
# 1. Install
npm install

# 2. Configure the DB connection
cp .env.example .env
#   edit MONGODB_URI  (local mongodb://127.0.0.1:27017/aura_fashion  or an Atlas URI)
```

---

## Seeding

The generator is deterministic (`faker.seed(...)`), so every run produces the
same data.

```bash
npm run seed         # generate → write data/*.json  AND  insert into MongoDB
npm run seed:json    # only write data/*.json  (no DB needed)
npm run seed:mongo   # only insert into MongoDB (regenerates in memory)
npm run import       # plain-node: read existing data/*.json → MongoDB (no TS/faker)
npm run typecheck    # tsc --noEmit
```

Tune counts via env vars (see `.env.example`):

```
SEED_USERS=20  SEED_PRODUCTS=100  SEED_REVIEWS=250  SEED_ORDERS=60
```

### Test credentials

Every seeded account uses the password **`Password123`**.

| Role     | Email |
|----------|-------|
| admin    | `admin@sruvalle.in` |
| seller   | `seller@sruvalle.in` |
| customer | `<firstname>.<lastname><n>@example.com` (see `data/users.json`) |

> The stored `password` is a bcrypt hash of `Password123`. Wire it up with
> `bcrypt.compare()` in your NextAuth credentials provider.

---

## Importing the JSON another way

The JSON files use **plain string** `_id`/reference fields and **ISO** dates.
Two supported import paths:

1. **`npm run import`** (recommended) — `seed/seed.js` casts strings back into
   `ObjectId`/`Date` and bulk-inserts. Just needs `mongoose`.

2. **`mongoimport`** — works too, but note the plain string ids stay strings
   unless you convert them. Prefer path (1) so references resolve correctly:
   ```bash
   mongoimport --uri "$MONGODB_URI" --collection products --file data/products.json --jsonArray
   ```

---

## Database relationships

```
Category 1───∞ Product
Product  1───∞ Review        (Review.product → Product._id)
User     1───∞ Review        (Review.user    → User._id)
User     1───∞ Order         (Order.user     → User._id)
Product  ∞───∞ Order         (Order.products[].product → Product._id, denormalised name/price)
User     1───1 Wishlist      (Wishlist.user  → User._id, unique)
User     1───1 Cart          (Cart.user      → User._id, unique)
User     ∞───∞ Product       (User.wishlist[] & User.cart[].product → Product._id)
```

Order line items and cart items **denormalise** name / thumbnail / price so
historical orders stay accurate even if a product later changes.
Review ratings are **rolled up** onto `Product.rating` and `Product.reviewCount`.

---

## Indexes

| Model    | Indexes |
|----------|---------|
| User     | `email` (unique), `role` |
| Category | `slug` (unique), `featured + order` |
| Product  | `slug` (unique), `sku` (unique), **text**(`name,description,brand`), `category`, `price`, `featured+newArrival+bestSeller+trending`, `rating` |
| Review   | `product + createdAt`, `user` |
| Order    | `orderNumber` (unique), `user + createdAt`, `status`, `paymentStatus` |
| Coupon   | `code` (unique), `active + expiresAt` |
| Wishlist / Cart | `user` (unique) |
| Blog     | `slug` (unique), `published + publishedAt`, `tags` |
| Banner   | `type + order + active` |
| Newsletter | `email` (unique) |
| Faq      | `category + order` |

---

## Using the models in Next.js

```ts
import { connectDB } from "@/lib/db";
import { Product, Category } from "@/models";

export async function getFeatured() {
  await connectDB();
  return Product.find({ featured: true })
    .populate("category")
    .sort({ rating: -1 })
    .limit(8)
    .lean();
}
```

---

## Notes

- Regenerate any time — the seed **wipes each collection** before inserting.
- To change product realism (names, copy, coupons, FAQs, blog topics), edit
  `seed/pools.ts` — no generator logic changes needed.
- `data/` is committed as the deliverable dataset. Add `data/` to `.gitignore`
  if you'd rather treat it as regenerated build output.
