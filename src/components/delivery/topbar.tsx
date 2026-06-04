"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";

export function DeliveryTopBar({ user }: { user?: { name?: string | null } }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg1/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/delivery" className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="OMG" width={26} height={26} className="h-6 w-auto" />
          <span className="font-serif uppercase tracking-[0.2em] text-platinum">OMG · Delivery</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs uppercase tracking-[0.14em] text-ink-muted sm:inline">{user?.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-sm border border-line px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-ink-dim hover:border-gold/40 hover:text-gold-bright"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
