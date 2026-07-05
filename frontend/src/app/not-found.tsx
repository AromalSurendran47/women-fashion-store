import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-wide flex flex-col items-center justify-center gap-5 py-28 text-center">
      <span className="font-heading text-7xl font-semibold text-accent">404</span>
      <h1 className="text-2xl font-medium md:text-3xl">This page has wandered off</h1>
      <p className="max-w-sm text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you
        back to something beautiful.
      </p>
      <div className="mt-2 flex gap-3">
        <Link href="/" className={buttonVariants()}>
          Back Home
        </Link>
        <Link href="/products" className={buttonVariants({ variant: "outline" })}>
          Shop All
        </Link>
      </div>
    </div>
  );
}
