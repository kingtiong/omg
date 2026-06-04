import { z } from "zod";

export const purchaseOrderItemInputSchema = z.object({
  partId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(100000),
  unitCost: z.coerce.number().min(0).max(10_000_000),
});

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  expectedAt: z.string().optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  items: z.string().min(1, "At least one line item is required"),
});

export const purchaseOrderItemsSchema = z
  .array(purchaseOrderItemInputSchema)
  .min(1, "At least one line item is required");

export const receivePurchaseOrderSchema = z.object({
  id: z.string().min(1),
  locationId: z.string().min(1, "Location is required"),
  receipts: z.string().min(1),
});

export const receiptLinesSchema = z.array(
  z.object({
    itemId: z.string().min(1),
    qty: z.coerce.number().int().min(0).max(100000),
  })
);

export type PurchaseOrderItemInput = z.infer<typeof purchaseOrderItemInputSchema>;
export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
