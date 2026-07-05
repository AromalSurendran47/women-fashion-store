import type { ColorOption } from "@/types";

/**
 * Curated content pools used to build the dummy data deterministically.
 * Swap the image helper below for curated Unsplash fashion URLs any time —
 * everything else stays the same.
 */

export const img = (seed: string, w = 800, h = 1000) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const COLORS: ColorOption[] = [
  { name: "Black", hex: "#1A1A1A" },
  { name: "White", hex: "#F4F1EC" },
  { name: "Beige", hex: "#D8C3A5" },
  { name: "Brown", hex: "#6F4E37" },
  { name: "Pink", hex: "#E8B4C0" },
  { name: "Green", hex: "#2E7D5B" },
  { name: "Olive", hex: "#708238" },
  { name: "Blue", hex: "#3B5998" },
  { name: "Red", hex: "#B22222" },
  { name: "Mustard", hex: "#E1AD01" },
];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const BRANDS = [
  "Sruvalle",
  "Sruvalle Luxe",
  "Nova Thread",
  "Meraki",
  "Ivy & Oak",
  "Saanjh",
  "Rue Belle",
  "Verve",
];

export const FABRICS = [
  "Cotton",
  "Linen",
  "Rayon",
  "Georgette",
  "Chiffon",
  "Crepe",
  "Silk Blend",
  "Viscose",
  "Handloom Cotton",
  "Modal",
];

export const FITS = ["Regular", "Relaxed", "Slim", "A-Line", "Bodycon", "Oversized", "Straight"];

export const OCCASIONS = [
  "Casual",
  "Workwear",
  "Party",
  "Festive",
  "Vacation",
  "Everyday",
  "Brunch",
];

export const CARE = [
  "Machine wash cold with like colours",
  "Do not bleach",
  "Tumble dry low",
  "Warm iron on reverse",
  "Dry clean for best results",
  "Line dry in shade",
];

export const STYLE_ADJ = [
  "Floral",
  "Ruched",
  "Tiered",
  "Embroidered",
  "Pleated",
  "Smocked",
  "Ikat",
  "Block-Print",
  "Colour-Block",
  "Ditsy Floral",
  "Solid",
  "Striped",
  "Gathered",
  "Cutwork",
];

export const DESC_INTRO = [
  "Cut from breathable {fabric}, this {type} moves with you from morning to night.",
  "A wardrobe staple reimagined — this {fabric} {type} balances comfort with quiet luxury.",
  "Designed in-house, the {type} pairs a flattering silhouette with a soft {fabric} hand-feel.",
  "Meet your new favourite: a {fabric} {type} that feels as good as it looks.",
  "Effortless and elevated, this {type} is crafted from premium {fabric} for all-day ease.",
];

export const DESC_BODY = [
  "Thoughtful details — a defined waist, considered drape and a clean finish — make it feel far above its price.",
  "The relaxed cut skims the body without clinging, while a breathable weave keeps you cool through the day.",
  "Style it up with heels for evening or keep it easy with flats and a tote for the weekend.",
  "Fully lined where it matters, with side pockets and a concealed zip for a seamless fit.",
  "A versatile piece that layers beautifully and moves from workday to weekend without missing a beat.",
];

export const CATEGORY_DEFS = [
  {
    name: "Dresses",
    slug: "dresses",
    description: "From breezy midis to statement maxis — dresses for every moment.",
    types: ["Midi Dress", "Maxi Dress", "Wrap Dress", "Shift Dress", "Skater Dress"],
    featured: true,
  },
  {
    name: "Kurtis",
    slug: "kurtis",
    description: "Everyday elegance in handcrafted prints and easy silhouettes.",
    types: ["Straight Kurti", "A-Line Kurti", "Anarkali Kurti", "Printed Kurti"],
    featured: true,
  },
  {
    name: "Sarees",
    slug: "sarees",
    description: "Drapes that tell a story — woven, printed and hand-embellished.",
    types: ["Georgette Saree", "Linen Saree", "Chiffon Saree", "Organza Saree"],
    featured: true,
  },
  {
    name: "Tops",
    slug: "tops",
    description: "The everyday hero — tanks, blouses and statement sleeves.",
    types: ["Ruffle Top", "Peplum Top", "Wrap Top", "Puff-Sleeve Top", "Cami Top"],
    featured: true,
  },
  {
    name: "Bottoms",
    slug: "bottoms",
    description: "Trousers, palazzos and skirts cut for comfort and movement.",
    types: ["Wide-Leg Trousers", "Palazzo Pants", "Culottes", "Pleated Skirt"],
    featured: false,
  },
  {
    name: "Co-Ord Sets",
    slug: "co-ord-sets",
    description: "Effortlessly put-together matching sets for a done-in-one look.",
    types: ["Printed Co-Ord Set", "Linen Co-Ord Set", "Crop & Skirt Set"],
    featured: true,
  },
  {
    name: "Ethnic Wear",
    slug: "ethnic-wear",
    description: "Timeless Indian craftsmanship reimagined for the modern woman.",
    types: ["Anarkali Suit", "Sharara Set", "Palazzo Suit", "Straight Suit"],
    featured: true,
  },
  {
    name: "Western Wear",
    slug: "western-wear",
    description: "Contemporary silhouettes for the city and beyond.",
    types: ["Blazer", "Jumpsuit", "Playsuit", "Denim Jacket"],
    featured: false,
  },
  {
    name: "Party Wear",
    slug: "party-wear",
    description: "Sequins, satin and shine for nights that matter.",
    types: ["Sequin Dress", "Satin Slip Dress", "Cocktail Dress"],
    featured: true,
  },
  {
    name: "Office Wear",
    slug: "office-wear",
    description: "Sharp, comfortable and boardroom-ready essentials.",
    types: ["Formal Shirt", "Pencil Skirt", "Tailored Trousers", "Sheath Dress"],
    featured: false,
  },
  {
    name: "Summer Collection",
    slug: "summer-collection",
    description: "Light layers, breathable weaves and sun-ready shades.",
    types: ["Cotton Sundress", "Linen Shirt", "Beach Kaftan", "Tiered Maxi"],
    featured: true,
  },
  {
    name: "New Arrivals",
    slug: "new-arrivals",
    description: "The freshest drops, restocked weekly.",
    types: ["Statement Dress", "Printed Blouse", "Utility Jumpsuit", "Flowy Maxi"],
    featured: true,
  },
];

export const FIRST_NAMES = [
  "Aanya", "Diya", "Ishita", "Kavya", "Meera", "Nisha", "Priya", "Riya", "Saanvi", "Tara",
  "Ananya", "Gauri", "Kiara", "Lavanya", "Myra", "Neha", "Rhea", "Sneha", "Trisha", "Zara",
];

export const LAST_NAMES = [
  "Sharma", "Verma", "Nair", "Iyer", "Reddy", "Menon", "Kapoor", "Malhotra", "Rao", "Joshi",
];

export const CITIES = [
  "Mumbai", "Bengaluru", "Delhi", "Hyderabad", "Chennai", "Pune", "Kochi", "Kolkata", "Jaipur",
];

export const REVIEW_TITLES = [
  "Absolutely in love!",
  "Great quality for the price",
  "Perfect fit",
  "Exceeded my expectations",
  "My new go-to",
  "Beautiful fabric",
  "Worth every rupee",
  "Comfortable and chic",
  "Got so many compliments",
  "Runs true to size",
];

export const REVIEW_COMMENTS = [
  "The fabric is soft and breathable — perfect for Indian summers. Fit is true to size and the colour is exactly as shown.",
  "Delivery was quick and the packaging felt premium. The stitching is neat and it looks far more expensive than it is.",
  "I sized up based on reviews and it fits beautifully. Great for both work and weekend outings.",
  "Lovely drape and the print doesn't fade after washing. Ordering another colour for sure.",
  "Comfortable enough to wear all day. Got compliments the very first time I wore it.",
  "Exactly what I was looking for. The waist detailing is very flattering.",
];
