import { HeroSlider } from "@/components/home/hero-slider";
import { CategoryCircles } from "@/components/home/category-circles";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { ProductCarousel } from "@/components/home/product-carousel";
import { FlashSale } from "@/components/home/flash-sale";
import { CollectionBanner } from "@/components/home/collection-banner";
import { OurStory } from "@/components/home/our-story";
import { Features } from "@/components/home/features";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { getProducts, getCategories, getTestimonials } from "@/lib/api";

export default async function HomePage() {
  const [all, categories, testimonials] = await Promise.all([
    getProducts(),
    getCategories(),
    getTestimonials(),
  ]);

  const newArrivals = all.filter((p) => p.newArrival).slice(0, 8);
  const trending = all.filter((p) => p.trending).slice(0, 8);
  const bestSellers = all.filter((p) => p.bestSeller).slice(0, 8);
  const flashSale = all.filter((p) => p.flashSale).slice(0, 6);

  return (
    <>
      <HeroSlider />
      <CategoryCircles categories={categories} />
      <FeaturedCategories categories={categories} />
      <ProductCarousel
        eyebrow="Just In"
        title="New Arrivals"
        description="The latest to land in the studio."
        href="/products?filter=new"
        products={newArrivals}
      />
      <FlashSale products={flashSale} />
      <ProductCarousel
        eyebrow="Trending Now"
        title="Trending Products"
        description="What everyone's adding to cart this week."
        href="/products?filter=trending"
        products={trending}
      />
      <CollectionBanner />
      <ProductCarousel
        eyebrow="Tried & Loved"
        title="Best Sellers"
        description="Our most-loved pieces, back in stock."
        href="/products?filter=best"
        products={bestSellers}
      />
      <OurStory />
      <Features />
      <TestimonialsSection testimonials={testimonials} />
      <InstagramGallery />
    </>
  );
}
