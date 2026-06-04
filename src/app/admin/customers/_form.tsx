"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Field, FormError, FormSection } from "@/components/ui/form-field";
import { fieldError, type ActionResult } from "@/lib/forms";

export interface CustomerFormDefaults {
  id?: string;
  code?: string;
  name?: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  paymentTermsDays?: number;
  creditLimit?: number | string;
  active?: boolean;
  notes?: string | null;
}

export function CustomerForm({
  defaults,
  action,
  submitLabel,
}: {
  defaults?: CustomerFormDefaults;
  action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState<ActionResult, FormData>(action, { ok: true });
  const fe = state.ok ? undefined : state.fieldErrors;

  return (
    <Card>
      <form action={formAction}>
        <FormSection title="Service centre" description="Identity of the customer account.">
          <Field label="Customer code" htmlFor="code" error={fieldError(fe, "code")} hint="Auto-generated if blank.">
            <Input id="code" name="code" defaultValue={defaults?.code ?? ""} placeholder="CUST-0001" />
          </Field>
          <Field label="Service centre name" htmlFor="name" error={fieldError(fe, "name")}>
            <Input id="name" name="name" defaultValue={defaults?.name ?? ""} required />
          </Field>
          <Field label="Contact person" htmlFor="contactName" error={fieldError(fe, "contactName")}>
            <Input id="contactName" name="contactName" defaultValue={defaults?.contactName ?? ""} />
          </Field>
          <Field label="Email" htmlFor="email" error={fieldError(fe, "email")}>
            <Input id="email" name="email" type="email" defaultValue={defaults?.email ?? ""} />
          </Field>
          <Field label="Phone" htmlFor="phone" error={fieldError(fe, "phone")}>
            <Input id="phone" name="phone" defaultValue={defaults?.phone ?? ""} placeholder="+60 12 345 6789" />
          </Field>
          <Field label="Active" htmlFor="active">
            <label className="flex h-10 items-center gap-2 text-sm text-ink-dim">
              <input
                type="checkbox"
                id="active"
                name="active"
                defaultChecked={defaults?.active ?? true}
                className="h-4 w-4 rounded-sm border-line bg-bg0 accent-gold"
              />
              <span>Allowed to place orders</span>
            </label>
          </Field>
        </FormSection>

        <FormSection title="Address & terms" description="Delivery address and how they pay.">
          <Field label="Address" htmlFor="address" className="sm:col-span-2" error={fieldError(fe, "address")}>
            <Textarea id="address" name="address" rows={3} defaultValue={defaults?.address ?? ""} />
          </Field>
          <Field
            label="Payment terms (days)"
            htmlFor="paymentTermsDays"
            error={fieldError(fe, "paymentTermsDays")}
            hint="NET 30 = 30 days from invoice."
          >
            <Input
              id="paymentTermsDays"
              name="paymentTermsDays"
              type="number"
              min={0}
              max={365}
              defaultValue={defaults?.paymentTermsDays ?? 30}
            />
          </Field>
          <Field
            label="Credit limit (RM)"
            htmlFor="creditLimit"
            error={fieldError(fe, "creditLimit")}
            hint="Max unpaid balance allowed. 0 = no limit set."
          >
            <Input
              id="creditLimit"
              name="creditLimit"
              type="number"
              step="0.01"
              min={0}
              defaultValue={defaults?.creditLimit ?? 0}
            />
          </Field>
        </FormSection>

        <FormSection title="Notes" description="Anything else worth remembering.">
          <Field label="Internal notes" htmlFor="notes" className="sm:col-span-2" error={fieldError(fe, "notes")}>
            <Textarea id="notes" name="notes" rows={4} defaultValue={defaults?.notes ?? ""} />
          </Field>
        </FormSection>

        {!state.ok && state.error && (
          <div className="px-6 pb-4 pt-0">
            <FormError message={state.error} />
          </div>
        )}

        <CardFooter>
          <Link href="/admin/customers">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Submit label={submitLabel} />
        </CardFooter>
      </form>
    </Card>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}
