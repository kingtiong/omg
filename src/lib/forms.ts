import { z, type ZodTypeAny } from "zod";

export type FieldErrors = Record<string, string[] | undefined>;

export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

export function parseForm<T extends ZodTypeAny>(
  schema: T,
  formData: FormData
): { success: true; data: z.infer<T> } | { success: false; result: ActionResult } {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of formData.entries()) {
    if (k.startsWith("$ACTION_")) continue; // strip Next.js server action metadata
    if (typeof v === "string") {
      // checkbox-style "on" → true
      if (v === "on") obj[k] = true;
      else if (v === "") obj[k] = undefined;
      else obj[k] = v;
    } else {
      obj[k] = v;
    }
  }
  const r = schema.safeParse(obj);
  if (!r.success) {
    return {
      success: false,
      result: {
        ok: false,
        error: "Please check the highlighted fields.",
        fieldErrors: r.error.flatten().fieldErrors as FieldErrors,
      },
    };
  }
  return { success: true, data: r.data };
}

export function fieldError(fieldErrors: FieldErrors | undefined, field: string): string | undefined {
  return fieldErrors?.[field]?.[0];
}
