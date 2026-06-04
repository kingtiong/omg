import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader, Crumbs } from "@/components/ui/page-header";
import { SupplierForm } from "../_form";
import { updateSupplier } from "../actions";

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) notFound();

  const action = updateSupplier.bind(null, id);

  return (
    <>
      <Crumbs items={[{ href: "/admin/suppliers", label: "Suppliers" }, { label: supplier.name }]} />
      <PageHeader eyebrow="Edit" title={supplier.name} description={`Code ${supplier.code}`} />
      <SupplierForm
        defaults={{
          code: supplier.code,
          name: supplier.name,
          contactName: supplier.contactName,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          paymentTermsDays: supplier.paymentTermsDays,
          active: supplier.active,
          notes: supplier.notes,
        }}
        action={action}
        submitLabel="Save changes"
      />
    </>
  );
}
