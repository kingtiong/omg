"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-field";
import { importPartsCSV, type PartImportResult } from "../actions";

export function ImportForm() {
  const [state, action] = useFormState<PartImportResult, FormData>(importPartsCSV, { ok: true });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CSV format</CardTitle>
          <CardDescription>
            First row must be the header. Columns marked <span className="text-gold">*</span> are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-sm border border-line bg-bg0/40 p-4">
            <pre className="whitespace-pre text-xs text-ink-dim">
{`sku*, part_number*, name*, description, brand, category,
cost_price, sell_price, min_stock, reorder_qty, lead_time_days,
barcode, sst_rate, supplier_code, active`}
            </pre>
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            Example: <code className="text-ink-dim">SKU-001,BR-1234,Front brake pad,,Bosch,Brake pads,45.00,89.00,5,20,7,,0,SUP-0001,true</code>
          </p>
        </CardContent>
      </Card>

      <Card>
        <form action={action}>
          <CardHeader>
            <CardTitle>Upload</CardTitle>
            <CardDescription>UTF-8 encoded CSV. Up to a few thousand rows per file is fine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              name="file"
              accept=".csv,text/csv"
              required
              className="block w-full text-sm text-ink file:mr-4 file:rounded-sm file:border-0 file:bg-gold/20 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wider file:text-gold-bright hover:file:bg-gold/30"
            />
            {!state.ok && state.error && <FormError message={state.error} />}
            {state.ok && state.summary && (
              <div className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                <p className="font-medium">
                  Imported {state.summary.rows} row{state.summary.rows === 1 ? "" : "s"}: {state.summary.created} created,{" "}
                  {state.summary.updated} updated{state.summary.errors.length > 0 ? `, ${state.summary.errors.length} error${state.summary.errors.length === 1 ? "" : "s"}` : ""}.
                </p>
                {state.summary.errors.length > 0 && (
                  <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-xs text-amber-200">
                    {state.summary.errors.map((e, i) => (
                      <li key={i}>
                        Row {e.row}{e.sku ? ` (SKU ${e.sku})` : ""}: {e.error}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/admin/parts">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Submit />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Importing…" : "Upload & import"}
    </Button>
  );
}
