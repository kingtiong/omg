import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsForm } from "./_form";

export default async function SettingsPage() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Settings"
        description="Company details on invoices, tax behaviour, default payment terms, and invoice numbering."
      />
      <SettingsForm
        initial={{
          companyName: settings?.companyName ?? "OMG",
          companyAddress: settings?.companyAddress ?? "",
          companyPhone: settings?.companyPhone ?? "",
          companyEmail: settings?.companyEmail ?? "",
          sstRegistered: settings?.sstRegistered ?? false,
          defaultSstRate: settings ? Number(settings.defaultSstRate) : 0,
          defaultPaymentTermsDays: settings?.defaultPaymentTermsDays ?? 30,
          invoicePrefix: settings?.invoicePrefix ?? "OMG-INV-",
        }}
      />
    </>
  );
}
