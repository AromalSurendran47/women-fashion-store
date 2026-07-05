import type { Banner } from "@/types";
import { heroImage, collectionImage, offerImage, instagramImage } from "./images";

export const heroBanners: Banner[] = [
  {
    id: "hero-1",
    title: "The Summer Edit",
    subtitle: "New Season",
    description: "Breezy weaves and sun-ready shades, made for long golden days.",
    image: heroImage(0),
    ctaText: "Shop Summer",
    ctaLink: "/collections/summer-collection",
    align: "left",
  },
  {
    id: "hero-2",
    title: "Festive Reverie",
    subtitle: "Ethnic Wear",
    description: "Handcrafted silhouettes for every celebration on your calendar.",
    image: heroImage(1),
    ctaText: "Explore Ethnic",
    ctaLink: "/collections/ethnic-wear",
    align: "center",
  },
  {
    id: "hero-3",
    title: "Effortless Co-Ords",
    subtitle: "Matching Sets",
    description: "One decision, one polished look. Throw it on and go.",
    image: heroImage(3),
    ctaText: "Shop Co-Ords",
    ctaLink: "/collections/co-ord-sets",
    align: "right",
  },
];

export const collectionBanner: Banner = {
  id: "collection-1",
  title: "The New Arrivals",
  subtitle: "Just In",
  description: "Fresh drops, restocked weekly. Be the first to wear what's next.",
  image: collectionImage(),
  ctaText: "Discover New In",
  ctaLink: "/products?filter=new",
  align: "left",
};

export const offerBanner: Banner = {
  id: "offer-1",
  title: "Flat 20% Off",
  subtitle: "Festive Sale",
  description: "Use code FESTIVE20 at checkout on orders over ₹1,999.",
  image: offerImage(),
  ctaText: "Grab the Deal",
  ctaLink: "/collections/party-wear",
  align: "center",
};

export const instagramGallery = Array.from({ length: 6 }, (_, i) => ({
  id: `ig-${i + 1}`,
  image: instagramImage(i),
  href: "https://instagram.com/sruvalle",
}));
