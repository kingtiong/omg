import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { CartView } from "./cart-view";

export default async function CartPage() {
  const session = await getServerSession(authOptions);
  const customer = session?.user?.customerId
    ? await prisma.customer.findUnique({
        where: { id: session.user.customerId },
        select: { name: true, address: true, paymentTermsDays: true },
      })
    : null;

  return (
    <>
      <PageHeader
        eyebrow="Cart"
        title="Review your order"
        description="Adjust quantities, set a delivery address, then place the order. OMG admin will confirm before dispatch."
      />
      <CartView
        defaultDeliveryAddress={customer?.address ?? ""}
        paymentTermsDays={customer?.paymentTermsDays ?? 30}
      />
    </>
  );
}
