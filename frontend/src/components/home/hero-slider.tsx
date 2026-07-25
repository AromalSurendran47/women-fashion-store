"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/types";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function HeroSlider({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const count = banners.length;

  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(id);
  }, [count]);

  return (
    <section className="relative h-[75vh] min-h-[520px] w-full overflow-hidden bg-secondary">
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <Image
            src={b.image}
            alt={b.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/50 via-ink/20 to-transparent" />
          <div
            className={cn(
              "container-wide absolute inset-0 flex flex-col justify-center",
              b.align === "center" && "items-center text-center",
              b.align === "right" && "items-end text-right"
            )}
          >
            <div className="max-w-lg text-background">
              <span className="animate-fade-up text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                {b.subtitle}
              </span>
              <h1 className="mt-3 text-4xl font-medium leading-[1.05] md:text-6xl">{b.title}</h1>
              <p className="mt-4 max-w-md text-sm text-background/80 md:text-base">
                {b.description}
              </p>
              <Link href={b.ctaLink} className={cn(buttonVariants({ size: "lg" }), "mt-7 bg-background text-ink hover:bg-background/90")}>
                {b.ctaText}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button
        aria-label="Previous slide"
        onClick={() => go(-1)}
        className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-ink backdrop-blur transition hover:bg-background md:flex"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        aria-label="Next slide"
        onClick={() => go(1)}
        className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-ink backdrop-blur transition hover:bg-background md:flex"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full bg-background transition-all",
              i === index ? "w-8" : "w-1.5 opacity-50"
            )}
          />
        ))}
      </div>
    </section>
  );
}
