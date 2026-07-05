import Image from "next/image";
import Link from "next/link";
import { storyImage } from "@/data/images";
import { buttonVariants } from "@/components/ui/button";

export function OurStory() {
  return (
    <section className="container-wide py-14 md:py-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-secondary">
          <Image src={storyImage()} alt="The Sruvalle story" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="max-w-lg">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-dark">
            Our Story
          </span>
          <h2 className="mt-3 text-3xl font-medium md:text-4xl">
            Thoughtfully designed, beautifully made
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
            Sruvalle began with a simple belief — that great style should feel effortless. We design in
            small batches, obsess over fabric and fit, and work with craftspeople who care as much
            as we do. Every piece is made to move with you, and to last.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
            From breezy everyday cottons to hand-embellished occasion wear, our collections are a
            love letter to the modern woman who wants to look and feel her best, always.
          </p>
          <Link href="/about" className={`${buttonVariants({ variant: "outline" })} mt-7`}>
            Read our story
          </Link>
        </div>
      </div>
    </section>
  );
}
