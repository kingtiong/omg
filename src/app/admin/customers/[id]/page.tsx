import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader, Crumbs } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CustomerForm } from "../_form";
import { updateCustomer } from "../actions";
import { CustomerUsersForm } from "./users-form";
import { formatDate } from "@/lib/format";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      users: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!customer) notFound();

  const action = updateCustomer.bind(null, id);

  return (
    <>
      <Crumbs items={[{ href: "/admin/customers", label: "Customers" }, { label: customer.name }]} />
      <PageHeader eyebrow="Edit" title={customer.name} description={`Code ${customer.code}`} />

      <div className="space-y-8">
        <CustomerForm
          defaults={{
            code: customer.code,
            name: customer.name,
            contactName: customer.contactName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            paymentTermsDays: customer.paymentTermsDays,
            creditLimit: Number(customer.creditLimit),
            active: customer.active,
            notes: customer.notes,
          }}
          action={action}
          submitLabel="Save changes"
        />

        <Card>
          <CardHeader>
            <CardTitle>Portal users</CardTitle>
            <CardDescription>
              People at {customer.name} who can sign in to the customer portal and place orders.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Status</TH>
                  <TH>Created</TH>
                </TR>
              </THead>
              <TBody>
                {customer.users.length === 0 ? (
                  <EmptyRow colSpan={4} message="No portal users yet — add one below to give this customer access." />
                ) : (
                  customer.users.map((u) => (
                    <TR key={u.id}>
                      <TD className="text-platinum">{u.name}</TD>
                      <TD className="text-ink-dim">{u.email}</TD>
                      <TD>
                        {u.active ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Inactive</Badge>}
                      </TD>
                      <TD className="text-ink-dim">{formatDate(u.createdAt)}</TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        <CustomerUsersForm customerId={customer.id} />
      </div>
    </>
  );
}
