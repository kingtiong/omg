import { z } from "zod";

export const supplierSchema = z.object({
  code: z.string().trim().min(2, "Code must be at least 2 characters").max(50),
  name: z.string().trim().min(2, "Name is required").max(200),
  contactName: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  address: z.string().trim().max(1000).optional().or(z.literal("")),
  paymentTermsDays: z.coerce.number().int().min(0).max(365).default(30),
  active: z.coerce.boolean().default(true),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
