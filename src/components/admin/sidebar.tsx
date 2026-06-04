"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  Boxes,
  ClipboardList,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  Warehouse,
  Inbox,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV: Array<{ section: string; items: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }> }> }> = [
  {
    section: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    section: "Master Data",
    items: [
      { href: "/admin/suppliers", label: "Suppliers", icon: Truck },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/parts", label: "Parts Catalog", icon: Package },
      { href: "/admin/locations", label: "Locations", icon: Warehouse },
    ],
  },
  {
    section: "Operations",
    items: [
      { href: "/admin/inventory", label: "Inventory", icon: Boxes },
      { href: "/admin/sales-orders", label: "Sales Orders", icon: ClipboardList },
      { href: "/admin/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
    ],
  },
  {
    section: "Finance",
    items: [
      { href: "/admin/invoices", label: "Invoices", icon: Receipt },
      { href: "/admin/payments", label: "Payments", icon: Wallet },
      { href: "/admin/aging", label: "Aging Report", icon: Wallet },
    ],
  },
  {
    section: "Insights",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/leads", label: "Leads", icon: Inbox },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

function NavBody({ onNavigate, user }: { onNavigate?: () => void; user?: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname();
  return (
    <>
      <Link href="/admin" onClick={onNavigate} className="flex items-center gap-3 border-b border-line px-6 py-5">
        <Image src="/assets/logo.png" alt="OMG" width={28} height={28} className="h-7 w-auto" />
        <div className="leading-tight">
          <div className="font-serif text-xl uppercase tracking-[0.2em] text-platinum">OMG</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">Operations</div>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {NAV.map((sec) => (
          <div key={sec.section} className="mb-6">
            <div className="mb-2 px-3 text-[10px] uppercase tracking-[0.2em] text-ink-muted">{sec.section}</div>
            <ul className="space-y-0.5">
              {sec.items.map((it) => {
                const active = pathname === it.href || (it.href !== "/admin" && pathname.startsWith(it.href));
                const Icon = it.icon;
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-all",
                        active
                          ? "bg-gold/10 text-gold-bright border-l-2 border-gold"
                          : "text-ink-dim hover:bg-white/5 hover:text-ink"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{it.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line p-4">
        <div className="mb-3 px-2">
          <div className="truncate text-sm text-ink">{user?.name ?? "Admin"}</div>
          <div className="truncate text-xs text-ink-muted">{user?.email}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2 rounded-sm border border-line px-3 py-2 text-xs uppercase tracking-[0.14em] text-ink-dim transition-colors hover:border-gold/40 hover:text-gold-bright"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );
}

export function AdminSidebar({ user }: { user?: { name?: string | null; email?: string | null } }) {
  return (
    <aside className="hidden lg:flex h-screen w-64 shrink-0 flex-col border-r border-line bg-bg1/80 backdrop-blur-md">
      <NavBody user={user} />
    </aside>
  );
}

export function MobileTopBar({ user }: { user?: { name?: string | null; email?: string | null } }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-line bg-bg1/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-line text-ink-dim transition-colors hover:border-gold/40 hover:text-gold-bright"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/assets/logo.png" alt="OMG" width={24} height={24} className="h-6 w-auto" />
            <span className="font-serif uppercase tracking-[0.2em] text-platinum">OMG</span>
          </Link>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-xs uppercase tracking-[0.14em] text-ink-dim hover:text-gold-bright"
        >
          Sign out
        </button>
      </div>

      <div
        className={cn(
          "lg:hidden fixed inset-0 z-50 transition-opacity",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!open}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-line bg-bg1 shadow-2xl transition-transform",
            open ? "translate-x-0" : "-translate-x-full"
          )}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-dim transition-colors hover:text-gold-bright"
          >
            <X className="h-5 w-5" />
          </button>
          <NavBody onNavigate={() => setOpen(false)} user={user} />
        </aside>
      </div>
    </>
  );
}
