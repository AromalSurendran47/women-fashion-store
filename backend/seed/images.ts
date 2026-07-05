/**
 * Curated, real women's-fashion image URLs (Unsplash) — every ID has been
 * verified to load AND to actually depict women's clothing. Grouped by category
 * so products get on-theme photography instead of random placeholders.
 */

// Unsplash photo IDs (all verified women's fashion)
const P = {
  gown: "1595777457583-95e059d581b8", // red evening gown
  redFloral: "1572804013309-59a88b7e92f1", // red floral dress
  blueCoat: "1539109136881-3be0616acf4b", // blue trench, street style
  rack1: "1490481651871-ab68de25d43d", // clothing rack, neutrals
  pinkPants: "1594633312681-425c7b97ccd1", // pink trousers
  yellowCoord: "1515886657613-9f3515b0c78f", // yellow co-ord tracksuit
  shopping: "1483985988355-763728e1935b", // woman with shopping bags
  greenCrop: "1469334031218-e382a71b716b", // green crop top
  rack2: "1445205170230-053b83016050", // boutique rack, warm tones
  store: "1441984904996-e0b6ba687e04", // fashion store interior
  whiteFloral: "1496747611176-843222e1e57c", // white floral wrap dress
  heels: "1518049362265-d5b2a6467637", // embellished heels
  pinkCoat: "1485462537746-965f33f7f6a7", // pink coat
  whiteTee: "1479064555552-3ef4979f8908", // white tee, casual
  blackTee: "1554568218-0f1715e72254", // black tee + jeans
  cropTee: "1583744946564-b52ac1c389c8", // cropped tee + jeans
  polka: "1503342217505-b0a15ec3261c", // red polka-dot dress
  whiteGown: "1502716119720-b23a93e5fe1b", // flowing white gown
};

/** Build an Unsplash URL with crop + sizing. */
const u = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const BY_CATEGORY: Record<string, string[]> = {
  dresses: [P.gown, P.redFloral, P.whiteFloral, P.polka, P.whiteGown],
  kurtis: [P.redFloral, P.whiteFloral, P.polka, P.greenCrop],
  sarees: [P.whiteGown, P.redFloral, P.whiteFloral, P.gown],
  tops: [P.greenCrop, P.whiteTee, P.blackTee, P.cropTee],
  bottoms: [P.pinkPants, P.yellowCoord, P.blackTee, P.cropTee],
  "co-ord-sets": [P.yellowCoord, P.blueCoat, P.pinkPants, P.greenCrop],
  "ethnic-wear": [P.gown, P.whiteGown, P.redFloral, P.whiteFloral, P.polka],
  "western-wear": [P.blueCoat, P.shopping, P.pinkCoat, P.cropTee],
  "party-wear": [P.gown, P.whiteGown, P.heels, P.blueCoat],
  "office-wear": [P.pinkCoat, P.shopping, P.blackTee, P.blueCoat],
  "summer-collection": [P.whiteFloral, P.polka, P.greenCrop, P.redFloral],
  "new-arrivals": [P.gown, P.redFloral, P.yellowCoord, P.whiteFloral, P.cropTee],
};

const GENERAL = [
  P.gown, P.redFloral, P.blueCoat, P.pinkPants, P.yellowCoord, P.greenCrop,
  P.whiteFloral, P.pinkCoat, P.whiteTee, P.blackTee, P.cropTee, P.polka, P.whiteGown,
];

/** Four gallery images for a product, on-theme for its category. */
export function productImages(categorySlug: string, seedIndex: number): string[] {
  const pool = BY_CATEGORY[categorySlug] ?? GENERAL;
  return Array.from({ length: 4 }, (_, k) => {
    const id = pool[(seedIndex + k) % pool.length];
    return u(id, 700, 900);
  });
}

/** Variant image (per colour) — reuse the product's first, tinted by index. */
export function variantImage(categorySlug: string, seedIndex: number): string {
  const pool = BY_CATEGORY[categorySlug] ?? GENERAL;
  return u(pool[seedIndex % pool.length], 700, 900);
}

export function categoryImage(categorySlug: string): string {
  const pool = BY_CATEGORY[categorySlug] ?? GENERAL;
  return u(pool[0], 600, 800);
}

export function categoryBanner(categorySlug: string): string {
  const pool = BY_CATEGORY[categorySlug] ?? GENERAL;
  return u(pool[pool.length - 1], 1600, 600);
}

const HERO = [P.whiteGown, P.gown, P.blueCoat, P.yellowCoord];
export function heroImage(i: number): string {
  return u(HERO[i % HERO.length], 1920, 1080);
}

export function blogImage(i: number): string {
  return u(GENERAL[i % GENERAL.length], 1200, 800);
}

export function collectionImage(): string {
  return u(P.rack2, 1920, 900);
}

export function offerImage(): string {
  return u(P.shopping, 1600, 600);
}

export function instagramImage(i: number): string {
  return u(GENERAL[(i * 2) % GENERAL.length], 600, 600);
}

/** Real face avatars (pravatar) — reliable, varied portraits. */
export function avatar(i: number): string {
  return `https://i.pravatar.cc/150?img=${(i % 70) + 1}`;
}
