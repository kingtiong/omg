"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FormError, FormSection } from "@/components/ui/form-field";
import { fieldError, type ActionResult } from "@/lib/forms";
import { recordPayment } from "../actions";

interface InvoiceLite {
  id: string;
  number: string;
  dueDate: string; // ISO
  total: number;
  paid: number;
}

function fmt(n: number) {
  return `RM ${n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function PaymentForm({
  customers,
  outstandingInvoices,
  preselectedCustomerId,
  preselectedInvoiceId,
}: {
  customers: Array<{ id: string; code: string; name: string; paymentTermsDays: number }>;
  outstandingInvoices: InvoiceLite[];
  preselectedCustomerId: string | null;
  preselectedInvoiceId: string | null;
}) {
  const router = useRouter();
  const [state, action] = useFormState<ActionResult, FormData>(recordPayment, { ok: true });
  const fe = state.ok ? undefined : state.fieldErrors;

  const [customerId, setCustomerId] = useState(preselectedCustomerId ?? "");
  const [amount, setAmount] = useState<string>("");
  const [allocs, setAllocs] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    outstandingInvoices.forEach((i) => {
      const out = i.total - i.paid;
      init[i.id] = preselectedInvoiceId === i.id ? out.toFixed(2) : "0.00";
    });
    return init;
  });

  // If user changes customer, reload page to fetch their open invoices
  useEffect(() => {
    if (customerId && customerId !== (preselectedCustomerId ?? "")) {
      router.replace(`/admin/payments/new?customerId=${customerId}`);
    }
  }, [customerId, preselectedCustomerId, router]);

  const totalAllocated = useMemo(
    () => Object.values(allocs).reduce((a, x) => a + (Number(x) || 0), 0),
    [allocs]
  );
  const amountNum = Number(amount) || 0;
  const remaining = amountNum - totalAllocated;

  const applicationsJson = JSON.stringify(
    Object.entries(allocs)
      .map(([invoiceId, amt]) => ({ invoiceId, amount: Number(amt) || 0 }))
      .filter((a) => a.amount > 0)
  );

  return (
    <Card>
      <form action={action}>
        <FormSection title="Payment details" description="Money received from a customer.">
          <Field label="Customer" htmlFor="customerId" error={fieldError(fe, "customerId")} className="sm:col-span-2">
            <Select
              id="customerId"
              name="customerId"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            >
              <option value="">— Select customer —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} · {c.name} (NET {c.paymentTermsDays})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Amount (RM)" htmlFor="amount" error={fieldError(fe, "amount")}>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min={0.01}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Field>
          <Field label="Method" htmlFor="method" error={fieldError(fe, "method")}>
            <Select id="method" name="method" defaultValue="BANK_TRANSFER">
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
              <option value="ONLINE">Online</option>
              <option value="OTHER">Other</option>
            </Select>
          </Field>
          <Field label="Received on" htmlFor="receivedAt" error={fieldError(fe, "receivedAt")}>
            <Input id="receivedAt" name="receivedAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </Field>
          <Field label="Notes / reference" htmlFor="notes" className="sm:col-span-2" error={fieldError(fe, "notes")}>
            <Textarea id="notes" name="notes" rows={2} placeholder="Bank ref, cheque number, etc." />
          </Field>
        </FormSection>

        <FormSection title="Apply to invoices" description="How much of this payment goes to each open invoice.">
          {outstandingInvoices.length === 0 ? (
            <div className="sm:col-span-2 rounded-sm border border-line bg-bg2/40 p-4 text-sm text-ink-dim">
              {customerId ? "No outstanding invoices for this customer." : "Select a customer above to see open invoices."}
            </div>
          ) : (
            <div className="sm:col-span-2 space-y-3">
              {outstandingInvoices.map((inv) => {
                const out = inv.total - inv.paid;
                return (
                  <div key={inv.id} className="flex flex-wrap items-center gap-3 rounded-sm border border-line bg-bg2/30 px-4 py-3">
                    <div className="min-w-[180px]">
                      <div className="font-mono text-xs text-ink">{inv.number}</div>
                      <div className="text-xs text-ink-muted">due {new Date(inv.dueDate).toLocaleDateString("en-GB")}</div>
                    </div>
                    <div className="ml-auto text-right text-xs text-ink-muted">
                      <div>Total {fmt(inv.total)}</div>
                      <div>Outstanding <span className="text-platinum">{fmt(out)}</span></div>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      max={out}
                      value={allocs[inv.id] ?? "0.00"}
                      onChange={(e) => setAllocs({ ...allocs, [inv.id]: e.target.value })}
                      className="w-32"
                    />
                  </div>
                );
              })}
              <div className="flex items-center justify-between border-t border-line/40 pt-3 text-sm">
                <span className="text-ink-dim">Total allocated</span>
                <span className="text-platinum">{fmt(totalAllocated)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-dim">Unallocated</span>
                <span className={remaining < -0.001 ? "text-red-300" : "text-ink-dim"}>{fmt(remaining)}</span>
              </div>
            </div>
          )}
        </FormSection>

        <input type="hidden" name="applications" value={applicationsJson} />

        {!state.ok && state.error && (
          <div className="px-6 pb-4 pt-0">
            <FormError message={state.error} />
          </div>
        )}

        <CardFooter>
          <Link href="/admin/payments">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Submit />
        </CardFooter>
      </form>
    </Card>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Recording…" : "Record payment"}
    </Button>
  );
}
