import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Providers } from "@/components/providers";
import { CartProvider } from "@/components/portal/cart-context";
import { PortalTopBar } from "@/components/portal/topbar";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/portal");
  if (session.user.role !== "CUSTOMER") redirect("/");

  return (
    <Providers>
      <CartProvider>
        <div className="min-h-screen bg-bg0 text-ink">
          <PortalTopBar user={session.user} />
          <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">{children}</main>
        </div>
      </CartProvider>
    </Providers>
  );
}
