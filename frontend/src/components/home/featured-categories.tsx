import type { Category } from "@/types";
import { SectionTitle } from "@/components/ui/section-title";
import { CategoryCard } from "@/components/common/category-card";

export function FeaturedCategories({ categories }: { categories: Category[] }) {
  const featured = categories.filter((c) => c.featured);
  if (featured.length === 0) return null;
  return (
    <section className="container-wide py-14 md:py-20">
      <SectionTitle
        eyebrow="Curated for you"
        title="Shop by Category"
        description="Explore our edits across silhouettes, occasions and moods."
        href="/collections"
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {featured.slice(0, 8).map((c) => (
          <CategoryCard key={c.id} category={c} />
        ))}
      </div>
    </section>
  );
}
