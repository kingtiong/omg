"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Field, FormError, FormSection } from "@/components/ui/form-field";
import { type ActionResult, fieldError } from "@/lib/forms";
import { updateSettings } from "./actions";

interface Initial {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  sstRegistered: boolean;
  defaultSstRate: number;
  defaultPaymentTermsDays: number;
  invoicePrefix: string;
}

export function SettingsForm({ initial }: { initial: Initial }) {
  const [state, action] = useFormState<ActionResult, FormData>(updateSettings, { ok: true });
  const fe = state.ok ? undefined : state.fieldErrors;

  return (
    <Card>
      <form action={action}>
        <FormSection title="Company" description="Shown on tax invoices and the customer portal.">
          <Field label="Company name" htmlFor="companyName" error={fieldError(fe, "companyName")} className="sm:col-span-2">
            <Input id="companyName" name="companyName" defaultValue={initial.companyName} required />
          </Field>
          <Field label="Address" htmlFor="companyAddress" error={fieldError(fe, "companyAddress")} className="sm:col-span-2">
            <Textarea id="companyAddress" name="companyAddress" rows={3} defaultValue={initial.companyAddress} />
          </Field>
          <Field label="Phone" htmlFor="companyPhone" error={fieldError(fe, "companyPhone")}>
            <Input id="companyPhone" name="companyPhone" defaultValue={initial.companyPhone} placeholder="+60 …" />
          </Field>
          <Field label="Email" htmlFor="companyEmail" error={fieldError(fe, "companyEmail")}>
            <Input id="companyEmail" name="companyEmail" type="email" defaultValue={initial.companyEmail} placeholder="billing@omg.my" />
          </Field>
        </FormSection>

        <FormSection title="Tax (SST)" description="Malaysia SST. Toggle on once OMG is registered.">
          <Field label="SST registered" htmlFor="sstRegistered" error={fieldError(fe, "sstRegistered")} hint="When off, invoices show a non-registered note and tax stays at 0.">
            <label className="inline-flex items-center gap-3">
              <input
                id="sstRegistered"
                name="sstRegistered"
                type="checkbox"
                defaultChecked={initial.sstRegistered}
                className="h-4 w-4 accent-gold-bright"
              />
              <span className="text-sm text-ink-dim">Enabled</span>
            </label>
          </Field>
          <Field label="Default SST rate (%)" htmlFor="defaultSstRate" error={fieldError(fe, "defaultSstRate")} hint="Per-part rates override this if set.">
            <Input
              id="defaultSstRate"
              name="defaultSstRate"
              type="number"
              step="0.01"
              min={0}
              max={100}
              defaultValue={initial.defaultSstRate}
            />
          </Field>
        </FormSection>

        <FormSection title="Billing defaults" description="Used when creating new invoices.">
          <Field label="Default payment terms (days)" htmlFor="defaultPaymentTermsDays" error={fieldError(fe, "defaultPaymentTermsDays")} hint="Used for new customers; existing customers keep their own.">
            <Input
              id="defaultPaymentTermsDays"
              name="defaultPaymentTermsDays"
              type="number"
              step={1}
              min={0}
              max={365}
              defaultValue={initial.defaultPaymentTermsDays}
            />
          </Field>
          <Field label="Invoice prefix" htmlFor="invoicePrefix" error={fieldError(fe, "invoicePrefix")} hint="Letters, digits, dashes. Combined with year and a 5-digit sequence (e.g. OMG-INV-2026-00001).">
            <Input
              id="invoicePrefix"
              name="invoicePrefix"
              defaultValue={initial.invoicePrefix}
              required
            />
          </Field>
        </FormSection>

        {!state.ok && state.error && (
          <div className="px-6 pb-4 pt-0">
            <FormError message={state.error} />
          </div>
        )}
        {state.ok && state.data ? (
          <div className="px-6 pb-4 pt-0">
            <div className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">
              Settings saved.
            </div>
          </div>
        ) : null}

        <CardFooter>
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
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}
