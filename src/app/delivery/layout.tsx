import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Providers } from "@/components/providers";
import { DeliveryTopBar } from "@/components/delivery/topbar";

export default async function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/delivery");
  if (session.user.role !== "DELIVERY") redirect("/");

  return (
    <Providers>
      <div className="min-h-screen bg-bg0 text-ink">
        <DeliveryTopBar user={session.user} />
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </div>
    </Providers>
  );
}
