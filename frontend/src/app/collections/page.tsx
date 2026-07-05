import type { Metadata } from "next";
import { getCategories } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CategoryCard } from "@/components/common/category-card";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore Sruvalle's collections across every silhouette, occasion and mood.",
};

export default async function CollectionsPage() {
  const categories = await getCategories();
  return (
    <div className="container-wide py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Collections" }]} />
      <div className="mb-10 mt-4 text-center">
        <h1 className="text-3xl font-medium md:text-5xl">Our Collections</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
          From breezy everyday cottons to hand-embellished occasion wear — find your edit.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => (
          <CategoryCard key={c.id} category={c} />
        ))}
      </div>
    </div>
  );
}
