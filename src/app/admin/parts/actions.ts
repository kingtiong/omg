"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { partSchema } from "@/lib/schemas/part";
import { parseForm, type ActionResult } from "@/lib/forms";
import { Prisma } from "@prisma/client";
import { parseCSV, normalizeHeader } from "@/lib/csv";
import { z } from "zod";

async function upsertCategoryByName(name?: string) {
  if (!name || !name.trim()) return null;
  const c = await prisma.partCategory.upsert({
    where: { name: name.trim() },
    update: {},
    create: { name: name.trim() },
  });
  return c.id;
}

async function upsertBrandByName(name?: string) {
  if (!name || !name.trim()) return null;
  const b = await prisma.brand.upsert({
    where: { name: name.trim() },
    update: {},
    create: { name: name.trim() },
  });
  return b.id;
}

export async function createPart(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(partSchema, formData);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;

  const categoryName = String(formData.get("categoryName") ?? "");
  const brandName = String(formData.get("brandName") ?? "");

  try {
    const categoryId = categoryName ? await upsertCategoryByName(categoryName) : d.categoryId || null;
    const brandId = brandName ? await upsertBrandByName(brandName) : d.brandId || null;

    await prisma.part.create({
      data: {
        sku: d.sku,
        partNumber: d.partNumber,
        name: d.name,
        description: d.description || null,
        barcode: d.barcode || null,
        categoryId: categoryId || null,
        brandId: brandId || null,
        primarySupplierId: d.primarySupplierId || null,
        costPrice: d.costPrice,
        sellPrice: d.sellPrice,
        minStock: d.minStock,
        reorderQty: d.reorderQty,
        leadTimeDays: d.leadTimeDays,
        sstRate: d.sstRate ?? null,
        active: d.active,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "A part with that SKU already exists." };
    }
    throw e;
  }
  revalidatePath("/admin/parts");
  redirect("/admin/parts");
}

export async function updatePart(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(partSchema, formData);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;

  const categoryName = String(formData.get("categoryName") ?? "");
  const brandName = String(formData.get("brandName") ?? "");

  try {
    const categoryId = categoryName ? await upsertCategoryByName(categoryName) : d.categoryId || null;
    const brandId = brandName ? await upsertBrandByName(brandName) : d.brandId || null;

    await prisma.part.update({
      where: { id },
      data: {
        sku: d.sku,
        partNumber: d.partNumber,
        name: d.name,
        description: d.description || null,
        barcode: d.barcode || null,
        categoryId: categoryId || null,
        brandId: brandId || null,
        primarySupplierId: d.primarySupplierId || null,
        costPrice: d.costPrice,
        sellPrice: d.sellPrice,
        minStock: d.minStock,
        reorderQty: d.reorderQty,
        leadTimeDays: d.leadTimeDays,
        sstRate: d.sstRate ?? null,
        active: d.active,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "A part with that SKU already exists." };
    }
    throw e;
  }
  revalidatePath("/admin/parts");
  revalidatePath(`/admin/parts/${id}`);
  redirect("/admin/parts");
}

// CSV import — accepted columns (case-insensitive, snake-case-or-spaces):
//   sku, part_number, name, description, brand, category,
//   cost_price, sell_price, min_stock, reorder_qty, lead_time_days, barcode,
//   sst_rate, supplier_code (optional, references existing supplier by code), active
const importRowSchema = z.object({
  sku: z.string().trim().min(1),
  part_number: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().optional().or(z.literal("")),
  brand: z.string().trim().optional().or(z.literal("")),
  category: z.string().trim().optional().or(z.literal("")),
  cost_price: z.coerce.number().min(0).optional().default(0),
  sell_price: z.coerce.number().min(0).optional().default(0),
  min_stock: z.coerce.number().int().min(0).optional().default(0),
  reorder_qty: z.coerce.number().int().min(0).optional().default(0),
  lead_time_days: z.coerce.number().int().min(0).max(365).optional().default(7),
  barcode: z.string().trim().optional().or(z.literal("")),
  sst_rate: z.coerce.number().min(0).max(100).optional(),
  supplier_code: z.string().trim().optional().or(z.literal("")),
  active: z.coerce.boolean().optional().default(true),
});

export type PartImportResult =
  | { ok: true; summary?: { created: number; updated: number; rows: number; errors: Array<{ row: number; sku?: string; error: string }> } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function importPartsCSV(_prev: PartImportResult, formData: FormData): Promise<PartImportResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please upload a CSV file." };
  }
  const text = await file.text();
  const rows = parseCSV(text);
  if (rows.length < 2) {
    return { ok: false, error: "CSV must include a header row and at least one data row." };
  }
  const headers = rows[0].map(normalizeHeader);
  const dataRows = rows.slice(1);

  const errors: Array<{ row: number; sku?: string; error: string }> = [];
  let created = 0;
  let updated = 0;

  // Cache supplier lookups by code
  const supplierCodes = new Set<string>();
  for (const row of dataRows) {
    const obj = Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""]));
    if (obj.supplier_code) supplierCodes.add(String(obj.supplier_code));
  }
  const suppliers = await prisma.supplier.findMany({
    where: { code: { in: Array.from(supplierCodes) } },
    select: { id: true, code: true },
  });
  const supplierByCode = new Map(suppliers.map((s) => [s.code, s.id]));

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const obj: Record<string, string> = Object.fromEntries(headers.map((h, j) => [h, row[j] ?? ""]));
    const parsed = importRowSchema.safeParse(obj);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      errors.push({ row: i + 2, sku: obj.sku, error: `${issue.path.join(".")}: ${issue.message}` });
      continue;
    }
    const d = parsed.data;
    try {
      const categoryId = d.category ? await upsertCategoryByName(d.category) : null;
      const brandId = d.brand ? await upsertBrandByName(d.brand) : null;
      const supplierId = d.supplier_code ? supplierByCode.get(d.supplier_code) ?? null : null;

      const data = {
        partNumber: d.part_number,
        name: d.name,
        description: d.description || null,
        barcode: d.barcode || null,
        categoryId,
        brandId,
        primarySupplierId: supplierId,
        costPrice: d.cost_price,
        sellPrice: d.sell_price,
        minStock: d.min_stock,
        reorderQty: d.reorder_qty,
        leadTimeDays: d.lead_time_days,
        sstRate: d.sst_rate ?? null,
        active: d.active,
      };

      const existing = await prisma.part.findUnique({ where: { sku: d.sku } });
      if (existing) {
        await prisma.part.update({ where: { id: existing.id }, data });
        updated++;
      } else {
        await prisma.part.create({ data: { sku: d.sku, ...data } });
        created++;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      errors.push({ row: i + 2, sku: d.sku, error: msg });
    }
  }

  revalidatePath("/admin/parts");
  return { ok: true, summary: { created, updated, rows: dataRows.length, errors } };
}
