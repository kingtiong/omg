import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "neutral" | "gold" | "success" | "warning" | "danger";

const variants: Record<Variant, string> = {
  neutral: "border-line bg-white/5 text-ink-dim",
  gold: "border-gold/40 bg-gold/10 text-gold-bright",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  danger: "border-red-500/30 bg-red-500/10 text-red-300",
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
