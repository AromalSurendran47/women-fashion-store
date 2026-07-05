import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBlogs } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Journal",
  description: "Styling notes, trend edits and fashion stories from the Sruvalle studio.",
};

export default async function BlogPage() {
  const blogs = await getBlogs();
  const [featured, ...rest] = blogs;

  return (
    <div className="container-wide py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Journal" }]} />
      <div className="mb-10 mt-4 text-center">
        <h1 className="text-3xl font-medium md:text-5xl">The Sruvalle Journal</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
          Styling notes, trend edits and stories from behind the seams.
        </p>
      </div>

      {/* Featured */}
      <Link href={`/blog/${featured.slug}`} className="group mb-12 grid gap-6 md:grid-cols-2">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-secondary">
          <Image src={featured.image} alt={featured.title} fill sizes="(max-width:768px) 100vw, 50vw" className="zoom-img object-cover" />
        </div>
        <div className="flex flex-col justify-center gap-3">
          <div className="flex gap-2">
            {featured.tags.map((t) => (
              <Badge key={t} variant="light">{t}</Badge>
            ))}
          </div>
          <h2 className="text-2xl font-medium md:text-3xl">{featured.title}</h2>
          <p className="text-sm text-muted">{featured.excerpt}</p>
          <p className="text-xs text-muted">
            {featured.author} · {formatDate(featured.date)} · {featured.readTime} min read
          </p>
        </div>
      </Link>

      {/* Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((b) => (
          <Link key={b.id} href={`/blog/${b.slug}`} className="group flex flex-col gap-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
              <Image src={b.image} alt={b.title} fill sizes="(max-width:768px) 100vw, 33vw" className="zoom-img object-cover" />
            </div>
            <div className="flex gap-2">
              {b.tags.slice(0, 2).map((t) => (
                <Badge key={t} variant="light">{t}</Badge>
              ))}
            </div>
            <h3 className="text-lg font-medium group-hover:text-accent-dark">{b.title}</h3>
            <p className="line-clamp-2 text-sm text-muted">{b.excerpt}</p>
            <p className="mt-auto text-xs text-muted">
              {formatDate(b.date)} · {b.readTime} min read
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
