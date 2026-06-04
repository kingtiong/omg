import * as React from "react";
import { Label } from "./label";
import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive-foreground">
      {message}
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 border-b border-line/40 px-6 py-6 last:border-0 lg:grid-cols-3">
      <div>
        <h3 className="font-serif text-lg text-platinum">{title}</h3>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      <div className="grid gap-4 lg:col-span-2 sm:grid-cols-2">{children}</div>
    </div>
  );
}
