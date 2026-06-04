import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { renderToBuffer } from "@react-pdf/renderer";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InvoicePdfDoc } from "@/lib/invoice-pdf";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });
  if (!invoice) return new NextResponse("Not found", { status: 404 });

  // Customers can only access their own invoices
  if (session.user.role === "CUSTOMER" && session.user.customerId !== invoice.customerId) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  if (session.user.role === "DELIVERY") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });

  const buffer = await renderToBuffer(
    InvoicePdfDoc({
      invoice: {
        number: invoice.number,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        subtotal: Number(invoice.subtotal),
        taxTotal: Number(invoice.taxTotal),
        total: Number(invoice.total),
        notes: invoice.notes,
        items: invoice.items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice),
          sstRate: Number(it.sstRate),
          lineTotal: Number(it.lineTotal),
        })),
      },
      customer: {
        name: invoice.customer.name,
        code: invoice.customer.code,
        address: invoice.customer.address,
        contactName: invoice.customer.contactName,
        email: invoice.customer.email,
        phone: invoice.customer.phone,
      },
      company: {
        name: settings?.companyName ?? "OMG",
        address: settings?.companyAddress ?? null,
        phone: settings?.companyPhone ?? null,
        email: settings?.companyEmail ?? null,
        sstRegistered: settings?.sstRegistered ?? false,
      },
    })
  );

  // Buffer is a Uint8Array subclass; Web Response wants a BodyInit, so wrap it.
  const body = new Uint8Array(buffer);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
