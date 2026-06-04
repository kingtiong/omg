"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Field, FormError } from "@/components/ui/form-field";
import { fieldError, type ActionResult } from "@/lib/forms";
import { createLocation } from "./actions";

export function LocationForm() {
  const [state, action] = useFormState<ActionResult, FormData>(createLocation, { ok: true });
  const fe = state.ok ? undefined : state.fieldErrors;

  return (
    <Card>
      <form action={action}>
        <CardHeader>
          <CardTitle>Add location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Code" htmlFor="code" error={fieldError(fe, "code")} hint="Short label like MAIN, BIN-A1.">
            <Input id="code" name="code" placeholder="MAIN" required />
          </Field>
          <Field label="Name" htmlFor="name" error={fieldError(fe, "name")}>
            <Input id="name" name="name" placeholder="Main Warehouse" required />
          </Field>
          <Field label="" htmlFor="isDefault">
            <label className="flex items-center gap-2 text-sm text-ink-dim">
              <input type="checkbox" name="isDefault" id="isDefault" className="h-4 w-4 accent-gold" />
              <span>Set as default location</span>
            </label>
          </Field>
          {!state.ok && state.error && <FormError message={state.error} />}
        </CardContent>
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
      {pending ? "Saving…" : "Add location"}
    </Button>
  );
}
