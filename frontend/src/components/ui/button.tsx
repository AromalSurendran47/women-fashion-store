import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("btn-base rounded-full", {
  variants: {
    variant: {
      primary: "bg-ink text-background hover:bg-ink/90",
      outline: "border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-background",
      accent: "bg-accent text-ink hover:bg-accent-dark",
      ghost: "text-ink hover:bg-secondary",
      link: "text-ink underline-offset-4 hover:underline rounded-none px-0",
    },
    size: {
      sm: "h-9 px-4 text-xs",
      md: "h-11 px-6",
      lg: "h-14 px-9 text-base",
      icon: "h-11 w-11",
    },
    block: { true: "w-full" },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
