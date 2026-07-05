/**
 * Shared TypeScript interfaces for the Sruvalle Fashion data layer.
 * These mirror the Mongoose schemas in src/models and describe the shape of
 * documents as stored in MongoDB. `_id` fields are typed as string here for
 * convenience in the client/seed layer.
 */

export type Role = "admin" | "customer" | "seller";

export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type ColorName =
  | "Black"
  | "White"
  | "Beige"
  | "Brown"
  | "Pink"
  | "Green"
  | "Olive"
  | "Blue"
  | "Red"
  | "Mustard";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned";

export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";

export type PaymentMethod = "Razorpay" | "UPI" | "Card" | "NetBanking" | "COD";

export type DiscountType = "percentage" | "fixed";

/* ------------------------------------------------------------------ */
/* Sub-documents                                                       */
/* ------------------------------------------------------------------ */

export interface Address {
  _id?: string;
  label: string; // Home, Work, Other
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface CartItem {
  product: string; // Product _id
  variantSku?: string;
  name: string;
  thumbnail: string;
  color: ColorName;
  size: Size;
  price: number;
  quantity: number;
}

export interface ProductVariant {
  color: ColorName;
  size: Size;
  sku: string;
  stock: number;
  price: number;
  image: string;
}

/* ------------------------------------------------------------------ */
/* Collections                                                         */
/* ------------------------------------------------------------------ */

export interface User {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  password: string; // bcrypt hash
  role: Role;
  avatar: string;
  wishlist: string[]; // Product ids
  cart: CartItem[];
  addresses: Address[];
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id?: string;
  name: string;
  slug: string;
  image: string;
  banner: string;
  description: string;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string; // Category id
  subCategory: string;
  brand: string;
  fabric: string;
  fit: string;
  occasion: string;
  price: number;
  discountPrice: number;
  discountPercentage: number;
  stock: number;
  sku: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  trending: boolean;
  sizes: Size[];
  colors: ColorName[];
  material: string;
  careInstructions: string[];
  weight: number; // grams
  images: string[];
  thumbnail: string;
  video?: string;
  variants: ProductVariant[];
  seoTitle: string;
  seoDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  _id?: string;
  product: string;
  user: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: Date;
}

export interface WishlistDoc {
  _id?: string;
  user: string;
  products: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartDoc {
  _id?: string;
  user: string;
  items: CartItem[];
  coupon?: string;
  updatedAt: Date;
}

export interface Coupon {
  _id?: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface OrderProduct {
  product: string;
  name: string;
  thumbnail: string;
  color: ColorName;
  size: Size;
  price: number;
  quantity: number;
}

export interface Order {
  _id?: string;
  orderNumber: string;
  user: string;
  customerName: string;
  products: OrderProduct[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  trackingNumber?: string;
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Banner {
  _id?: string;
  title: string;
  subtitle: string;
  image: string;
  mobileImage: string;
  ctaText: string;
  ctaLink: string;
  type: "hero" | "category" | "offer";
  order: number;
  active: boolean;
  createdAt: Date;
}

export interface Testimonial {
  _id?: string;
  name: string;
  avatar: string;
  location: string;
  rating: number;
  message: string;
  active: boolean;
  createdAt: Date;
}

export interface Faq {
  _id?: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface NewsletterSubscriber {
  _id?: string;
  email: string;
  subscribed: boolean;
  source: string;
  createdAt: Date;
}

export interface Blog {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  content: string;
  tags: string[];
  author: string;
  authorAvatar: string;
  readTime: number;
  published: boolean;
  publishedAt: Date;
  createdAt: Date;
}

export interface Settings {
  _id?: string;
  storeName: string;
  tagline: string;
  logo: string;
  favicon: string;
  currency: string;
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
  };
  social: {
    instagram: string;
    facebook: string;
    twitter: string;
    pinterest: string;
    youtube: string;
  };
  shipping: {
    freeShippingThreshold: number;
    standardRate: number;
    expressRate: number;
    estimatedDays: string;
  };
  returnPolicy: string;
  about: string;
  footerLinks: { label: string; url: string }[];
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    fontHeading: string;
    fontBody: string;
  };
}
