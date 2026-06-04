import { PageHeader, Crumbs } from "@/components/ui/page-header";
import { ImportForm } from "./_form";

export default function ImportPartsPage() {
  return (
    <>
      <Crumbs items={[{ href: "/admin/parts", label: "Parts catalog" }, { label: "Import" }]} />
      <PageHeader
        eyebrow="Bulk import"
        title="Import parts from CSV"
        description="Upload a CSV to create or update many SKUs at once. Existing SKUs are updated; new ones are created."
      />
      <ImportForm />
    </>
  );
}
