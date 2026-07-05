import {
  Truck,
  RefreshCw,
  ShieldCheck,
  Headphones,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
} from "lucide-react";

export const STORE = {
  name: "Sruvalle",
  tagline: "Effortless fashion, thoughtfully made.",
  email: "support@sruvalle.in",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  address: "Sruvalle Studio, 4th Floor, Prestige Tower, MG Road, Bengaluru 560001",
  freeShippingThreshold: 1499,
};

export const ANNOUNCEMENTS = [
  "Free shipping on orders over ₹1,499",
  "Extra 10% off your first order — code WELCOME10",
  "New arrivals dropped weekly ✦ Shop the latest",
];

export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Shop", href: "/products" },
  { label: "Collections", href: "/collections" },
  { label: "New Arrivals", href: "/products?filter=new" },
  { label: "Best Sellers", href: "/products?filter=best" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const FEATURES = [
  { icon: Truck, title: "Free Shipping", text: "On all orders over ₹1,499, across India." },
  { icon: RefreshCw, title: "Easy Returns", text: "7-day hassle-free returns & exchanges." },
  { icon: ShieldCheck, title: "Secure Payment", text: "100% encrypted checkout via Razorpay." },
  { icon: Headphones, title: "Customer Support", text: "Mon–Sat, 10am–7pm. We're here to help." },
];

export const SOCIALS = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/sruvalle" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/sruvalle" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com/sruvalle" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com/@sruvalle" },
];

export const FOOTER_LINKS = {
  shop: [
    { label: "New Arrivals", href: "/products?filter=new" },
    { label: "Best Sellers", href: "/products?filter=best" },
    { label: "Dresses", href: "/collections/dresses" },
    { label: "Ethnic Wear", href: "/collections/ethnic-wear" },
    { label: "Co-Ord Sets", href: "/collections/co-ord-sets" },
  ],
  service: [
    { label: "Contact Us", href: "/contact" },
    { label: "Track Order", href: "/profile/orders" },
    { label: "Shipping Info", href: "/contact" },
    { label: "Returns", href: "/contact" },
    { label: "FAQs", href: "/contact#faq" },
  ],
  company: [
    { label: "Our Story", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/about" },
    { label: "Privacy Policy", href: "/about" },
    { label: "Terms of Service", href: "/about" },
  ],
};

export const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Top Rated", value: "rating" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
