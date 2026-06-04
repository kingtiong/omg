import { z } from "zod";

export const settingsSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required").max(120),
  companyAddress: z.string().trim().max(500).optional().or(z.literal("")),
  companyPhone: z.string().trim().max(40).optional().or(z.literal("")),
  companyEmail: z.string().trim().max(120).email("Enter a valid email").optional().or(z.literal("")),
  sstRegistered: z.coerce.boolean().default(false),
  defaultSstRate: z.coerce.number().min(0, "Cannot be negative").max(100, "Cannot exceed 100").default(0),
  defaultPaymentTermsDays: z.coerce.number().int().min(0).max(365).default(30),
  invoicePrefix: z
    .string()
    .trim()
    .min(1, "Invoice prefix is required")
    .max(20, "Keep it under 20 characters")
    .regex(/^[A-Z0-9-]+$/, "Use uppercase letters, digits, and dashes only"),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
