import type { Metadata } from "next";
import { getProducts } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductListing } from "@/components/product/product-listing";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse the full Sruvalle collection — dresses, kurtis, sarees, co-ords and more.",
};

const TITLES: Record<string, string> = {
  new: "New Arrivals",
  best: "Best Sellers",
  trending: "Trending Now",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;

  const key =
    filter === "new" || filter === "best" || filter === "trending" ? filter : undefined;
  const list = await getProducts(key);

  const heading = (filter && TITLES[filter]) || "Shop All";

  return (
    <div className="container-wide py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: heading }]} />
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-medium md:text-4xl">{heading}</h1>
        <p className="mt-2 text-sm text-muted">{list.length} pieces, thoughtfully made.</p>
      </div>
      <ProductListing products={list} />
    </div>
  );
}
