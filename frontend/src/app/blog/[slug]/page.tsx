import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogBySlug, getRelatedBlogs } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  return { title: blog?.title ?? "Article", description: blog?.excerpt };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();

  const related = await getRelatedBlogs(blog, 3);

  return (
    <article className="container-wide py-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Journal", href: "/blog" },
          { label: blog.title },
        ]}
      />

      <div className="mx-auto mt-6 max-w-3xl text-center">
        <div className="flex justify-center gap-2">
          {blog.tags.map((t) => (
            <Badge key={t} variant="light">{t}</Badge>
          ))}
        </div>
        <h1 className="mt-4 text-3xl font-medium md:text-5xl">{blog.title}</h1>
        <div className="mt-4 flex items-center justify-center gap-3 text-sm text-muted">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-secondary">
            <Image src={blog.authorAvatar} alt={blog.author} fill sizes="32px" className="object-cover" />
          </div>
          {blog.author} · {formatDate(blog.date)} · {blog.readTime} min read
        </div>
      </div>

      <div className="relative mx-auto mt-8 aspect-[16/9] max-w-4xl overflow-hidden rounded-3xl bg-secondary">
        <Image src={blog.image} alt={blog.title} fill priority sizes="(max-width:1024px) 100vw, 900px" className="object-cover" />
      </div>

      <div
        className="prose-aura mx-auto mt-10 max-w-2xl space-y-5 text-[15px] leading-relaxed text-muted [&_p]:mb-5"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Related */}
      <div className="mx-auto mt-16 max-w-4xl border-t border-line pt-10">
        <h2 className="mb-6 text-2xl font-medium">Related Reads</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {related.map((b) => (
            <Link key={b.id} href={`/blog/${b.slug}`} className="group flex flex-col gap-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
                <Image src={b.image} alt={b.title} fill sizes="33vw" className="zoom-img object-cover" />
              </div>
              <h3 className="text-sm font-medium group-hover:text-accent-dark">{b.title}</h3>
              <p className="text-xs text-muted">{formatDate(b.date)}</p>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
