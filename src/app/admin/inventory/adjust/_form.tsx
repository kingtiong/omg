"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Field, FormError, FormSection } from "@/components/ui/form-field";
import { type ActionResult, fieldError } from "@/lib/forms";
import { adjustStock } from "../actions";

export function AdjustForm({
  parts,
  locations,
  defaultPart,
}: {
  parts: Array<{ id: string; sku: string; partNumber: string; name: string }>;
  locations: Array<{ id: string; code: string; name: string; isDefault: boolean }>;
  defaultPart?: { id: string; sku: string; partNumber: string; name: string };
}) {
  const [state, action] = useFormState<ActionResult, FormData>(adjustStock, { ok: true });
  const fe = state.ok ? undefined : state.fieldErrors;
  const defaultLoc = locations.find((l) => l.isDefault) ?? locations[0];

  return (
    <Card>
      <form action={action}>
        <FormSection title="Adjustment" description="Positive numbers add stock, negative subtract.">
          <Field label="Part" htmlFor="partId" error={fieldError(fe, "partId")} className="sm:col-span-2">
            <Select id="partId" name="partId" defaultValue={defaultPart?.id ?? ""} required>
              <option value="">— Select part —</option>
              {parts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} · {p.partNumber} · {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Location" htmlFor="locationId" error={fieldError(fe, "locationId")}>
            <Select id="locationId" name="locationId" defaultValue={defaultLoc?.id ?? ""} required>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.code} · {l.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Quantity change"
            htmlFor="delta"
            error={fieldError(fe, "delta")}
            hint="e.g. +5 added, -3 removed."
          >
            <Input id="delta" name="delta" type="number" step={1} required />
          </Field>
          <Field label="Reason / notes" htmlFor="notes" className="sm:col-span-2" error={fieldError(fe, "notes")}>
            <Textarea id="notes" name="notes" rows={3} placeholder="Stock-take 2026-05-07 — found 5 extra in bin A2." />
          </Field>
        </FormSection>

        {!state.ok && state.error && (
          <div className="px-6 pb-4 pt-0">
            <FormError message={state.error} />
          </div>
        )}

        <CardFooter>
          <Link href="/admin/inventory">
            <Button type="button" variant="outline">
              Cancel
            </Button>
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
      {pending ? "Saving…" : "Apply adjustment"}
    </Button>
  );
}
