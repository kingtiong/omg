import { PageHeader, Crumbs } from "@/components/ui/page-header";
import { CustomerForm } from "../_form";
import { createCustomer } from "../actions";

export default function NewCustomerPage() {
  return (
    <>
      <Crumbs items={[{ href: "/admin/customers", label: "Customers" }, { label: "New" }]} />
      <PageHeader eyebrow="New" title="Add customer" description="Onboard a service centre so they can place orders." />
      <CustomerForm action={createCustomer} submitLabel="Create customer" />
    </>
  );
}
