import { z } from "zod";

export const partSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required").max(64),
  partNumber: z.string().trim().min(1, "Part number is required").max(128),
  name: z.string().trim().min(1, "Name is required").max(255),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  barcode: z.string().trim().max(64).optional().or(z.literal("")),
  categoryId: z.string().trim().optional().or(z.literal("")),
  brandId: z.string().trim().optional().or(z.literal("")),
  primarySupplierId: z.string().trim().optional().or(z.literal("")),
  costPrice: z.coerce.number().min(0).default(0),
  sellPrice: z.coerce.number().min(0).default(0),
  minStock: z.coerce.number().int().min(0).default(0),
  reorderQty: z.coerce.number().int().min(0).default(0),
  leadTimeDays: z.coerce.number().int().min(0).max(365).default(7),
  sstRate: z.coerce.number().min(0).max(100).optional(),
  active: z.coerce.boolean().default(true),
});

export type PartInput = z.infer<typeof partSchema>;
