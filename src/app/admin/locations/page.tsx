import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LocationForm } from "./_form";

export default async function LocationsPage() {
  const locations = await prisma.location.findMany({
    orderBy: [{ isDefault: "desc" }, { code: "asc" }],
    include: { _count: { select: { inventory: true } } },
  });

  return (
    <>
      <PageHeader
        eyebrow="Master Data"
        title="Locations"
        description="Warehouses or bins where stock is held. Most distributors start with a single MAIN location."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Existing locations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <THead>
                  <TR>
                    <TH>Code</TH>
                    <TH>Name</TH>
                    <TH>SKUs in stock</TH>
                    <TH>Default</TH>
                  </TR>
                </THead>
                <TBody>
                  {locations.length === 0 ? (
                    <EmptyRow colSpan={4} message="No locations yet." />
                  ) : (
                    locations.map((l) => (
                      <TR key={l.id}>
                        <TD className="font-mono text-xs text-ink-dim">{l.code}</TD>
                        <TD className="text-platinum">{l.name}</TD>
                        <TD className="text-ink-dim">{l._count.inventory}</TD>
                        <TD>{l.isDefault && <Badge variant="gold">Default</Badge>}</TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <LocationForm />
        </div>
      </div>
    </>
  );
}
