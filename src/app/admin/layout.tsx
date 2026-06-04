import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminSidebar, MobileTopBar } from "@/components/admin/sidebar";
import { Providers } from "@/components/providers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <Providers>
      <div className="min-h-screen bg-bg0 text-ink">
        <div className="flex">
          <AdminSidebar user={session.user} />
          <div className="flex min-h-screen flex-1 flex-col">
            <MobileTopBar user={session.user} />
            <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
          </div>
        </div>
      </div>
    </Providers>
  );
}
