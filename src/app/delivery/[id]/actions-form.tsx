"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FormError } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { DeliveryStatus } from "@prisma/client";
import { type ActionResult } from "@/lib/forms";
import { markPicking, markDispatched, markDelivered } from "./actions";

export function DeliveryActions({ deliveryId, status }: { deliveryId: string; status: DeliveryStatus }) {
  const [pickState, pickAction] = useFormState<ActionResult, FormData>(markPicking, { ok: true });
  const [dispatchState, dispatchAction] = useFormState<ActionResult, FormData>(markDispatched, { ok: true });
  const [deliverState, deliverAction] = useFormState<ActionResult, FormData>(markDelivered, { ok: true });

  if (status === "DELIVERED" || status === "CANCELLED") return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!pickState.ok && pickState.error && <FormError message={pickState.error} />}
        {!dispatchState.ok && dispatchState.error && <FormError message={dispatchState.error} />}
        {!deliverState.ok && deliverState.error && <FormError message={deliverState.error} />}

        {status === "PENDING" && (
          <form action={pickAction}>
            <input type="hidden" name="id" value={deliveryId} />
            <PickBtn />
          </form>
        )}

        {status === "PICKING" && (
          <form action={dispatchAction}>
            <input type="hidden" name="id" value={deliveryId} />
            <DispatchBtn />
          </form>
        )}

        {status === "DISPATCHED" && (
          <form action={deliverAction} className="space-y-3">
            <input type="hidden" name="id" value={deliveryId} />
            <Field label="Received by (name)" htmlFor="recipient">
              <Input id="recipient" name="recipient" placeholder="e.g. Encik Ahmad" />
            </Field>
            <Field label="Notes" htmlFor="notes">
              <Textarea id="notes" name="notes" rows={2} placeholder="Anything worth noting?" />
            </Field>
            <DeliverBtn />
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function PickBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Updating…" : "Start picking"}
    </Button>
  );
}
function DispatchBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Updating…" : "Mark dispatched (out for delivery)"}
    </Button>
  );
}
function DeliverBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Saving…" : "Mark delivered"}
    </Button>
  );
}
