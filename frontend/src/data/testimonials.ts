import type { Testimonial } from "@/types";
import { avatar } from "./images";

const RAW = [
  { name: "Ananya Iyer", location: "Bengaluru", message: "Sruvalle has completely changed my wardrobe. The fabrics are premium and the fits are so flattering. My third order this month!" },
  { name: "Priya Menon", location: "Kochi", message: "I was nervous about buying ethnic wear online, but the quality blew me away. It looks like something from a boutique." },
  { name: "Sneha Kapoor", location: "Mumbai", message: "Fast delivery, gorgeous packaging and clothes that actually match the photos. This is now my go-to store." },
  { name: "Riya Sharma", location: "Delhi", message: "The co-ord sets are worth every rupee. Comfortable, chic and I get compliments every single time." },
  { name: "Meera Nair", location: "Chennai", message: "Their customer support is lovely and returns were hassle-free. Rare to find a brand that gets it all right." },
  { name: "Kavya Reddy", location: "Hyderabad", message: "Finally a store that makes workwear that's both comfortable and stylish. The blazers are chef's kiss." },
  { name: "Tara Rao", location: "Pune", message: "Beautiful prints that don't fade after washing. The midi dresses are my absolute favourite for summer." },
  { name: "Nisha Joshi", location: "Jaipur", message: "Sizing is accurate and the size guide is spot on. Ordered five pieces and every single one fit perfectly." },
  { name: "Diya Malhotra", location: "Kolkata", message: "Elegant, minimal and so well made. Sruvalle feels like a premium label at a fraction of the price." },
  { name: "Ishita Verma", location: "Delhi", message: "The festive collection is stunning. I wore my Anarkali to a wedding and everyone asked where it was from!" },
  { name: "Lavanya Nair", location: "Kochi", message: "Great everyday basics that layer beautifully. The cotton kurtis are breathable and perfect for work." },
  { name: "Gauri Iyer", location: "Bengaluru", message: "Thoughtful details, quality stitching and quick delivery. Sruvalle has earned a loyal customer in me." },
  { name: "Rhea Kapoor", location: "Mumbai", message: "Loved how easy the whole experience was — from browsing to checkout to the surprise little thank-you note." },
  { name: "Zara Sharma", location: "Chennai", message: "The palazzo sets are dreamy. Comfortable enough to travel in and polished enough for dinner." },
  { name: "Myra Reddy", location: "Hyderabad", message: "Consistently good quality across every order. This is fast becoming the only place I shop for ethnic wear." },
];

export const testimonials: Testimonial[] = RAW.map((t, i) => ({
  id: `testimonial-${i + 1}`,
  name: t.name,
  avatar: avatar(i + 24),
  location: t.location,
  rating: 5,
  message: t.message,
}));
