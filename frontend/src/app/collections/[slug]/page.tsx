import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductListing } from "@/components/product/product-listing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return {
    title: category?.name ?? "Collection",
    description: category?.description,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, list] = await Promise.all([
    getCategoryBySlug(slug),
    getProductsByCategory(slug),
  ]);
  if (!category) notFound();

  return (
    <div>
      <div
        className="flex h-56 items-center justify-center bg-cover bg-center md:h-72"
        style={{ backgroundImage: `linear-gradient(rgba(17,17,17,0.35),rgba(17,17,17,0.35)), url(${category.banner})` }}
      >
        <div className="text-center text-background">
          <h1 className="text-4xl font-medium md:text-5xl">{category.name}</h1>
          <p className="mx-auto mt-2 max-w-md px-4 text-sm text-background/85">
            {category.description}
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Collections", href: "/collections" },
            { label: category.name },
          ]}
        />
        <div className="mt-6">
          <ProductListing products={list} initialFilters={{ categories: [slug] }} />
        </div>
      </div>
    </div>
  );
}
