"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { useCart } from "@/components/portal/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FormError } from "@/components/ui/form-field";
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from "@/components/ui/table";
import { placeOrder, type PlaceOrderResult } from "./actions";
import { Trash2 } from "lucide-react";

function formatMYR(n: number) {
  return `RM ${n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CartView({ defaultDeliveryAddress, paymentTermsDays }: { defaultDeliveryAddress: string; paymentTermsDays: number }) {
  const { lines, total, count, setQty, remove, clear } = useCart();
  const [state, action] = useFormState<PlaceOrderResult, FormData>(placeOrder, { ok: true });

  if (count === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="mb-4 text-ink-dim">Your cart is empty.</p>
          <Link href="/portal/parts">
            <Button>Browse parts</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <Table>
          <THead>
            <TR>
              <TH>Part</TH>
              <TH className="text-right">Unit price</TH>
              <TH>Qty</TH>
              <TH className="text-right">Line total</TH>
              <TH></TH>
            </TR>
          </THead>
          <TBody>
            {lines.length === 0 ? (
              <EmptyRow colSpan={5} message="Empty." />
            ) : (
              lines.map((l) => (
                <TR key={l.partId}>
                  <TD>
                    <div className="text-platinum">{l.name}</div>
                    <div className="font-mono text-xs text-ink-muted">
                      {l.sku} · {l.partNumber}
                    </div>
                  </TD>
                  <TD className="text-right text-ink-dim">{formatMYR(l.unitPrice)}</TD>
                  <TD>
                    <Input
                      type="number"
                      min={1}
                      max={10000}
                      value={l.qty}
                      onChange={(e) => setQty(l.partId, Number(e.target.value))}
                      className="w-24"
                    />
                  </TD>
                  <TD className="text-right text-platinum">{formatMYR(l.unitPrice * l.qty)}</TD>
                  <TD className="text-right">
                    <button
                      type="button"
                      onClick={() => remove(l.partId)}
                      className="text-ink-muted transition-colors hover:text-red-300"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>

        {!state.ok && state.error && <FormError message={state.error} />}
      </div>

      <div>
        <form action={action}>
          <input type="hidden" name="cart" value={JSON.stringify(lines.map((l) => ({ partId: l.partId, qty: l.qty })))} />
          <Card>
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-ink-dim">Items</span>
                <span className="text-platinum">{count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-dim">Subtotal (excl. SST)</span>
                <span className="text-platinum">{formatMYR(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-dim">Payment terms</span>
                <span className="text-platinum">NET {paymentTermsDays}</span>
              </div>
              <div className="rounded-sm border border-line bg-bg2/40 px-3 py-2 text-xs text-ink-muted">
                SST is calculated on confirmation by OMG admin per the latest tax settings.
              </div>

              <Field label="Delivery address" htmlFor="deliveryAddress">
                <Textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  rows={3}
                  defaultValue={defaultDeliveryAddress}
                  placeholder="Where should we deliver?"
                />
              </Field>

              <Field label="Notes for OMG (optional)" htmlFor="notes">
                <Textarea id="notes" name="notes" rows={2} placeholder="e.g. urgent, please call before dispatch" />
              </Field>
            </CardContent>
            <CardFooter className="justify-between">
              <Button type="button" variant="ghost" size="sm" onClick={clear}>
                Clear cart
              </Button>
              <Submit />
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Placing…" : "Place order"}
    </Button>
  );
}
