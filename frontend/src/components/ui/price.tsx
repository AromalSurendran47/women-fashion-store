import { formatPrice, cn } from "@/lib/utils";

export function Price({
  price,
  discountPrice,
  discountPercentage,
  className,
  size = "md",
}: {
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const hasDiscount = discountPrice !== undefined && discountPrice < price;
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  }[size];

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn("font-medium text-ink", sizes)}>
        {formatPrice(hasDiscount ? discountPrice! : price)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-sm text-muted line-through">{formatPrice(price)}</span>
          {discountPercentage ? (
            <span className="text-xs font-semibold text-sale">{discountPercentage}% off</span>
          ) : null}
        </>
      )}
    </div>
  );
}
