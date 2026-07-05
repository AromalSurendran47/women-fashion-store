import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { buttonVariants } from "./button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-accent-dark">
        <Icon size={28} />
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-medium">{title}</h3>
        <p className="max-w-sm text-sm text-muted">{description}</p>
      </div>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className={buttonVariants()}>
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
