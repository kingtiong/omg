import { PageHeader, Crumbs } from "@/components/ui/page-header";
import { SupplierForm } from "../_form";
import { createSupplier } from "../actions";

export default function NewSupplierPage() {
  return (
    <>
      <Crumbs items={[{ href: "/admin/suppliers", label: "Suppliers" }, { label: "New" }]} />
      <PageHeader eyebrow="New" title="Add supplier" description="Create a vendor account so you can issue purchase orders." />
      <SupplierForm action={createSupplier} submitLabel="Create supplier" />
    </>
  );
}
