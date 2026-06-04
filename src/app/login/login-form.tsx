"use client";

import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function dashboardForRole(role: string | undefined): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "CUSTOMER":
      return "/portal";
    case "DELIVERY":
      return "/delivery";
    default:
      return "/";
  }
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // callbackUrl from middleware = the URL the user originally tried to reach.
  // Honour it only if it lives under the user's role's dashboard. Otherwise
  // route to the role's home — so a CUSTOMER never lands on /admin.
  const explicitCallback = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (!res || res.error) {
      setSubmitting(false);
      setError("Invalid email or password.");
      return;
    }

    const session = await getSession();
    const role = session?.user?.role;
    const roleDashboard = dashboardForRole(role);

    let target = roleDashboard;
    if (explicitCallback && explicitCallback.startsWith(roleDashboard)) {
      target = explicitCallback;
    }

    setSubmitting(false);
    router.push(target);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-wider text-ink-dim">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full rounded-sm border border-line bg-bg0/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-gold focus:outline-none"
          placeholder="you@omg.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs uppercase tracking-wider text-ink-dim">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full rounded-sm border border-line bg-bg0/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-gold focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive-foreground">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-sm bg-gradient-to-br from-gold-bright via-gold to-gold-deep px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-bg0 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_55px_-10px_rgba(244,215,122,0.65)] disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
