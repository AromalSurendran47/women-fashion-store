import Image from "next/image";
import { Instagram } from "lucide-react";
import type { InstagramItem } from "@/lib/api";
import { SectionTitle } from "@/components/ui/section-title";

export function InstagramGallery({ items }: { items: InstagramItem[] }) {
  return (
    <section className="container-wide py-14 md:py-20">
      <SectionTitle eyebrow="@sruvalle" title="Follow Our Journey" description="Tag us for a chance to be featured." />
      <div className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square overflow-hidden rounded-xl bg-secondary"
          >
            <Image src={item.image} alt="Instagram post" fill sizes="(max-width:768px) 33vw, 16vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Instagram className="text-background" size={22} />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
