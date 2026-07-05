import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "center",
  href,
  hrefLabel = "View all",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  href?: string;
  hrefLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-3 md:mb-12",
        align === "center" ? "items-center text-center" : "items-start text-left",
        href && "md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className={cn("flex flex-col gap-2", align === "center" && "items-center")}>
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-dark">
            {eyebrow}
          </span>
        )}
        <h2 className="text-3xl font-medium leading-tight md:text-4xl">{title}</h2>
        {description && <p className="max-w-xl text-sm text-muted md:text-base">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="link-underline shrink-0 text-sm font-medium text-ink">
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}
