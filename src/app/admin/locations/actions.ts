"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { locationSchema } from "@/lib/schemas/location";
import { parseForm, type ActionResult } from "@/lib/forms";
import { Prisma } from "@prisma/client";

export async function createLocation(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(locationSchema, formData);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;
  try {
    if (d.isDefault) {
      await prisma.location.updateMany({ data: { isDefault: false } });
    }
    await prisma.location.create({ data: { code: d.code, name: d.name, isDefault: d.isDefault } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "A location with that code already exists." };
    }
    throw e;
  }
  revalidatePath("/admin/locations");
  redirect("/admin/locations");
}
