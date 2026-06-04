import { z } from "zod";

export const locationSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(64),
  name: z.string().trim().min(1, "Name is required").max(200),
  isDefault: z.coerce.boolean().default(false),
});

export type LocationInput = z.infer<typeof locationSchema>;
