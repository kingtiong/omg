import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <>
      <div className="aurora" aria-hidden />
      <div className="grain" aria-hidden />

      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <Link href="/" className="mb-12 inline-flex items-center gap-3 font-serif text-2xl uppercase tracking-[0.18em] text-platinum">
          <Image src="/assets/logo.png" alt="Xentio" width={32} height={32} className="h-8 w-auto" priority />
          <span>Xentio OS</span>
        </Link>

        <div className="w-full max-w-md rounded border border-line bg-bg1/60 p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <div className="mb-8 text-center">
            <span className="mb-2 block text-xs uppercase tracking-[0.4em] text-gold">OMG Portal</span>
            <h1 className="font-serif text-3xl text-platinum">Sign in</h1>
          </div>

          <Suspense fallback={<div className="py-8 text-center text-sm text-ink-muted">Loading…</div>}>
            <LoginForm />
          </Suspense>

          <p className="mt-6 text-center text-xs text-ink-muted">
            Trouble signing in? Contact your OMG administrator.
          </p>
        </div>

        <div className="mt-6 w-full max-w-md rounded border border-line bg-bg1/40 p-5 backdrop-blur-md">
          <div className="mb-3 text-center text-xs uppercase tracking-[0.3em] text-gold">
            Demo Logins
          </div>
          <ul className="space-y-2 text-sm text-ink-muted">
            <li className="flex items-baseline justify-between gap-3">
              <span className="text-platinum">Admin</span>
              <span className="font-mono text-xs">admin@omg.local / ChangeMe!2026</span>
            </li>
            <li className="flex items-baseline justify-between gap-3">
              <span className="text-platinum">Customer</span>
              <span className="font-mono text-xs">customer@omg.local / CustTest!2026</span>
            </li>
            <li className="flex items-baseline justify-between gap-3">
              <span className="text-platinum">Delivery</span>
              <span className="font-mono text-xs">delivery@omg.local / DelTest!2026</span>
            </li>
          </ul>
        </div>

        <Link href="/" className="mt-10 text-xs uppercase tracking-[0.3em] text-ink-muted transition-colors hover:text-gold-bright">
          ← Back to home
        </Link>
      </main>
    </>
  );
}
