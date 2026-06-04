"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FormError } from "@/components/ui/form-field";
import { fieldError, type ActionResult } from "@/lib/forms";
import { addCustomerUser } from "./users-actions";

export function CustomerUsersForm({ customerId }: { customerId: string }) {
  const [state, action] = useFormState<ActionResult, FormData>(addCustomerUser, { ok: true });
  const fe = state.ok ? undefined : state.fieldErrors;

  return (
    <Card>
      <form action={action}>
        <input type="hidden" name="customerId" value={customerId} />
        <CardHeader>
          <CardTitle>Add portal user</CardTitle>
          <CardDescription>
            Email + password the user will use to sign in at /login. Share these credentials with them
            via your usual onboarding channel.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" error={fieldError(fe, "name")}>
            <Input id="name" name="name" required />
          </Field>
          <Field label="Email" htmlFor="email" error={fieldError(fe, "email")}>
            <Input id="email" name="email" type="email" required />
          </Field>
          <Field label="Initial password" htmlFor="password" error={fieldError(fe, "password")} className="sm:col-span-2">
            <Input id="password" name="password" type="text" minLength={8} required placeholder="At least 8 characters" />
          </Field>
          {!state.ok && state.error && <div className="sm:col-span-2"><FormError message={state.error} /></div>}
          {state.ok && (state as { ok: true; data?: unknown }).data === undefined && /* no-op placeholder */ null}
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
      {pending ? "Saving…" : "Add user"}
    </Button>
  );
}
