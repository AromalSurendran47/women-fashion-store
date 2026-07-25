import type { Category } from "@/types";
import { CategoryCircle } from "@/components/common/category-card";

export function CategoryCircles({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="container-wide py-12">
      <div className="no-scrollbar flex justify-start gap-6 overflow-x-auto md:justify-center md:gap-10">
        {categories.slice(0, 9).map((c) => (
          <div key={c.id} className="shrink-0">
            <CategoryCircle category={c} />
          </div>
        ))}
      </div>
    </section>
  );
}
