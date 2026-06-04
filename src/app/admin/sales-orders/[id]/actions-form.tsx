"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-field";
import { type ActionResult } from "@/lib/forms";
import { confirmSalesOrder, rejectSalesOrder } from "../actions";

export function OrderActions({ orderId }: { orderId: string }) {
  const [confirmState, confirmAction] = useFormState<ActionResult, FormData>(confirmSalesOrder, { ok: true });
  const [rejectState, rejectAction] = useFormState<ActionResult, FormData>(rejectSalesOrder, { ok: true });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Decision</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-ink-dim">
          Confirming reserves stock at the default location, generates the invoice with NET payment terms,
          and creates a delivery record for the warehouse team.
        </p>
        {!confirmState.ok && confirmState.error && <FormError message={confirmState.error} />}
        {!rejectState.ok && rejectState.error && <FormError message={rejectState.error} />}
        <div className="flex flex-wrap gap-3">
          <form action={confirmAction}>
            <input type="hidden" name="id" value={orderId} />
            <ConfirmBtn />
          </form>
          <form action={rejectAction}>
            <input type="hidden" name="id" value={orderId} />
            <RejectBtn />
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

function ConfirmBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Confirming…" : "Confirm order"}
    </Button>
  );
}

function RejectBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" disabled={pending}>
      {pending ? "Rejecting…" : "Reject"}
    </Button>
  );
}
