import Image from "next/image";
import Link from "next/link";
import { collectionBanner } from "@/data/banners";
import { buttonVariants } from "@/components/ui/button";

export function CollectionBanner() {
  const b = collectionBanner;
  return (
    <section className="container-wide py-14 md:py-20">
      <div className="relative overflow-hidden rounded-3xl bg-ink">
        <Image
          src={b.image}
          alt={b.title}
          width={1920}
          height={900}
          className="h-[420px] w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-ink/70 to-transparent">
          <div className="max-w-md px-8 text-background md:px-16">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              {b.subtitle}
            </span>
            <h2 className="mt-3 text-3xl font-medium md:text-5xl">{b.title}</h2>
            <p className="mt-4 text-sm text-background/80">{b.description}</p>
            <Link
              href={b.ctaLink}
              className={`${buttonVariants({ size: "lg" })} mt-7 bg-background text-ink hover:bg-background/90`}
            >
              {b.ctaText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
