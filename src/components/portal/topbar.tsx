"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ShoppingCart, Package, ClipboardList, LayoutDashboard } from "lucide-react";
import { useCart } from "./cart-context";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/parts", label: "Browse Parts", icon: Package },
  { href: "/portal/orders", label: "My Orders", icon: ClipboardList },
];

export function PortalTopBar({ user }: { user?: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg1/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 lg:px-8">
        <Link href="/portal" className="flex items-center gap-3">
          <Image src="/assets/logo.png" alt="OMG" width={28} height={28} className="h-7 w-auto" />
          <div className="leading-tight">
            <div className="font-serif text-lg uppercase tracking-[0.2em] text-platinum">OMG</div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-ink-muted">Portal</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== "/portal" && pathname.startsWith(n.href));
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-2 rounded-sm px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors",
                  active ? "text-gold-bright" : "text-ink-dim hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/portal/cart"
            className="relative inline-flex items-center gap-2 rounded-sm border border-line px-4 py-2 text-xs uppercase tracking-[0.14em] text-ink-dim transition-colors hover:border-gold/40 hover:text-gold-bright"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-bg0">{count}</span>
            )}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="hidden md:inline-flex rounded-sm border border-line px-4 py-2 text-xs uppercase tracking-[0.14em] text-ink-dim transition-colors hover:border-gold/40 hover:text-gold-bright"
          >
            Sign out
          </button>
        </div>
      </div>

      <nav className="md:hidden border-t border-line/60 px-2 py-1.5">
        <div className="flex items-center justify-around gap-2">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== "/portal" && pathname.startsWith(n.href));
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-sm px-2 py-1 text-[10px] uppercase tracking-[0.1em]",
                  active ? "text-gold-bright" : "text-ink-dim"
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
