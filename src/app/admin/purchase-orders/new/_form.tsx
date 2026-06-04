"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Field, FormError, FormSection } from "@/components/ui/form-field";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { type ActionResult, fieldError } from "@/lib/forms";
import { createPurchaseOrder } from "../actions";

interface PartOption {
  id: string;
  sku: string;
  partNumber: string;
  name: string;
  costPrice: number;
}

interface Line {
  key: string;
  partId: string;
  quantity: number;
  unitCost: number;
}

function fmt(n: number) {
  return `RM ${n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function NewPurchaseOrderForm({
  suppliers,
  parts,
}: {
  suppliers: Array<{ id: string; code: string; name: string }>;
  parts: PartOption[];
}) {
  const [state, action] = useFormState<ActionResult, FormData>(createPurchaseOrder, { ok: true });
  const fe = state.ok ? undefined : state.fieldErrors;
  const [lines, setLines] = useState<Line[]>([]);

  function addLine() {
    setLines((ls) => [...ls, { key: crypto.randomUUID(), partId: "", quantity: 1, unitCost: 0 }]);
  }
  function removeLine(key: string) {
    setLines((ls) => ls.filter((l) => l.key !== key));
  }
  function updateLine(key: string, patch: Partial<Line>) {
    setLines((ls) =>
      ls.map((l) => {
        if (l.key !== key) return l;
        const next = { ...l, ...patch };
        if (patch.partId && patch.partId !== l.partId) {
          const p = parts.find((x) => x.id === patch.partId);
          if (p && (l.unitCost === 0 || patch.unitCost === undefined)) {
            next.unitCost = p.costPrice;
          }
        }
        return next;
      })
    );
  }

  const subtotal = useMemo(
    () => lines.reduce((a, l) => a + l.quantity * l.unitCost, 0),
    [lines]
  );

  const itemsJson = JSON.stringify(
    lines
      .filter((l) => l.partId && l.quantity > 0)
      .map((l) => ({ partId: l.partId, quantity: l.quantity, unitCost: l.unitCost }))
  );

  return (
    <Card>
      <form action={action}>
        <FormSection title="Header" description="Who you're buying from and when you expect goods.">
          <Field label="Supplier" htmlFor="supplierId" error={fieldError(fe, "supplierId")} className="sm:col-span-2">
            <Select id="supplierId" name="supplierId" defaultValue="" required>
              <option value="">— Select supplier —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} · {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Expected date" htmlFor="expectedAt" error={fieldError(fe, "expectedAt")}>
            <Input id="expectedAt" name="expectedAt" type="date" />
          </Field>
          <Field label="Notes" htmlFor="notes" className="sm:col-span-2" error={fieldError(fe, "notes")}>
            <Textarea id="notes" name="notes" rows={2} placeholder="Reference, terms, instructions to supplier…" />
          </Field>
        </FormSection>

        <FormSection title="Line items" description="Parts to order. Unit cost defaults to the part's current cost.">
          <div className="sm:col-span-2 space-y-3">
            {lines.length === 0 ? (
              <div className="rounded-sm border border-line bg-bg2/40 p-4 text-sm text-ink-dim">
                No lines yet. Add the first one below.
              </div>
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Part</TH>
                    <TH className="w-24 text-right">Qty</TH>
                    <TH className="w-36 text-right">Unit cost</TH>
                    <TH className="w-32 text-right">Line total</TH>
                    <TH className="w-12"></TH>
                  </TR>
                </THead>
                <TBody>
                  {lines.map((l) => (
                    <TR key={l.key}>
                      <TD>
                        <Select
                          value={l.partId}
                          onChange={(e) => updateLine(l.key, { partId: e.target.value })}
                          required
                        >
                          <option value="">— Select part —</option>
                          {parts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.sku} · {p.partNumber} · {p.name}
                            </option>
                          ))}
                        </Select>
                      </TD>
                      <TD>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          value={l.quantity}
                          onChange={(e) => updateLine(l.key, { quantity: Math.max(1, Number(e.target.value) || 0) })}
                          className="w-24 text-right"
                        />
                      </TD>
                      <TD>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={l.unitCost}
                          onChange={(e) => updateLine(l.key, { unitCost: Math.max(0, Number(e.target.value) || 0) })}
                          className="w-36 text-right"
                        />
                      </TD>
                      <TD className="text-right text-platinum">{fmt(l.quantity * l.unitCost)}</TD>
                      <TD className="text-right">
                        <button
                          type="button"
                          onClick={() => removeLine(l.key)}
                          className="text-ink-muted transition-colors hover:text-red-300"
                          aria-label="Remove line"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}

            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <Plus className="mr-1 h-4 w-4" />
              Add line
            </Button>

            <div className="flex justify-end gap-6 border-t border-line/40 pt-3 text-sm">
              <span className="text-ink-dim">Subtotal</span>
              <span className="font-serif text-lg text-platinum">{fmt(subtotal)}</span>
            </div>
          </div>
        </FormSection>

        <input type="hidden" name="items" value={itemsJson} />

        {!state.ok && state.error && (
          <div className="px-6 pb-4 pt-0">
            <FormError message={state.error} />
          </div>
        )}

        <CardFooter>
          <Link href="/admin/purchase-orders">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Submit disabled={lines.length === 0} />
        </CardFooter>
      </form>
    </Card>
  );
}

function Submit({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? "Creating…" : "Create draft PO"}
    </Button>
  );
}
