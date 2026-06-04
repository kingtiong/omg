import { z } from "zod";

export const customerUserSchema = z.object({
  customerId: z.string().min(1),
  email: z.string().trim().toLowerCase().email("Invalid email"),
  name: z.string().trim().min(2, "Name is required").max(200),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export type CustomerUserInput = z.infer<typeof customerUserSchema>;
