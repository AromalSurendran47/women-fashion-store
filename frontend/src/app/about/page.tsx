import type { Metadata } from "next";
import Image from "next/image";
import { Leaf, Heart, Sparkles, Users } from "lucide-react";
import { aboutHero, aboutMission, aboutGallery } from "@/data/images";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SectionTitle } from "@/components/ui/section-title";

export const metadata: Metadata = {
  title: "Our Story",
  description: "The story, mission and values behind Sruvalle — premium women's fashion, thoughtfully made.",
};

const VALUES = [
  { icon: Sparkles, title: "Quality First", text: "Premium fabrics, careful finishing and fits we're proud of." },
  { icon: Leaf, title: "Made Responsibly", text: "Small-batch production and a lighter footprint at every step." },
  { icon: Heart, title: "Designed with Love", text: "Every piece is designed in-house with the modern woman in mind." },
  { icon: Users, title: "Community Led", text: "We listen, we adapt, and we design for real women's lives." },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className="relative flex h-[50vh] min-h-[360px] items-center justify-center bg-secondary">
        <Image src={aboutHero()} alt="Sruvalle atelier" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink/40" />
        <div className="relative text-center text-background">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Our Story</span>
          <h1 className="mt-3 text-4xl font-medium md:text-6xl">Fashion, thoughtfully made</h1>
        </div>
      </div>

      <div className="container-wide py-12">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />

        {/* Story */}
        <div className="mx-auto mt-10 max-w-3xl space-y-5 text-center text-sm leading-relaxed text-muted md:text-base">
          <p>
            Sruvalle was born from a simple frustration — beautiful clothes that felt good, fit well and
            didn&apos;t cost a fortune were surprisingly hard to find. So in 2021, we set out to make
            them ourselves.
          </p>
          <p>
            Today, we&apos;re a small team of designers, pattern-makers and craftspeople who care
            deeply about the details. We design in-house, produce in small batches, and work only
            with fabrics we&apos;d want to wear every day.
          </p>
        </div>

        {/* Mission */}
        <div className="my-16 grid items-center gap-10 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-secondary">
            <Image src={aboutMission()} alt="Our mission" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-dark">Our Mission</span>
            <h2 className="mt-3 text-3xl font-medium">To make everyday elegance effortless</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              We believe getting dressed should feel like a joy, not a chore. Our mission is to
              create versatile, beautifully-made pieces that move with you — from the morning commute
              to the evening out — and make you feel completely yourself.
            </p>
          </div>
        </div>

        {/* Values */}
        <SectionTitle eyebrow="What we stand for" title="Our Values" />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col items-center gap-3 rounded-2xl border border-line p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-accent-dark">
                <Icon size={22} />
              </div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="text-xs text-muted">{text}</p>
            </div>
          ))}
        </div>

        {/* Gallery */}
        <div className="mt-16">
          <SectionTitle eyebrow="Behind the seams" title="From Our Atelier" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
                <Image src={aboutGallery(i)} alt="Atelier" fill sizes="25vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
