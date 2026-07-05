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
import {
  getProducts,
  getCategories,
  getTestimonials,
  getHeroBanners,
  getCollectionBanner,
  getInstagramGallery,
} from "@/lib/api";

// Render the homepage on-demand from the LIVE backend on every request.
// `fetchCache: force-no-store` forces every fetch in this page to bypass the
// Next.js data cache, so when the backend is disconnected the sections show
// nothing instead of serving stale cached data. (Other pages keep their own
// caching — this only affects the homepage.)
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const [all, categories, testimonials, heroBanners, collectionBanner, instagramGallery] =
    await Promise.all([
      getProducts(),
      getCategories(),
      getTestimonials(),
      getHeroBanners(),
      getCollectionBanner(),
      getInstagramGallery(),
    ]);

  const newArrivals = all.filter((p) => p.newArrival).slice(0, 8);
  const trending = all.filter((p) => p.trending).slice(0, 8);
  const bestSellers = all.filter((p) => p.bestSeller).slice(0, 8);
  const flashSale = all.filter((p) => p.flashSale).slice(0, 6);

  return (
    <>
      {heroBanners.length > 0 && <HeroSlider banners={heroBanners} />}
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
      {collectionBanner && <CollectionBanner banner={collectionBanner} />}
      <ProductCarousel
        eyebrow="Tried & Loved"
        title="Best Sellers"
        description="Our most-loved pieces, back in stock."
        href="/products?filter=best"
        products={bestSellers}
      />
      <OurStory />
      <Features />
      {testimonials.length > 0 && <TestimonialsSection testimonials={testimonials} />}
      {instagramGallery.length > 0 && <InstagramGallery items={instagramGallery} />}
    </>
  );
}
