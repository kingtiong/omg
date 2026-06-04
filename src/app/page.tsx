import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowRight,
  PackageSearch,
  ShoppingCart,
  Truck,
  LineChart,
  Disc,
  Filter,
  Cog,
  Battery,
  Droplets,
  Gauge,
  Wrench,
  Flame,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "OMG — Spare Parts for Malaysia's Service Centres",
  description:
    "OMG is the spare-parts spine for Malaysia's car service centres. High-SKU catalog, self-service ordering, reliable delivery, decision-grade analytics.",
  openGraph: {
    title: "OMG — Spare Parts for Malaysia's Service Centres",
    description:
      "OMG is the spare-parts spine for Malaysia's car service centres. High-SKU catalog, self-service ordering, reliable delivery.",
    type: "website",
  },
};

const PILLARS = [
  {
    icon: PackageSearch,
    num: "i.",
    title: "Catalog at scale",
    body:
      "A high-SKU spine with cross-references, OEM numbers, and bin-level inventory — built for a distributor's depth, not a retailer's shelf.",
  },
  {
    icon: ShoppingCart,
    num: "ii.",
    title: "Self-service ordering",
    body:
      "Your team places orders themselves: search by part number, see live stock, request delivery. No back-and-forth phone calls.",
  },
  {
    icon: LineChart,
    num: "iii.",
    title: "Decision-grade analytics",
    body:
      "Weekly and monthly demand, profit per part and customer, reorder recommendations. The numbers your gut already knows, made explicit.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Apply for access",
    body: "Submit the form below. We approve verified service centres within one business day.",
  },
  {
    num: "02",
    title: "Browse live inventory",
    body: "Search the full catalog. See exactly what's in stock right now — no guesswork, no callbacks.",
  },
  {
    num: "03",
    title: "Place orders, set terms",
    body: "Add to cart, place the order. We confirm, generate your invoice with NET payment terms, and reserve the stock.",
  },
  {
    num: "04",
    title: "Delivered to your bay",
    body: "Our delivery team picks, dispatches, and confirms hand-off. Track every delivery from your portal.",
  },
];

const CATEGORIES = [
  { icon: Disc, name: "Brake systems", note: "pads, discs, calipers" },
  { icon: Filter, name: "Filtration", note: "oil, air, fuel, cabin" },
  { icon: Droplets, name: "Fluids & oils", note: "engine, transmission, coolant" },
  { icon: Battery, name: "Electrical", note: "batteries, alternators, sensors" },
  { icon: Cog, name: "Engine", note: "belts, timing, gaskets" },
  { icon: Gauge, name: "Suspension", note: "shocks, bushes, mounts" },
  { icon: Flame, name: "Exhaust", note: "mufflers, manifolds, gaskets" },
  { icon: Wrench, name: "Transmission", note: "clutch, fluids, mounts" },
];

export default function HomePage() {
  return (
    <>
      <div className="aurora" aria-hidden />
      <div className="grain" aria-hidden />

      {/* ===== Top nav ===== */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg0/55 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/assets/logo.png"
              alt="OMG"
              width={32}
              height={32}
              className="h-8 w-auto drop-shadow-[0_0_12px_rgba(212,175,55,0.25)]"
              priority
            />
            <div className="leading-tight">
              <div className="font-serif text-2xl font-medium uppercase tracking-[0.22em] text-platinum">OMG</div>
              <div className="text-[9px] uppercase tracking-[0.3em] text-ink-muted">Spare Parts · Trade</div>
            </div>
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {[
              { href: "#what-we-stock", label: "Catalog" },
              { href: "#how", label: "How it works" },
              { href: "#why", label: "Why OMG" },
              { href: "#apply", label: "Apply" },
            ].map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-dim transition-colors hover:text-gold-bright"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-sm border border-gold px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-bright transition-all hover:bg-gold hover:text-bg0 hover:shadow-[0_0_30px_rgba(212,175,55,0.35)]"
          >
            Sign in
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <header className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-20 pt-32 text-center">
        <div className="hero-logo-wrap relative mb-9 flex h-28 w-28 items-center justify-center opacity-0 [animation:fade-up_1s_ease_0.05s_forwards]">
          <Image
            src="/assets/logo.png"
            alt="OMG"
            width={110}
            height={110}
            className="hero-logo h-auto w-28 drop-shadow-[0_0_30px_rgba(212,175,55,0.4)] [animation:logo-breathe_5s_ease-in-out_1.2s_infinite]"
            priority
          />
        </div>

        <span className="mb-10 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-gold opacity-0 [animation:fade-up_1s_ease_0.2s_forwards] before:h-px before:w-10 before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent after:h-px after:w-10 after:bg-gradient-to-r after:from-transparent after:via-gold after:to-transparent">
          Built for Malaysia&apos;s service centres
        </span>

        <h1 className="mb-8 max-w-[18ch] font-serif text-[clamp(2.6rem,8vw,6.5rem)] font-normal leading-[1.05] tracking-tight opacity-0 [animation:fade-up_1.2s_ease_0.4s_forwards]">
          The parts{" "}
          <span className="bg-gradient-to-br from-gold-bright via-gold to-gold-deep bg-clip-text font-medium italic text-transparent">
            spine
          </span>{" "}
          for the trade.
        </h1>

        <p className="mb-12 max-w-[58ch] text-base font-light text-ink-dim opacity-0 [animation:fade-up_1.2s_ease_0.6s_forwards] md:text-lg">
          OMG distributes spare parts to car service centres across Malaysia. High-SKU catalog,
          self-service ordering, real inventory visibility, and reliable delivery — so you spend less
          time chasing parts and more time turning bays.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 opacity-0 [animation:fade-up_1.2s_ease_0.8s_forwards]">
          <Link
            href="/login"
            className="group inline-flex items-center gap-3 rounded-sm bg-gradient-to-br from-gold-bright via-gold to-gold-deep px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-bg0 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_55px_-10px_rgba(244,215,122,0.65)]"
          >
            Sign in to portal
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#apply"
            className="inline-flex items-center gap-3 rounded-sm border border-line bg-transparent px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink transition-all hover:border-gold hover:bg-gold/5 hover:text-gold-bright"
          >
            Apply for access
          </a>
        </div>

        {/* Sub-hero strip */}
        <div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-8 opacity-0 [animation:fade-up_1.2s_ease_1s_forwards]">
          {[
            ["High volume", "Built for distributors moving thousands of SKUs."],
            ["Made in Malaysia", "Local team. Local stock. Local payment terms."],
            ["Service-centre first", "The portal is shaped by how a busy bay actually works."],
          ].map(([k, v]) => (
            <div key={k} className="border-t border-line/50 px-1 pt-4 text-left">
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold">{k}</div>
              <div className="mt-1 text-sm font-light text-ink-dim">{v}</div>
            </div>
          ))}
        </div>
      </header>

      {/* ===== Why OMG ===== */}
      <section id="why" className="relative px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="mb-4 block text-[11px] uppercase tracking-[0.4em] text-gold">Why OMG</span>
            <h2 className="mx-auto max-w-[24ch] font-serif text-[clamp(2.2rem,5vw,3.6rem)] font-normal leading-tight">
              Engineered for{" "}
              <em className="not-italic text-gold-bright">people who run shops</em>, not warehouses.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.num}
                  className="group relative overflow-hidden rounded border border-line bg-gradient-to-b from-white/[0.02] to-white/[0.005] p-10 transition-all hover:-translate-y-1 hover:border-gold/40 hover:bg-gradient-to-b hover:from-gold/[0.04] hover:to-white/[0.005]"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <Icon className="mb-6 h-7 w-7 text-gold" />
                  <div className="mb-2 font-serif text-base italic tracking-wider text-gold">{p.num}</div>
                  <h3 className="mb-3 font-serif text-2xl font-medium text-platinum">{p.title}</h3>
                  <p className="text-sm font-light text-ink-dim">{p.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section id="how" className="relative border-t border-line bg-bg1/40 px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="mb-4 block text-[11px] uppercase tracking-[0.4em] text-gold">How it works</span>
            <h2 className="mx-auto max-w-[28ch] font-serif text-[clamp(2rem,4.5vw,3.2rem)] font-normal leading-tight">
              From applying for access to taking delivery — in a few steps.
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden rounded border border-line bg-line/40 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.num} className="bg-bg1/80 p-8">
                <div className="mb-4 font-serif text-3xl italic text-gold-bright">{s.num}</div>
                <h3 className="mb-2 font-serif text-xl text-platinum">{s.title}</h3>
                <p className="text-sm font-light text-ink-dim">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Catalog categories ===== */}
      <section id="what-we-stock" className="relative px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="mb-4 block text-[11px] uppercase tracking-[0.4em] text-gold">Catalog</span>
            <h2 className="mx-auto max-w-[26ch] font-serif text-[clamp(2rem,4.5vw,3.2rem)] font-normal leading-tight">
              The categories your bay touches every day.
            </h2>
            <p className="mx-auto mt-3 max-w-[52ch] text-sm font-light text-ink-dim">
              Approved partners get the full SKU list (with cross-references and live stock) inside the portal.
              The headlines are below.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.name}
                  className="group flex flex-col items-start gap-3 rounded-sm border border-line bg-bg1/40 p-6 transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:bg-bg1/60"
                >
                  <Icon className="h-6 w-6 text-gold" />
                  <div>
                    <div className="font-serif text-lg text-platinum">{c.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.14em] text-ink-muted">{c.note}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Trust strip ===== */}
      <section className="relative border-y border-line bg-bg2/40 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <blockquote className="font-serif text-[clamp(1.4rem,3vw,2.1rem)] font-light italic leading-relaxed text-platinum">
            “We pick a part on the screen, and it&apos;s on the rack the next morning.
            Twelve months in and our parts hunt is over.”
          </blockquote>
          <cite className="mt-6 block text-xs uppercase tracking-[0.3em] text-gold not-italic">
            — Service-centre operator, Klang Valley
          </cite>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-ink-muted">
            Sample testimonial · replace with verified quote when ready
          </p>
        </div>
      </section>

      {/* ===== Apply form ===== */}
      <section id="apply" className="relative px-6 py-24 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <span className="mb-4 block text-[11px] uppercase tracking-[0.4em] text-gold">Apply</span>
            <h2 className="mb-5 font-serif text-[clamp(2rem,4vw,3rem)] font-normal leading-tight text-platinum">
              Apply for portal access.
            </h2>
            <p className="mb-8 max-w-md text-sm font-light text-ink-dim">
              We onboard verified service centres on a rolling basis. Tell us a little about your shop —
              we&apos;ll get back to you within one business day with portal credentials and your starting
              payment terms.
            </p>
            <ul className="space-y-3 text-sm text-ink-dim">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-gold" />
                Self-service ordering, 24/7
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-gold" />
                NET 30 default for verified accounts
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-gold" />
                Live inventory + cross-reference search
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-gold" />
                Delivery tracking from pick to drop
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded border border-line bg-bg1/60 p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-md md:p-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="relative border-t border-line bg-bg1/60 px-6 py-12 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 font-serif uppercase tracking-[0.22em] text-platinum">
              <Image src="/assets/logo.png" alt="OMG" width={22} height={22} className="h-5 w-auto" />
              <span>OMG</span>
            </div>
            <p className="text-xs font-light text-ink-muted">
              Spare-parts distribution for Malaysia&apos;s independent service centres.
            </p>
          </div>

          <div>
            <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-gold">Portal</div>
            <ul className="space-y-2 text-sm text-ink-dim">
              <li><Link href="/login" className="hover:text-gold-bright">Sign in</Link></li>
              <li><a href="#apply" className="hover:text-gold-bright">Apply for access</a></li>
              <li><a href="#what-we-stock" className="hover:text-gold-bright">Categories</a></li>
            </ul>
          </div>

          <div>
            <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-gold">Contact</div>
            <ul className="space-y-2 text-sm text-ink-dim">
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-gold" /> ops@xentioos.online</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-gold" /> Available on request</li>
              <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-gold" /> Malaysia</li>
            </ul>
          </div>

          <div>
            <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-gold">Operator</div>
            <p className="text-xs font-light text-ink-muted">
              An operation by{" "}
              <span className="font-serif uppercase tracking-[0.22em] text-platinum">Xentio</span>.
              Platform engineered for trade-grade reliability.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl border-t border-line/50 pt-6 text-center text-[10px] uppercase tracking-[0.3em] text-ink-muted">
          © {new Date().getFullYear()} OMG · All rights reserved.
        </div>
      </footer>
    </>
  );
}
