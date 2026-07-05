import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedBySlug, getReviewsByProduct } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductTabs } from "@/components/product/product-tabs";
import { ProductCarousel } from "@/components/home/product-carousel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: { images: [product.thumbnail] },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, related] = await Promise.all([
    getReviewsByProduct(product.id),
    getRelatedBySlug(slug),
  ]);

  return (
    <div className="container-wide py-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: product.categoryName, href: `/collections/${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <ProductInfo product={product} />
      </div>

      <ProductTabs product={product} reviews={reviews} />

      {related.length > 0 && (
        <ProductCarousel title="You May Also Like" products={related} />
      )}
    </div>
  );
}
