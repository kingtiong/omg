import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LeadStatusForm } from "./status-form";
import { formatDateTime } from "@/lib/format";
import type { ContactRequestStatus } from "@prisma/client";

const variantFor: Record<ContactRequestStatus, "neutral" | "warning" | "gold" | "success" | "danger"> = {
  NEW: "warning",
  CONTACTED: "gold",
  CONVERTED: "success",
  ARCHIVED: "neutral",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: ContactRequestStatus | "" }>;
}) {
  const { status } = await searchParams;
  const where = status ? { status } : {};
  const [leads, counts] = await Promise.all([
    prisma.contactRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.contactRequest.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const countByStatus: Record<string, number> = {};
  for (const c of counts) countByStatus[c.status] = c._count._all;

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Leads"
        description="Service centres applying for portal access from the public site."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {(["NEW", "CONTACTED", "CONVERTED", "ARCHIVED"] as ContactRequestStatus[]).map((s) => (
          <Card key={s}>
            <CardContent>
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">{s}</div>
              <div className="mt-1 font-serif text-2xl text-platinum">{countByStatus[s] ?? 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent applications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>When</TH>
                <TH>Name</TH>
                <TH>Service centre</TH>
                <TH>Email</TH>
                <TH>Phone</TH>
                <TH>Message</TH>
                <TH>Status</TH>
                <TH className="text-right">Update</TH>
              </TR>
            </THead>
            <TBody>
              {leads.length === 0 ? (
                <EmptyRow colSpan={8} message="No applications yet. They'll show up here as the form is submitted on the public site." />
              ) : (
                leads.map((l) => (
                  <TR key={l.id}>
                    <TD className="text-xs text-ink-muted">{formatDateTime(l.createdAt)}</TD>
                    <TD className="text-platinum">{l.name}</TD>
                    <TD className="text-ink-dim">{l.company ?? "—"}</TD>
                    <TD>
                      <a href={`mailto:${l.email}`} className="text-gold hover:text-gold-bright">
                        {l.email}
                      </a>
                    </TD>
                    <TD className="text-ink-dim">
                      {l.phone ? (
                        <a href={`tel:${l.phone}`} className="hover:text-gold-bright">{l.phone}</a>
                      ) : "—"}
                    </TD>
                    <TD className="max-w-md text-xs text-ink-dim">
                      {l.message ? <span className="line-clamp-3">{l.message}</span> : <span className="text-ink-muted">—</span>}
                    </TD>
                    <TD>
                      <Badge variant={variantFor[l.status]}>{l.status}</Badge>
                    </TD>
                    <TD className="text-right">
                      <LeadStatusForm id={l.id} current={l.status} />
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
