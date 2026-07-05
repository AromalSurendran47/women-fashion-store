import type { Blog } from "@/types";
import { slugify, daysAgo } from "@/lib/utils";
import { FIRST_NAMES, LAST_NAMES } from "./_pools";
import { blogImage, avatar } from "./images";

const TOPICS: { title: string; tags: string[] }[] = [
  { title: "5 Ways to Style a Linen Co-Ord Set This Summer", tags: ["Styling", "Summer", "Co-Ords"] },
  { title: "The Saree Reimagined: Modern Drapes for the Everyday Woman", tags: ["Ethnic", "Sarees"] },
  { title: "Building a Capsule Wardrobe with 10 Timeless Pieces", tags: ["Capsule", "Essentials"] },
  { title: "From Desk to Dinner: Workwear That Works Overtime", tags: ["Workwear", "Office"] },
  { title: "Colour of the Season: Styling Mustard the Right Way", tags: ["Colour", "Trends"] },
  { title: "How to Care for Delicate Fabrics Like Georgette and Silk", tags: ["Care", "Fabrics"] },
  { title: "Festive Edit: Ethnic Looks for Every Celebration", tags: ["Festive", "Ethnic"] },
  { title: "The Return of the Maxi Dress — And How to Wear It", tags: ["Dresses", "Trends"] },
  { title: "Petite Styling: Silhouettes That Elongate", tags: ["Styling", "Tips"] },
  { title: "Monsoon Wardrobe Essentials You'll Actually Wear", tags: ["Monsoon", "Seasonal"] },
  { title: "Sustainable Fashion: Small Choices, Big Impact", tags: ["Sustainability", "Guide"] },
  { title: "Accessorising 101: Elevating a Simple Outfit", tags: ["Accessories", "Styling"] },
  { title: "The Perfect White Shirt and 6 Ways to Wear It", tags: ["Essentials", "Basics"] },
  { title: "Wedding Guest Guide: What to Wear to Every Function", tags: ["Wedding", "Ethnic"] },
  { title: "Denim Done Right: Finding Your Perfect Fit", tags: ["Denim", "Guide"] },
  { title: "Layering for Transitional Weather", tags: ["Layering", "Seasonal"] },
  { title: "Print Mixing Without the Guesswork", tags: ["Prints", "Trends"] },
  { title: "The Art of the Statement Sleeve", tags: ["Trends", "Tops"] },
  { title: "Vacation Packing: One Suitcase, Ten Outfits", tags: ["Travel", "Capsule"] },
  { title: "Understanding Fabric Labels So You Shop Smarter", tags: ["Fabrics", "Guide"] },
];

const PARAS = [
  "Great style rarely comes from owning more — it comes from owning better, and knowing how to wear it. In this edit, we break it down into simple, repeatable choices you can make every morning.",
  "Start with the foundation. A well-chosen base piece in a neutral tone does most of the heavy lifting, letting you swap accessories and layers to change the entire mood of a look.",
  "Fabric matters more than trend. Breathable, well-finished materials drape better, last longer and feel good against the skin — which is exactly why they photograph so beautifully too.",
  "Don't underestimate proportion. Balancing a relaxed top with a tailored bottom (or the reverse) is the quiet trick behind almost every put-together outfit you admire.",
  "Finally, wear it with confidence. The best-dressed woman in the room is rarely the one in the most expensive clothes — she's the one who feels completely at home in what she's wearing.",
];

export const blogs: Blog[] = TOPICS.map((t, i) => ({
  id: `blog-${i + 1}`,
  title: t.title,
  slug: slugify(t.title),
  excerpt: PARAS[0].slice(0, 130) + "…",
  image: blogImage(i),
  content: [PARAS[0], PARAS[1 + (i % 4)], PARAS[(i % 3) + 1], PARAS[4]]
    .map((p) => `<p>${p}</p>`)
    .join("\n"),
  tags: t.tags,
  author: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`,
  authorAvatar: avatar(i + 40),
  readTime: 3 + (i % 6),
  date: daysAgo(i * 9 + 3),
}));

export function getBlogBySlug(slug: string) {
  return blogs.find((b) => b.slug === slug);
}

export function getRelatedBlogs(current: Blog, limit = 3) {
  return blogs.filter((b) => b.id !== current.id).slice(0, limit);
}
