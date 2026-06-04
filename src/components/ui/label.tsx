import * as React from "react";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-ink-dim", className)}
      {...props}
    />
  )
);
Label.displayName = "Label";
