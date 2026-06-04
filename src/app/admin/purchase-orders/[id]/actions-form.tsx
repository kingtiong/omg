"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-field";
import { type ActionResult } from "@/lib/forms";
import { cancelPurchaseOrder, sendPurchaseOrder } from "../actions";

export function POActions({
  poId,
  canSend,
  canCancel,
}: {
  poId: string;
  canSend: boolean;
  canCancel: boolean;
}) {
  const [sendState, sendAction] = useFormState<ActionResult, FormData>(sendPurchaseOrder, { ok: true });
  const [cancelState, cancelAction] = useFormState<ActionResult, FormData>(cancelPurchaseOrder, { ok: true });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-ink-dim">
          Send marks the PO as issued to the supplier. Cancel voids the PO without affecting stock.
        </p>
        {!sendState.ok && sendState.error && <FormError message={sendState.error} />}
        {!cancelState.ok && cancelState.error && <FormError message={cancelState.error} />}
        <div className="flex flex-wrap gap-3">
          {canSend && (
            <form action={sendAction}>
              <input type="hidden" name="id" value={poId} />
              <SendBtn />
            </form>
          )}
          {canCancel && (
            <form action={cancelAction}>
              <input type="hidden" name="id" value={poId} />
              <CancelBtn />
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SendBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending…" : "Mark as sent"}
    </Button>
  );
}

function CancelBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" disabled={pending}>
      {pending ? "Cancelling…" : "Cancel PO"}
    </Button>
  );
}
