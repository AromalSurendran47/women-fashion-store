/**
 * Curated content pools for the Sruvalle Fashion seed generator.
 * These are hand-written so generated documents read like a real premium
 * women's fashion store — no "Product 1" / lorem ipsum.
 */

export const COLORS: { name: string; hex: string }[] = [
  { name: "Black", hex: "#1A1A1A" },
  { name: "White", hex: "#FFFFFF" },
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
  "Kalki Studio",
  "Verve",
  "Indira",
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
  "Denim",
  "Modal",
  "Organza",
  "Handloom Cotton",
];

export const FITS = ["Regular", "Relaxed", "Slim", "A-Line", "Bodycon", "Oversized", "Straight"];

export const OCCASIONS = [
  "Casual",
  "Workwear",
  "Party",
  "Festive",
  "Wedding",
  "Vacation",
  "Everyday",
  "Brunch",
];

export const CARE_INSTRUCTIONS = [
  "Machine wash cold with like colours",
  "Do not bleach",
  "Tumble dry low",
  "Warm iron on reverse",
  "Dry clean only",
  "Hand wash separately",
  "Do not wring",
  "Line dry in shade",
];

/* ---------------- Categories ---------------- */

export const CATEGORIES = [
  {
    name: "Dresses",
    slug: "dresses",
    description: "From breezy midis to statement maxis — dresses for every moment.",
    types: ["Midi Dress", "Maxi Dress", "Wrap Dress", "Shift Dress", "Bodycon Dress", "Skater Dress", "Shirt Dress"],
    featured: true,
  },
  {
    name: "Kurtis",
    slug: "kurtis",
    description: "Everyday elegance in handcrafted prints and easy silhouettes.",
    types: ["Straight Kurti", "A-Line Kurti", "Anarkali Kurti", "Angrakha Kurti", "Printed Kurti"],
    featured: true,
  },
  {
    name: "Sarees",
    slug: "sarees",
    description: "Drapes that tell a story — woven, printed and hand-embellished.",
    types: ["Georgette Saree", "Banarasi Saree", "Linen Saree", "Chiffon Saree", "Organza Saree"],
    featured: true,
  },
  {
    name: "Tops",
    slug: "tops",
    description: "The everyday hero — tanks, blouses and statement sleeves.",
    types: ["Ruffle Top", "Peplum Top", "Wrap Top", "Puff-Sleeve Top", "Tie-Front Top", "Cami Top"],
    featured: true,
  },
  {
    name: "Bottoms",
    slug: "bottoms",
    description: "Trousers, palazzos and skirts cut for comfort and movement.",
    types: ["Wide-Leg Trousers", "Palazzo Pants", "Culottes", "Pleated Skirt", "Denim Jeans", "Paperbag Shorts"],
    featured: false,
  },
  {
    name: "Co-Ord Sets",
    slug: "co-ord-sets",
    description: "Effortlessly put-together matching sets for a done-in-one look.",
    types: ["Printed Co-Ord Set", "Linen Co-Ord Set", "Crop & Skirt Set", "Shirt & Shorts Set"],
    featured: true,
  },
  {
    name: "Ethnic Wear",
    slug: "ethnic-wear",
    description: "Timeless Indian craftsmanship reimagined for the modern woman.",
    types: ["Anarkali Suit", "Sharara Set", "Lehenga Set", "Palazzo Suit", "Straight Suit"],
    featured: true,
  },
  {
    name: "Western Wear",
    slug: "western-wear",
    description: "Contemporary silhouettes for the city and beyond.",
    types: ["Blazer", "Jumpsuit", "Playsuit", "Bodysuit", "Denim Jacket"],
    featured: false,
  },
  {
    name: "Party Wear",
    slug: "party-wear",
    description: "Sequins, satin and shine for nights that matter.",
    types: ["Sequin Dress", "Satin Slip Dress", "Embellished Gown", "Cocktail Dress"],
    featured: true,
  },
  {
    name: "Office Wear",
    slug: "office-wear",
    description: "Sharp, comfortable and boardroom-ready essentials.",
    types: ["Formal Shirt", "Pencil Skirt", "Tailored Trousers", "Structured Blazer", "Sheath Dress"],
    featured: false,
  },
  {
    name: "Summer Collection",
    slug: "summer-collection",
    description: "Light layers, breathable weaves and sun-ready shades.",
    types: ["Cotton Sundress", "Linen Shirt", "Beach Kaftan", "Tiered Maxi", "Crop Top"],
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

/* ---------------- Product copy ---------------- */

export const STYLE_ADJECTIVES = [
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
  "Abstract",
  "Solid",
  "Striped",
  "Gathered",
  "Cutwork",
];

export const DESCRIPTION_INTROS = [
  "Cut from breathable {fabric}, this {type} moves with you from morning to night.",
  "A wardrobe staple reimagined — this {fabric} {type} balances comfort with quiet luxury.",
  "Designed in-house, the {type} pairs a flattering {fit} silhouette with a soft {fabric} hand-feel.",
  "Meet your new favourite: a {fabric} {type} that feels as good as it looks.",
  "Effortless and elevated, this {type} is crafted from premium {fabric} for all-day ease.",
];

export const DESCRIPTION_BODIES = [
  "Thoughtful details — a defined waist, considered drape and a clean finish — make it feel far above its price.",
  "The relaxed cut skims the body without clinging, while breathable weave keeps you cool through the day.",
  "Style it up with heels for evening or keep it easy with flats and a tote for the weekend.",
  "Fully lined where it matters, with side pockets and a concealed zip for a seamless fit.",
  "A versatile piece that layers beautifully and transitions from workday to weekend without missing a beat.",
];

/* ---------------- People (Indian names) ---------------- */

export const FIRST_NAMES = [
  "Aanya", "Diya", "Ishita", "Kavya", "Meera", "Nisha", "Priya", "Riya", "Saanvi", "Tara",
  "Ananya", "Bhavya", "Charvi", "Gauri", "Harini", "Ira", "Jhanvi", "Kiara", "Lavanya", "Myra",
  "Neha", "Pooja", "Rhea", "Sneha", "Trisha", "Vaani", "Zara", "Aditi", "Divya", "Sara",
];

export const LAST_NAMES = [
  "Sharma", "Verma", "Nair", "Iyer", "Reddy", "Menon", "Kapoor", "Malhotra", "Chowdhury", "Bose",
  "Pillai", "Rao", "Gupta", "Joshi", "Desai", "Bhat", "Kulkarni", "Sinha", "Mehta", "Kaur",
];

export const CITIES = [
  { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  { city: "Bengaluru", state: "Karnataka", pincode: "560001" },
  { city: "Delhi", state: "Delhi", pincode: "110001" },
  { city: "Hyderabad", state: "Telangana", pincode: "500001" },
  { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  { city: "Pune", state: "Maharashtra", pincode: "411001" },
  { city: "Kochi", state: "Kerala", pincode: "682001" },
  { city: "Kolkata", state: "West Bengal", pincode: "700001" },
  { city: "Ahmedabad", state: "Gujarat", pincode: "380001" },
  { city: "Jaipur", state: "Rajasthan", pincode: "302001" },
];

export const STREETS = [
  "Rose Villa, MG Road",
  "12 Palm Grove, Indiranagar",
  "204 Sea Breeze, Marine Drive",
  "7 Jasmine Lane, Banjara Hills",
  "45 Lotus Residency, Koramangala",
  "18 Orchid Street, Vashi",
  "9 Green Meadows, Whitefield",
  "301 Sunrise Apartments, Anna Nagar",
];

/* ---------------- Reviews ---------------- */

export const REVIEW_TITLES = [
  "Absolutely in love!",
  "Great quality for the price",
  "Perfect fit",
  "Exceeded my expectations",
  "My new go-to",
  "Beautiful fabric",
  "Runs slightly small",
  "Worth every rupee",
  "Comfortable and chic",
  "Got so many compliments",
];

export const REVIEW_COMMENTS = [
  "The fabric is soft and breathable — perfect for Indian summers. Fit is true to size and the colour is exactly as shown.",
  "Delivery was quick and the packaging felt premium. The stitching is neat and it looks much more expensive than it is.",
  "I sized up based on reviews and it fits beautifully. Great for both work and weekend outings.",
  "Lovely drape and the print doesn't fade after washing. Ordering another colour for sure.",
  "Comfortable enough to wear all day. Got compliments the very first time I wore it.",
  "Colour is slightly lighter than the photos but still gorgeous. Quality is excellent.",
  "Exactly what I was looking for. The waist detailing is very flattering.",
  "A bit longer than expected but a quick hem fixed it. Otherwise perfect.",
];

/* ---------------- Coupons ---------------- */

export const COUPONS = [
  { code: "WELCOME10", description: "10% off your first order", discountType: "percentage", discountValue: 10, minOrderValue: 999, maxDiscount: 500 },
  { code: "SUMMER15", description: "15% off the summer collection", discountType: "percentage", discountValue: 15, minOrderValue: 1499, maxDiscount: 800 },
  { code: "FESTIVE20", description: "Festive season — flat 20% off", discountType: "percentage", discountValue: 20, minOrderValue: 1999, maxDiscount: 1200 },
  { code: "BUY2GET1", description: "Buy 2 get 1 free on tops", discountType: "percentage", discountValue: 33, minOrderValue: 1799, maxDiscount: 1500 },
  { code: "FLAT300", description: "Flat ₹300 off orders above ₹1500", discountType: "fixed", discountValue: 300, minOrderValue: 1500, maxDiscount: 300 },
  { code: "ETHNIC25", description: "25% off ethnic wear", discountType: "percentage", discountValue: 25, minOrderValue: 2499, maxDiscount: 1500 },
  { code: "NEWYOU", description: "12% off for new members", discountType: "percentage", discountValue: 12, minOrderValue: 999, maxDiscount: 600 },
  { code: "WEEKEND10", description: "Weekend flash — 10% off", discountType: "percentage", discountValue: 10, minOrderValue: 799, maxDiscount: 400 },
  { code: "FLAT500", description: "₹500 off orders above ₹2999", discountType: "fixed", discountValue: 500, minOrderValue: 2999, maxDiscount: 500 },
  { code: "SAREE15", description: "15% off all sarees", discountType: "percentage", discountValue: 15, minOrderValue: 1999, maxDiscount: 900 },
  { code: "APPONLY", description: "App-exclusive 18% off", discountType: "percentage", discountValue: 18, minOrderValue: 1299, maxDiscount: 750 },
  { code: "BIGDAY30", description: "Anniversary sale — 30% off", discountType: "percentage", discountValue: 30, minOrderValue: 2999, maxDiscount: 2000 },
  { code: "FREESHIP", description: "Free shipping, no minimum", discountType: "fixed", discountValue: 99, minOrderValue: 0, maxDiscount: 99 },
  { code: "LOYAL20", description: "20% off for returning customers", discountType: "percentage", discountValue: 20, minOrderValue: 1799, maxDiscount: 1000 },
  { code: "MONSOON12", description: "Monsoon edit — 12% off", discountType: "percentage", discountValue: 12, minOrderValue: 1099, maxDiscount: 500 },
];

/* ---------------- FAQ ---------------- */

export const FAQS = [
  { q: "How do I find my correct size?", a: "Every product page has a detailed size chart with measurements in inches and centimetres. If you're between sizes, we recommend sizing up for a relaxed fit.", category: "Sizing" },
  { q: "What is your return policy?", a: "We offer easy 7-day returns and exchanges on unworn items with original tags. Refunds are processed to the original payment method within 5–7 business days.", category: "Returns" },
  { q: "How long does delivery take?", a: "Standard delivery takes 4–6 business days, while express delivery arrives in 2–3 days. Metro cities are usually faster.", category: "Shipping" },
  { q: "Do you offer free shipping?", a: "Yes! Orders above ₹1,499 ship free. A flat ₹99 applies to orders below that.", category: "Shipping" },
  { q: "Which payment methods do you accept?", a: "We accept UPI, all major credit and debit cards, net banking and Cash on Delivery, all secured via Razorpay.", category: "Payments" },
  { q: "Is Cash on Delivery available?", a: "COD is available on orders up to ₹5,000 across most serviceable pincodes.", category: "Payments" },
  { q: "How can I track my order?", a: "Once shipped, you'll receive a tracking link by SMS and email. You can also track it under Profile → Order History.", category: "Orders" },
  { q: "Can I cancel or modify my order?", a: "Orders can be cancelled or modified within 12 hours of placing them, as long as they haven't been packed.", category: "Orders" },
  { q: "Are the product colours accurate?", a: "We photograph in natural light for accuracy, but slight variations can occur due to screen settings.", category: "Products" },
  { q: "How should I care for my garments?", a: "Care instructions are listed on each product page. In general, gentle cold washes and shade drying keep colours vibrant.", category: "Products" },
  { q: "Do you restock sold-out items?", a: "Popular styles are restocked regularly. Tap 'Notify Me' on the product page to get an alert.", category: "Products" },
  { q: "Do you ship internationally?", a: "Currently we ship across India. International shipping is coming soon — join our newsletter for updates.", category: "Shipping" },
  { q: "How do I apply a coupon code?", a: "Enter your code in the 'Apply Coupon' box at checkout and the discount will reflect in your order summary.", category: "Payments" },
  { q: "Is my payment information secure?", a: "Absolutely. We never store card details — all transactions are encrypted and processed through Razorpay.", category: "Payments" },
  { q: "How do I contact customer support?", a: "Reach us on WhatsApp, email support@sruvalle.in, or call us between 10am–7pm, Monday to Saturday.", category: "General" },
];

/* ---------------- Testimonials ---------------- */

export const TESTIMONIALS = [
  { name: "Ananya Iyer", location: "Bengaluru", message: "Sruvalle has completely changed my wardrobe. The fabrics are premium and the fits are so flattering. My third order this month!" },
  { name: "Priya Menon", location: "Kochi", message: "I was nervous about buying ethnic wear online, but the quality blew me away. It looks like something from a boutique." },
  { name: "Sneha Kapoor", location: "Mumbai", message: "Fast delivery, gorgeous packaging and clothes that actually match the photos. This is now my go-to store." },
  { name: "Riya Sharma", location: "Delhi", message: "The co-ord sets are worth every rupee. Comfortable, chic and I get compliments every single time." },
  { name: "Meera Nair", location: "Chennai", message: "Their customer support is lovely and returns were hassle-free. Rare to find a brand that gets it all right." },
  { name: "Kavya Reddy", location: "Hyderabad", message: "Finally a store that makes workwear that's both comfortable and stylish. The blazers are chef's kiss." },
];

/* ---------------- Blogs ---------------- */

export const BLOG_TOPICS = [
  { title: "5 Ways to Style a Linen Co-Ord Set This Summer", tags: ["Styling", "Summer", "Co-Ords"] },
  { title: "The Saree Reimagined: Modern Drapes for the Everyday Woman", tags: ["Ethnic", "Sarees", "Trends"] },
  { title: "Building a Capsule Wardrobe with 10 Timeless Pieces", tags: ["Capsule", "Essentials", "Minimalism"] },
  { title: "From Desk to Dinner: Workwear That Works Overtime", tags: ["Workwear", "Styling", "Office"] },
  { title: "Colour of the Season: Styling Mustard the Right Way", tags: ["Colour", "Trends", "Styling"] },
  { title: "How to Care for Delicate Fabrics Like Georgette and Silk", tags: ["Care", "Fabrics", "Tips"] },
  { title: "Festive Edit: Ethnic Looks for Every Celebration", tags: ["Festive", "Ethnic", "Occasion"] },
  { title: "The Return of the Maxi Dress — And How to Wear It", tags: ["Dresses", "Trends", "Styling"] },
  { title: "Petite Styling: Silhouettes That Elongate", tags: ["Styling", "Body Types", "Tips"] },
  { title: "Monsoon Wardrobe Essentials You'll Actually Wear", tags: ["Monsoon", "Essentials", "Seasonal"] },
  { title: "Sustainable Fashion: Small Choices, Big Impact", tags: ["Sustainability", "Values", "Guide"] },
  { title: "Accessorising 101: Elevating a Simple Outfit", tags: ["Accessories", "Styling", "Tips"] },
  { title: "The Perfect White Shirt and 6 Ways to Wear It", tags: ["Essentials", "Styling", "Basics"] },
  { title: "Wedding Guest Guide: What to Wear to Every Function", tags: ["Wedding", "Occasion", "Ethnic"] },
  { title: "Denim Done Right: Finding Your Perfect Fit", tags: ["Denim", "Fit", "Guide"] },
  { title: "Layering for Transitional Weather", tags: ["Layering", "Seasonal", "Styling"] },
  { title: "Print Mixing Without the Guesswork", tags: ["Prints", "Styling", "Trends"] },
  { title: "The Art of the Statement Sleeve", tags: ["Trends", "Tops", "Styling"] },
  { title: "Vacation Packing: One Suitcase, Ten Outfits", tags: ["Travel", "Capsule", "Tips"] },
  { title: "Understanding Fabric Labels So You Shop Smarter", tags: ["Fabrics", "Guide", "Tips"] },
];

export const BLOG_PARAGRAPHS = [
  "Great style rarely comes from owning more — it comes from owning better, and knowing how to wear it. In this edit, we break it down into simple, repeatable choices you can make every morning.",
  "Start with the foundation. A well-chosen base piece in a neutral tone does most of the heavy lifting, letting you swap accessories and layers to change the entire mood of a look.",
  "Fabric matters more than trend. Breathable, well-finished materials drape better, last longer and feel good against the skin — which is exactly why they photograph so beautifully too.",
  "Don't underestimate proportion. Balancing a relaxed top with a tailored bottom (or the reverse) is the quiet trick behind almost every put-together outfit you admire.",
  "Finally, wear it with confidence. The best-dressed woman in the room is rarely the one in the most expensive clothes — she's the one who feels completely at home in what she's wearing.",
];

/* ---------------- Settings ---------------- */

export const SETTINGS = {
  storeName: "Sruvalle",
  tagline: "Effortless fashion, thoughtfully made.",
  logo: "https://picsum.photos/seed/aura-logo/240/80",
  favicon: "https://picsum.photos/seed/aura-fav/64/64",
  currency: "INR",
  contact: {
    email: "support@sruvalle.in",
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    address: "Sruvalle Studio, 4th Floor, Prestige Tower, MG Road, Bengaluru 560001",
  },
  social: {
    instagram: "https://instagram.com/sruvalle",
    facebook: "https://facebook.com/sruvalle",
    twitter: "https://twitter.com/sruvalle",
    pinterest: "https://pinterest.com/sruvalle",
    youtube: "https://youtube.com/@sruvalle",
  },
  shipping: {
    freeShippingThreshold: 1499,
    standardRate: 99,
    expressRate: 199,
    estimatedDays: "4–6 business days",
  },
  returnPolicy:
    "Easy 7-day returns and exchanges on unworn items with original tags. Refunds are processed within 5–7 business days to your original payment method.",
  about:
    "Sruvalle is a premium women's fashion label crafting contemporary and ethnic wear for the modern Indian woman. We design in small batches, obsess over fabric and fit, and believe great style should feel effortless.",
  footerLinks: [
    { label: "About Us", url: "/about" },
    { label: "Contact", url: "/contact" },
    { label: "Shipping Policy", url: "/shipping" },
    { label: "Returns & Exchanges", url: "/returns" },
    { label: "Privacy Policy", url: "/privacy" },
    { label: "Terms of Service", url: "/terms" },
    { label: "Track Order", url: "/track" },
    { label: "FAQs", url: "/faq" },
  ],
  theme: {
    primary: "#7C2D45",
    secondary: "#D8C3A5",
    accent: "#E8B4C0",
    fontHeading: "Playfair Display",
    fontBody: "Inter",
  },
};

/* ---------------- Banners ---------------- */

export const HERO_BANNERS = [
  { title: "The Summer Edit", subtitle: "New Season", description: "Breezy weaves and sun-ready shades, made for long golden days.", ctaText: "Shop Summer", ctaLink: "/collections/summer-collection", align: "left" },
  { title: "Festive Reverie", subtitle: "Ethnic Wear", description: "Handcrafted silhouettes for every celebration on your calendar.", ctaText: "Explore Ethnic", ctaLink: "/collections/ethnic-wear", align: "center" },
  { title: "Effortless Co-Ords", subtitle: "Matching Sets", description: "One decision, one polished look. Throw it on and go.", ctaText: "Shop Co-Ords", ctaLink: "/collections/co-ord-sets", align: "right" },
];

export const COLLECTION_BANNERS = [
  { title: "The New Arrivals", subtitle: "Just In", description: "Fresh drops, restocked weekly. Be the first to wear what's next.", ctaText: "Discover New In", ctaLink: "/products?filter=new", align: "left" },
];

export const OFFER_BANNERS = [
  { title: "Flat 20% Off", subtitle: "Festive Sale", description: "Use code FESTIVE20 at checkout on orders over ₹1,999.", ctaText: "Grab the Deal", ctaLink: "/collections/party-wear", align: "center" },
  { title: "Free Shipping over ₹1499", subtitle: "Always On", description: "On every order, everywhere in India — no minimum, no code.", ctaText: "Start Shopping", ctaLink: "/collections/new-arrivals", align: "center" },
];

export const INSTAGRAM_HANDLE = "sruvalle";
export const INSTAGRAM_COUNT = 6;
