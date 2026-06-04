import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-xs font-semibold uppercase tracking-[0.14em] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-gold-bright via-gold to-gold-deep text-bg0 shadow-[0_8px_30px_-10px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 hover:shadow-[0_14px_45px_-10px_rgba(244,215,122,0.65)]",
        outline:
          "border border-line bg-transparent text-ink hover:border-gold hover:bg-gold/5 hover:text-gold-bright",
        ghost:
          "bg-transparent text-ink-dim hover:bg-white/5 hover:text-ink",
        danger:
          "border border-destructive/40 bg-destructive/10 text-destructive-foreground hover:bg-destructive/20",
      },
      size: {
        sm: "h-8 px-3 text-[11px]",
        md: "h-10 px-5",
        lg: "h-12 px-7 text-sm",
        icon: "h-9 w-9 px-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

export { buttonVariants };
