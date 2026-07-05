import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
  {
    variants: {
      variant: {
        dark: "bg-ink text-background",
        light: "bg-background text-ink border border-ink/10",
        accent: "bg-accent text-ink",
        sale: "bg-sale text-white",
        new: "bg-green-700 text-white",
      },
    },
    defaultVariants: { variant: "dark" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
