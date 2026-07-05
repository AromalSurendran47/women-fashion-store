import Image from "next/image";
import { Quote } from "lucide-react";
import type { Testimonial } from "@/types";
import { SectionTitle } from "@/components/ui/section-title";
import { Rating } from "@/components/ui/rating";

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="bg-secondary py-14 md:py-20">
      <div className="container-wide">
        <SectionTitle eyebrow="Loved by thousands" title="What Our Customers Say" />
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.slice(0, 6).map((t) => (
            <figure key={t.id} className="flex flex-col gap-4 rounded-2xl bg-background p-6 shadow-sm">
              <Quote size={24} className="text-accent" />
              <blockquote className="text-sm leading-relaxed text-ink">“{t.message}”</blockquote>
              <Rating value={t.rating} size={13} />
              <figcaption className="mt-auto flex items-center gap-3 pt-2">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-secondary">
                  <Image src={t.avatar} alt={t.name} fill sizes="40px" className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted">{t.location}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
