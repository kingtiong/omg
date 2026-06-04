import { z } from "zod";

export const contactRequestSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(200),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().toLowerCase().email("Invalid email").max(200),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  source: z.string().trim().max(100).optional().or(z.literal("")),
});

export type ContactRequestInput = z.infer<typeof contactRequestSchema>;
