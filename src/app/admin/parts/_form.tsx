"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Field, FormError, FormSection } from "@/components/ui/form-field";
import { fieldError, type ActionResult } from "@/lib/forms";

export interface PartFormDefaults {
  id?: string;
  sku?: string;
  partNumber?: string;
  name?: string;
  description?: string | null;
  barcode?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  primarySupplierId?: string | null;
  costPrice?: number | string;
  sellPrice?: number | string;
  minStock?: number;
  reorderQty?: number;
  leadTimeDays?: number;
  sstRate?: number | string | null;
  active?: boolean;
}

export function PartForm({
  defaults,
  categories,
  brands,
  suppliers,
  action,
  submitLabel,
}: {
  defaults?: PartFormDefaults;
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
  suppliers: Array<{ id: string; code: string; name: string }>;
  action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState<ActionResult, FormData>(action, { ok: true });
  const fe = state.ok ? undefined : state.fieldErrors;

  return (
    <Card>
      <form action={formAction}>
        <FormSection title="Identification" description="How the part is referenced in your catalog.">
          <Field label="Internal SKU" htmlFor="sku" error={fieldError(fe, "sku")} hint="Your own stock-keeping unit. Must be unique.">
            <Input id="sku" name="sku" defaultValue={defaults?.sku ?? ""} required />
          </Field>
          <Field label="Part number" htmlFor="partNumber" error={fieldError(fe, "partNumber")}>
            <Input id="partNumber" name="partNumber" defaultValue={defaults?.partNumber ?? ""} required />
          </Field>
          <Field label="Name" htmlFor="name" error={fieldError(fe, "name")} className="sm:col-span-2">
            <Input id="name" name="name" defaultValue={defaults?.name ?? ""} required />
          </Field>
          <Field label="Description" htmlFor="description" error={fieldError(fe, "description")} className="sm:col-span-2">
            <Textarea id="description" name="description" rows={3} defaultValue={defaults?.description ?? ""} />
          </Field>
          <Field label="Barcode" htmlFor="barcode" error={fieldError(fe, "barcode")}>
            <Input id="barcode" name="barcode" defaultValue={defaults?.barcode ?? ""} />
          </Field>
          <Field label="Active" htmlFor="active">
            <label className="flex h-10 items-center gap-2 text-sm text-ink-dim">
              <input
                type="checkbox"
                id="active"
                name="active"
                defaultChecked={defaults?.active ?? true}
                className="h-4 w-4 accent-gold"
              />
              <span>Available for orders</span>
            </label>
          </Field>
        </FormSection>

        <FormSection title="Classification" description="Group parts for analytics and search. Type a new value and we'll create it.">
          <Field label="Brand" htmlFor="brandName" error={fieldError(fe, "brandName")}>
            <Input id="brandName" name="brandName" list="brand-list" defaultValue={brandNameById(brands, defaults?.brandId)} placeholder="e.g. Bosch" />
            <datalist id="brand-list">
              {brands.map((b) => (
                <option key={b.id} value={b.name} />
              ))}
            </datalist>
          </Field>
          <Field label="Category" htmlFor="categoryName" error={fieldError(fe, "categoryName")}>
            <Input id="categoryName" name="categoryName" list="category-list" defaultValue={categoryNameById(categories, defaults?.categoryId)} placeholder="e.g. Brake pads" />
            <datalist id="category-list">
              {categories.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </Field>
          <Field label="Primary supplier" htmlFor="primarySupplierId" error={fieldError(fe, "primarySupplierId")} className="sm:col-span-2">
            <Select id="primarySupplierId" name="primarySupplierId" defaultValue={defaults?.primarySupplierId ?? ""}>
              <option value="">— None —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} · {s.name}
                </option>
              ))}
            </Select>
          </Field>
        </FormSection>

        <FormSection title="Pricing & tax" description="Cost is what you pay; sell price is what customers pay. Profit = sell − cost.">
          <Field label="Cost price (RM)" htmlFor="costPrice" error={fieldError(fe, "costPrice")}>
            <Input id="costPrice" name="costPrice" type="number" step="0.01" min={0} defaultValue={defaults?.costPrice ?? 0} />
          </Field>
          <Field label="Sell price (RM)" htmlFor="sellPrice" error={fieldError(fe, "sellPrice")}>
            <Input id="sellPrice" name="sellPrice" type="number" step="0.01" min={0} defaultValue={defaults?.sellPrice ?? 0} />
          </Field>
          <Field
            label="SST rate override (%)"
            htmlFor="sstRate"
            error={fieldError(fe, "sstRate")}
            hint="Leave blank to use the global default in Settings."
          >
            <Input id="sstRate" name="sstRate" type="number" step="0.01" min={0} max={100} defaultValue={defaults?.sstRate ?? ""} />
          </Field>
        </FormSection>

        <FormSection title="Stock policy" description="Used for low-stock alerts and reorder recommendations.">
          <Field label="Min stock" htmlFor="minStock" error={fieldError(fe, "minStock")} hint="Below this we flag low stock.">
            <Input id="minStock" name="minStock" type="number" min={0} defaultValue={defaults?.minStock ?? 0} />
          </Field>
          <Field label="Reorder qty" htmlFor="reorderQty" error={fieldError(fe, "reorderQty")} hint="Suggested PO quantity.">
            <Input id="reorderQty" name="reorderQty" type="number" min={0} defaultValue={defaults?.reorderQty ?? 0} />
          </Field>
          <Field label="Lead time (days)" htmlFor="leadTimeDays" error={fieldError(fe, "leadTimeDays")} hint="From PO sent to receipt.">
            <Input id="leadTimeDays" name="leadTimeDays" type="number" min={0} max={365} defaultValue={defaults?.leadTimeDays ?? 7} />
          </Field>
        </FormSection>

        {!state.ok && state.error && (
          <div className="px-6 pb-4 pt-0">
            <FormError message={state.error} />
          </div>
        )}

        <CardFooter>
          <Link href="/admin/parts">
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

function brandNameById(brands: Array<{ id: string; name: string }>, id?: string | null) {
  if (!id) return "";
  return brands.find((b) => b.id === id)?.name ?? "";
}
function categoryNameById(categories: Array<{ id: string; name: string }>, id?: string | null) {
  if (!id) return "";
  return categories.find((c) => c.id === id)?.name ?? "";
}
