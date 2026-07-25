import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  const count = category.productCount;
  return (
    <Link
      href={`/collections/${category.slug}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-secondary"
    >
      <Image
        src={category.image}
        alt={category.name}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="zoom-img object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-background">
        <h3 className="text-xl font-medium">{category.name}</h3>
        <p className="text-xs text-background/80">{count} styles</p>
        <span className="mt-2 inline-block text-xs font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Shop now →
        </span>
      </div>
    </Link>
  );
}

export function CategoryCircle({ category }: { category: Category }) {
  return (
    <Link href={`/collections/${category.slug}`} className="group flex flex-col items-center gap-3">
      <div className="relative h-20 w-20 overflow-hidden rounded-full ring-1 ring-line md:h-28 md:w-28">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="112px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <span className="text-center text-xs font-medium md:text-sm">{category.name}</span>
    </Link>
  );
}
