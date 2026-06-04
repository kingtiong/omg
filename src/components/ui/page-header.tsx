import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && (
          <span className="mb-2 block text-[11px] uppercase tracking-[0.4em] text-gold">{eyebrow}</span>
        )}
        <h1 className="font-serif text-3xl font-medium text-platinum md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-ink-dim">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function Crumbs({ items }: { items: Array<{ href?: string; label: string }> }) {
  return (
    <nav className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-muted">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span aria-hidden>/</span>}
          {it.href ? (
            <Link href={it.href} className="transition-colors hover:text-gold-bright">
              {it.label}
            </Link>
          ) : (
            <span className="text-ink-dim">{it.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
