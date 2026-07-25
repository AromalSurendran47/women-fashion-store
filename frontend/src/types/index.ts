export type Role = "admin" | "seller" | "customer";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar: string;
}

export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export interface ColorOption {
  name: string;
  hex: string;
}

/** Controlled option lists for product attributes, served from the backend. */
export interface Attributes {
  fabrics: string[];
  fits: string[];
  occasions: string[];
  sizes: string[];
  colors: ColorOption[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  banner: string;
  description: string;
  featured: boolean;
  productCount: number;
}

export interface ProductVariant {
  color: string;
  size: Size;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string; // category slug
  categoryName: string;
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
  flashSale: boolean;
  sizes: Size[];
  colors: ColorOption[];
  material: string;
  careInstructions: string[];
  images: string[];
  thumbnail: string;
  variants: ProductVariant[];
  /** ISO timestamp the product was created (from the backend). */
  createdAt?: string | null;
  /** True only when the product was created today — drives the "New" badge. */
  isNew?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  avatar: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  date: string;
  helpfulCount: number;
  votedBy: string[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  align: "left" | "center" | "right";
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  content: string;
  tags: string[];
  author: string;
  authorAvatar: string;
  readTime: number;
  date: string;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  location: string;
  rating: number;
  message: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  thumbnail: string;
  color: string;
  size: Size;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned";

export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";

export interface OrderAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName?: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  shippingAddress?: OrderAddress;
}

export interface CartLine {
  productId: string;
  name: string;
  slug: string;
  thumbnail: string;
  price: number;
  color: string;
  size: Size;
  quantity: number;
}

export interface WishlistEntry {
  productId: string;
}

export interface AppNotification {
  id: string;
  type: "order" | "offer" | "system";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Coupon {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
}
