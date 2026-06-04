"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FormError } from "@/components/ui/form-field";
import { type ActionResult } from "@/lib/forms";
import { receivePurchaseOrder } from "../actions";

interface ReceiveLine {
  id: string;
  partLabel: string;
  ordered: number;
  received: number;
}

export function ReceiveForm({
  poId,
  locations,
  items,
}: {
  poId: string;
  locations: Array<{ id: string; code: string; name: string; isDefault: boolean }>;
  items: ReceiveLine[];
}) {
  const [state, action] = useFormState<ActionResult, FormData>(receivePurchaseOrder, { ok: true });
  const defaultLoc = locations.find((l) => l.isDefault) ?? locations[0];

  const [qtys, setQtys] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    items.forEach((it) => {
      init[it.id] = Math.max(0, it.ordered - it.received);
    });
    return init;
  });

  const receiptsJson = JSON.stringify(
    Object.entries(qtys)
      .map(([itemId, qty]) => ({ itemId, qty }))
      .filter((r) => r.qty > 0)
  );

  return (
    <Card>
      <form action={action}>
        <CardHeader>
          <CardTitle>Receive stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-ink-dim">
            Enter quantities actually delivered. Inventory increases at the chosen location and part cost updates to this PO&apos;s unit cost.
          </p>
          <input type="hidden" name="id" value={poId} />
          <Field label="Receive into" htmlFor="locationId">
            <Select id="locationId" name="locationId" defaultValue={defaultLoc?.id ?? ""} required>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.code} · {l.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="space-y-2">
            {items.map((it) => {
              const outstanding = it.ordered - it.received;
              return (
                <div
                  key={it.id}
                  className="flex flex-wrap items-center gap-3 rounded-sm border border-line bg-bg2/30 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-platinum">{it.partLabel}</div>
                    <div className="text-xs text-ink-muted">
                      Ordered {it.ordered} · received {it.received} · outstanding {outstanding}
                    </div>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    max={outstanding}
                    step={1}
                    value={qtys[it.id] ?? 0}
                    onChange={(e) =>
                      setQtys((q) => ({
                        ...q,
                        [it.id]: Math.max(0, Math.min(outstanding, Number(e.target.value) || 0)),
                      }))
                    }
                    disabled={outstanding === 0}
                    className="w-24 text-right"
                  />
                </div>
              );
            })}
          </div>
          <input type="hidden" name="receipts" value={receiptsJson} />
          {!state.ok && state.error && <FormError message={state.error} />}
        </CardContent>
        <CardFooter>
          <ReceiveBtn />
        </CardFooter>
      </form>
    </Card>
  );
}

function ReceiveBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Booking in…" : "Book stock in"}
    </Button>
  );
}
