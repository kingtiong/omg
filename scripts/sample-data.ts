/**
 * OMG — sample data loader
 * Idempotent. Safe to re-run (uses upsert on natural keys).
 *
 *   npx tsx scripts/sample-data.ts
 *
 * Adds:
 *   - 8 suppliers, 9 customer service centres
 *   - 8 categories, 10 brands
 *   - ~60 parts across all categories
 *   - Inventory at MAIN with mix of healthy / low / out-of-stock
 *   - ~25 sales orders spread across the last 90 days, mix of statuses
 *   - Invoices + deliveries auto-created for confirmed/delivered orders
 *   - Payments applied to ~half the invoices (some paid, some partial, some untouched)
 *   - 4 sample contact requests
 */

import { PrismaClient, type Prisma, type SalesOrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

// ---------- helpers ----------------------------------------------------------

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function daysAgo(d: number): Date {
  const x = new Date();
  x.setDate(x.getDate() - d);
  return x;
}

// Reset cached number sequences inside this script to avoid races
async function nextNumber(prefix: string, where: { startsWith: string }, model: keyof PrismaClient) {
  const m = prisma[model] as unknown as { count: (a: { where: Record<string, unknown> }) => Promise<number> };
  const numField = prefix.includes("PMT") ? "reference" : "number";
  const c = await m.count({ where: { [numField]: where } });
  return `${where.startsWith}${String(c + 1).padStart(5, "0")}`;
}

async function nextSO() {
  const year = new Date().getFullYear();
  return nextNumber("OMG-SO-", { startsWith: `OMG-SO-${year}-` }, "salesOrder");
}
async function nextINV() {
  const year = new Date().getFullYear();
  return nextNumber("OMG-INV-", { startsWith: `OMG-INV-${year}-` }, "invoice");
}
async function nextDEL() {
  const year = new Date().getFullYear();
  return nextNumber("OMG-DEL-", { startsWith: `OMG-DEL-${year}-` }, "delivery");
}
async function nextPMT() {
  const year = new Date().getFullYear();
  return nextNumber("OMG-PMT-", { startsWith: `OMG-PMT-${year}-` }, "payment");
}

// ---------- master data ------------------------------------------------------

const SUPPLIERS = [
  { code: "SUP-1001", name: "Bosch Malaysia Sdn Bhd", contactName: "Lim Wei Sheng", email: "trade@bosch.com.my", phone: "+60 3 7965 6300", address: "PJ Trade Centre, Petaling Jaya", paymentTermsDays: 30 },
  { code: "SUP-1002", name: "Mann+Hummel SEA", contactName: "Ahmad Razif", email: "orders@mann-sea.com", phone: "+60 3 7842 1100", address: "Shah Alam, Selangor", paymentTermsDays: 45 },
  { code: "SUP-1003", name: "NGK Asia Pacific", contactName: "Tan Hui Ming", email: "ap@ngk.com.my", phone: "+60 3 5621 8800", address: "Subang Hi-Tech Park", paymentTermsDays: 30 },
  { code: "SUP-1004", name: "Denso Malaysia", contactName: "Vikram Singh", email: "trade@denso.com.my", phone: "+60 3 5512 4500", address: "Bukit Beruntung Industrial Area", paymentTermsDays: 30 },
  { code: "SUP-1005", name: "Brembo Asia", contactName: "Yap Chee Keong", email: "asia@brembo.com", phone: "+60 3 8943 2200", address: "Cyberjaya, Selangor", paymentTermsDays: 60 },
  { code: "SUP-1006", name: "Shell Lubricants Malaysia", contactName: "Rajesh Kumar", email: "lubes@shell.com.my", phone: "+60 3 2056 1100", address: "KL Sentral", paymentTermsDays: 30 },
  { code: "SUP-1007", name: "ACDelco Distribution Asia", contactName: "Christine Chong", email: "ad-asia@gm.com", phone: "+60 3 7724 9900", address: "Kepong, Kuala Lumpur", paymentTermsDays: 30 },
  { code: "SUP-1008", name: "Exide Energy SEA", contactName: "Mohd Hafiz", email: "asean@exide.com", phone: "+60 3 8021 3300", address: "Putrajaya South", paymentTermsDays: 45 },
];

const CUSTOMERS = [
  { code: "CUST-1001", name: "AutoFix Sdn Bhd",            contactName: "Encik Faizal",      phone: "+60 12 234 5601", email: "ops@autofix.my",       address: "12 Jalan Maju, Petaling Jaya, 47300 Selangor", paymentTermsDays: 30, creditLimit: 15000 },
  { code: "CUST-1002", name: "KL Motor Workshop",          contactName: "Mr. Tan",            phone: "+60 12 345 6712", email: "tan@klmotor.my",       address: "88 Jalan Ipoh, 51200 KL",                       paymentTermsDays: 30, creditLimit: 25000 },
  { code: "CUST-1003", name: "Selangor Auto Service",      contactName: "Cikgu Hassan",       phone: "+60 19 678 1234", email: "hassan@selangoras.my", address: "Lot 22, Kawasan Industri, 40150 Shah Alam",     paymentTermsDays: 30, creditLimit: 10000 },
  { code: "CUST-1004", name: "Penang Premier Garage",      contactName: "Lee Chong Wei",      phone: "+60 14 222 8800", email: "info@penangpremier.my",address: "33 Lebuh Tenggiri, 11700 Bayan Lepas, Penang",  paymentTermsDays: 45, creditLimit: 20000 },
  { code: "CUST-1005", name: "JB Speedway Auto",           contactName: "Encik Razif",        phone: "+60 13 555 7700", email: "ops@jbspeedway.my",    address: "55 Jalan Tampoi, 80300 Johor Bahru",            paymentTermsDays: 30, creditLimit: 8000 },
  { code: "CUST-1006", name: "Genting Auto Care",          contactName: "Aunty Rose",         phone: "+60 12 901 2233", email: "rose@gentingauto.my",  address: "8 Jalan Genting Sempah, 27600 Bentong, Pahang", paymentTermsDays: 30, creditLimit: 12000 },
  { code: "CUST-1007", name: "Subang Service Centre",      contactName: "Mr. Chong",          phone: "+60 11 678 9900", email: "chong@subangsvc.my",   address: "USJ 1, 47500 Subang Jaya, Selangor",            paymentTermsDays: 30, creditLimit: 18000 },
  { code: "CUST-1008", name: "Cheras Master Mech",         contactName: "Pak Yusof",          phone: "+60 13 002 7711", email: "yusof@cherasmaster.my",address: "29 Jalan Cheras Heights, 56000 KL",             paymentTermsDays: 45, creditLimit: 30000 },
  { code: "CUST-1009", name: "Ipoh Highway Motors",        contactName: "Ms. Tan Yi Wei",     phone: "+60 16 442 8090", email: "yiwei@ipohhighway.my", address: "70 Jalan Sultan Iskandar, 30000 Ipoh, Perak",   paymentTermsDays: 30, creditLimit: 14000 },
];

const CATEGORIES = ["Brake systems", "Filtration", "Fluids & oils", "Electrical", "Engine", "Suspension", "Exhaust", "Transmission"];
const BRANDS = ["Bosch", "Mann-Filter", "NGK", "Denso", "Brembo", "Castrol", "Shell", "ACDelco", "Exide", "TRW"];

interface PartSeed {
  sku: string;
  partNumber: string;
  name: string;
  category: string;
  brand: string;
  supplierCode?: string;
  costPrice: number;
  sellPrice: number;
  minStock: number;
  reorderQty: number;
  leadTimeDays: number;
  crossRefs?: string[];
}

const PARTS: PartSeed[] = [
  // Brake systems
  { sku: "OMG-BR-001", partNumber: "BP-1234",   name: "Front brake pad set — Proton Saga",        category: "Brake systems", brand: "Brembo",  supplierCode: "SUP-1005", costPrice: 65,  sellPrice: 119, minStock: 8,  reorderQty: 30, leadTimeDays: 14, crossRefs: ["P83045", "GDB1330"] },
  { sku: "OMG-BR-002", partNumber: "BP-2210",   name: "Front brake pad set — Perodua Myvi",       category: "Brake systems", brand: "TRW",     supplierCode: "SUP-1005", costPrice: 58,  sellPrice: 108, minStock: 10, reorderQty: 40, leadTimeDays: 7,  crossRefs: ["GDB7625"] },
  { sku: "OMG-BR-003", partNumber: "BP-3105",   name: "Rear brake pad set — Honda City",          category: "Brake systems", brand: "Bosch",   supplierCode: "SUP-1001", costPrice: 72,  sellPrice: 132, minStock: 6,  reorderQty: 24, leadTimeDays: 10 },
  { sku: "OMG-BR-004", partNumber: "BD-4501",   name: "Front brake disc 256mm — Toyota Vios",     category: "Brake systems", brand: "Brembo",  supplierCode: "SUP-1005", costPrice: 110, sellPrice: 195, minStock: 4,  reorderQty: 12, leadTimeDays: 14 },
  { sku: "OMG-BR-005", partNumber: "BD-4615",   name: "Rear brake disc 270mm — Honda CR-V",       category: "Brake systems", brand: "TRW",     supplierCode: "SUP-1005", costPrice: 145, sellPrice: 245, minStock: 4,  reorderQty: 10, leadTimeDays: 14 },
  { sku: "OMG-BR-006", partNumber: "BC-9001",   name: "Brake caliper rebuild kit — universal",    category: "Brake systems", brand: "Bosch",   supplierCode: "SUP-1001", costPrice: 28,  sellPrice: 55,  minStock: 6,  reorderQty: 20, leadTimeDays: 10 },

  // Filtration
  { sku: "OMG-FT-001", partNumber: "OF-1011",   name: "Oil filter — Proton/Perodua 1.3-1.5",      category: "Filtration",    brand: "Mann-Filter", supplierCode: "SUP-1002", costPrice: 12, sellPrice: 24, minStock: 30, reorderQty: 100, leadTimeDays: 7,  crossRefs: ["W811/80", "MD-360935"] },
  { sku: "OMG-FT-002", partNumber: "OF-1052",   name: "Oil filter — Honda 1.5-1.8",                category: "Filtration",    brand: "Mann-Filter", supplierCode: "SUP-1002", costPrice: 14, sellPrice: 28, minStock: 25, reorderQty: 100, leadTimeDays: 7 },
  { sku: "OMG-FT-003", partNumber: "OF-1090",   name: "Oil filter — Toyota 1.8-2.5",               category: "Filtration",    brand: "Bosch",   supplierCode: "SUP-1001", costPrice: 13, sellPrice: 26, minStock: 25, reorderQty: 100, leadTimeDays: 5  },
  { sku: "OMG-FT-004", partNumber: "AF-2010",   name: "Air filter — Proton Saga/Persona",          category: "Filtration",    brand: "Mann-Filter", supplierCode: "SUP-1002", costPrice: 18, sellPrice: 38, minStock: 15, reorderQty: 40,  leadTimeDays: 7  },
  { sku: "OMG-FT-005", partNumber: "AF-2055",   name: "Air filter — Toyota Hilux 2.4 Diesel",      category: "Filtration",    brand: "Mann-Filter", supplierCode: "SUP-1002", costPrice: 36, sellPrice: 75, minStock: 8,  reorderQty: 24,  leadTimeDays: 10 },
  { sku: "OMG-FT-006", partNumber: "FF-3001",   name: "Fuel filter — Perodua Bezza 1.3",           category: "Filtration",    brand: "Bosch",   supplierCode: "SUP-1001", costPrice: 22, sellPrice: 48, minStock: 12, reorderQty: 36, leadTimeDays: 7 },
  { sku: "OMG-FT-007", partNumber: "CF-4010",   name: "Cabin filter — Honda CR-V 2018+",           category: "Filtration",    brand: "Mann-Filter", supplierCode: "SUP-1002", costPrice: 16, sellPrice: 35, minStock: 10, reorderQty: 30, leadTimeDays: 7  },

  // Fluids & oils
  { sku: "OMG-OL-001", partNumber: "EO-5W30-4L",name: "Shell Helix HX7 5W-30 4L",                  category: "Fluids & oils", brand: "Shell",   supplierCode: "SUP-1006", costPrice: 95,  sellPrice: 168, minStock: 20, reorderQty: 60, leadTimeDays: 5 },
  { sku: "OMG-OL-002", partNumber: "EO-0W20-4L",name: "Shell Helix Ultra 0W-20 4L",                category: "Fluids & oils", brand: "Shell",   supplierCode: "SUP-1006", costPrice: 145, sellPrice: 235, minStock: 15, reorderQty: 40, leadTimeDays: 5 },
  { sku: "OMG-OL-003", partNumber: "ATF-D3-4L", name: "Castrol ATF Dexron III 4L",                 category: "Fluids & oils", brand: "Castrol", supplierCode: "SUP-1006", costPrice: 95,  sellPrice: 162, minStock: 12, reorderQty: 36, leadTimeDays: 7 },
  { sku: "OMG-OL-004", partNumber: "BF-DOT4-1L",name: "Brake fluid DOT 4, 1 L",                    category: "Fluids & oils", brand: "Bosch",   supplierCode: "SUP-1001", costPrice: 18,  sellPrice: 36,  minStock: 30, reorderQty: 80, leadTimeDays: 5 },
  { sku: "OMG-OL-005", partNumber: "CL-LL-5L",  name: "Long-life coolant concentrate 5 L",         category: "Fluids & oils", brand: "Castrol", supplierCode: "SUP-1006", costPrice: 48,  sellPrice: 92,  minStock: 18, reorderQty: 50, leadTimeDays: 7 },

  // Electrical
  { sku: "OMG-EL-001", partNumber: "BAT-NS40Z", name: "Car battery NS40Z 12V 40Ah",                category: "Electrical",    brand: "Exide",   supplierCode: "SUP-1008", costPrice: 165, sellPrice: 285, minStock: 8,  reorderQty: 24, leadTimeDays: 10 },
  { sku: "OMG-EL-002", partNumber: "BAT-NS60",  name: "Car battery NS60 12V 45Ah",                 category: "Electrical",    brand: "Exide",   supplierCode: "SUP-1008", costPrice: 195, sellPrice: 339, minStock: 6,  reorderQty: 18, leadTimeDays: 10 },
  { sku: "OMG-EL-003", partNumber: "BAT-DIN66", name: "Car battery DIN66 12V 66Ah",                category: "Electrical",    brand: "Exide",   supplierCode: "SUP-1008", costPrice: 290, sellPrice: 449, minStock: 4,  reorderQty: 12, leadTimeDays: 14 },
  { sku: "OMG-EL-004", partNumber: "SP-IRIDIUM",name: "Spark plug iridium (each) — universal",     category: "Electrical",    brand: "NGK",     supplierCode: "SUP-1003", costPrice: 18,  sellPrice: 38,  minStock: 60, reorderQty: 200, leadTimeDays: 7, crossRefs: ["IZFR6K-11", "IK20"] },
  { sku: "OMG-EL-005", partNumber: "SP-PLATIN", name: "Spark plug platinum (each) — universal",    category: "Electrical",    brand: "NGK",     supplierCode: "SUP-1003", costPrice: 12,  sellPrice: 28,  minStock: 80, reorderQty: 240, leadTimeDays: 7 },
  { sku: "OMG-EL-006", partNumber: "ALT-12V90", name: "Alternator 12V 90A — Honda Civic",          category: "Electrical",    brand: "Denso",   supplierCode: "SUP-1004", costPrice: 320, sellPrice: 545, minStock: 2,  reorderQty: 6,  leadTimeDays: 14 },
  { sku: "OMG-EL-007", partNumber: "STA-1.4KW", name: "Starter motor 1.4 kW — Toyota Vios",        category: "Electrical",    brand: "Denso",   supplierCode: "SUP-1004", costPrice: 285, sellPrice: 489, minStock: 3,  reorderQty: 6,  leadTimeDays: 14 },
  { sku: "OMG-EL-008", partNumber: "O2-UNIV4",  name: "Oxygen sensor universal 4-wire",            category: "Electrical",    brand: "Bosch",   supplierCode: "SUP-1001", costPrice: 95,  sellPrice: 168, minStock: 6,  reorderQty: 20, leadTimeDays: 10 },

  // Engine
  { sku: "OMG-EN-001", partNumber: "TB-PROTON", name: "Timing belt — Proton 1.6 Campro",           category: "Engine",        brand: "Bosch",   supplierCode: "SUP-1001", costPrice: 78, sellPrice: 142, minStock: 6, reorderQty: 18, leadTimeDays: 14 },
  { sku: "OMG-EN-002", partNumber: "TB-HONDA",  name: "Timing belt — Honda 2.0 K20",               category: "Engine",        brand: "Bosch",   supplierCode: "SUP-1001", costPrice: 92, sellPrice: 165, minStock: 4, reorderQty: 12, leadTimeDays: 14 },
  { sku: "OMG-EN-003", partNumber: "DB-VBELT",  name: "V-belt set — universal 6PK",                category: "Engine",        brand: "Bosch",   supplierCode: "SUP-1001", costPrice: 32, sellPrice: 65,  minStock: 12, reorderQty: 36, leadTimeDays: 7 },
  { sku: "OMG-EN-004", partNumber: "GK-HEAD",   name: "Head gasket — Toyota 2NZ-FE 1.3",           category: "Engine",        brand: "Denso",   supplierCode: "SUP-1004", costPrice: 145, sellPrice: 245, minStock: 3, reorderQty: 8,  leadTimeDays: 21 },
  { sku: "OMG-EN-005", partNumber: "WP-MYVI",   name: "Water pump — Perodua Myvi 1.3",             category: "Engine",        brand: "Mann-Filter", supplierCode: "SUP-1002", costPrice: 78, sellPrice: 138, minStock: 5, reorderQty: 12, leadTimeDays: 14 },

  // Suspension
  { sku: "OMG-SU-001", partNumber: "SH-FR-MYVI",name: "Front shock absorber — Perodua Myvi (pair)",category: "Suspension",    brand: "TRW",     supplierCode: "SUP-1005", costPrice: 195, sellPrice: 345, minStock: 4, reorderQty: 10, leadTimeDays: 14 },
  { sku: "OMG-SU-002", partNumber: "SH-RR-CITY",name: "Rear shock absorber — Honda City (pair)",   category: "Suspension",    brand: "Bosch",   supplierCode: "SUP-1001", costPrice: 215, sellPrice: 379, minStock: 3, reorderQty: 8,  leadTimeDays: 14 },
  { sku: "OMG-SU-003", partNumber: "BU-LCA",    name: "Lower control arm bush — universal",        category: "Suspension",    brand: "TRW",     supplierCode: "SUP-1005", costPrice: 38,  sellPrice: 78,  minStock: 10, reorderQty: 30, leadTimeDays: 10 },
  { sku: "OMG-SU-004", partNumber: "EM-VIOS",   name: "Engine mount — Toyota Vios 1.5",            category: "Suspension",    brand: "ACDelco", supplierCode: "SUP-1007", costPrice: 88,  sellPrice: 162, minStock: 5,  reorderQty: 12, leadTimeDays: 14 },
  { sku: "OMG-SU-005", partNumber: "TR-BJ-CIVIC",name: "Tie rod ball joint — Honda Civic",         category: "Suspension",    brand: "TRW",     supplierCode: "SUP-1005", costPrice: 65,  sellPrice: 118, minStock: 8,  reorderQty: 24, leadTimeDays: 10 },

  // Exhaust
  { sku: "OMG-EX-001", partNumber: "MF-MYVI",   name: "Muffler assembly — Perodua Myvi",           category: "Exhaust",       brand: "ACDelco", supplierCode: "SUP-1007", costPrice: 195, sellPrice: 339, minStock: 3, reorderQty: 8,  leadTimeDays: 21 },
  { sku: "OMG-EX-002", partNumber: "MF-VIOS",   name: "Muffler assembly — Toyota Vios",            category: "Exhaust",       brand: "ACDelco", supplierCode: "SUP-1007", costPrice: 245, sellPrice: 419, minStock: 2, reorderQty: 6,  leadTimeDays: 21 },
  { sku: "OMG-EX-003", partNumber: "EX-MAN-GK", name: "Exhaust manifold gasket — universal",       category: "Exhaust",       brand: "Bosch",   supplierCode: "SUP-1001", costPrice: 22, sellPrice: 48,  minStock: 15, reorderQty: 50, leadTimeDays: 7 },

  // Transmission
  { sku: "OMG-TR-001", partNumber: "CL-KIT-MYVI",name: "Clutch kit — Perodua Myvi 1.3",            category: "Transmission",  brand: "ACDelco", supplierCode: "SUP-1007", costPrice: 285, sellPrice: 489, minStock: 3, reorderQty: 6, leadTimeDays: 14 },
  { sku: "OMG-TR-002", partNumber: "CL-KIT-CITY",name: "Clutch kit — Honda City 1.5",              category: "Transmission",  brand: "ACDelco", supplierCode: "SUP-1007", costPrice: 345, sellPrice: 595, minStock: 2, reorderQty: 6, leadTimeDays: 14 },
  { sku: "OMG-TR-003", partNumber: "ATF-CVT-4L",name: "CVT fluid — Honda HCF-2 4L",                category: "Transmission",  brand: "Castrol", supplierCode: "SUP-1006", costPrice: 145, sellPrice: 235, minStock: 8, reorderQty: 24, leadTimeDays: 7 },
  { sku: "OMG-TR-004", partNumber: "TM-GASKET",  name: "Transmission pan gasket — universal",       category: "Transmission",  brand: "Bosch",   supplierCode: "SUP-1001", costPrice: 25, sellPrice: 52, minStock: 10, reorderQty: 30, leadTimeDays: 7 },
];

const CONTACT_REQUESTS = [
  { name: "Kamarul Idris",   company: "KP Motorsport",        email: "kamarul@kpmotorsport.my", phone: "+60 12 980 4411", message: "Looking for stable supplier for brake pads + filters, ~80 sets/month.", status: "NEW" as const,       daysAgo: 1 },
  { name: "Lim Su Ann",       company: "Damansara Auto Hub",   email: "suann@damansaraauto.my",  phone: "+60 14 220 7700", message: "Need access to your CR-V parts catalog. Currently sourcing from KL Sentral.", status: "CONTACTED" as const, daysAgo: 4 },
  { name: "Vijay Anand",      company: "Klang Truck Service",  email: "vijay@klangtrucks.my",    phone: "+60 16 332 1199", message: "Heavy-duty brake systems, mostly for Hilux fleet.",                          status: "NEW" as const,       daysAgo: 9 },
  { name: "Aisyah Rahman",    company: "Putrajaya Premium Motors", email: "aisyah@putrajayaprem.my", phone: "+60 19 002 5566", message: "Servicing high-volume continental cars. Want to evaluate your portal.",  status: "CONVERTED" as const, daysAgo: 22 },
];

// ---------- main ------------------------------------------------------------

async function main() {
  console.log("Loading sample data — this is idempotent.");

  // Make sure default settings + MAIN location exist (in case full seed wasn't run)
  await prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1, companyName: "OMG", defaultSstRate: 0 } });
  const mainLoc = await prisma.location.upsert({
    where: { code: "MAIN" },
    update: {},
    create: { code: "MAIN", name: "Main Warehouse", isDefault: true },
  });

  // Suppliers
  for (const s of SUPPLIERS) {
    await prisma.supplier.upsert({
      where: { code: s.code },
      update: s,
      create: s,
    });
  }
  console.log(`  ${SUPPLIERS.length} suppliers`);

  // Customers
  for (const c of CUSTOMERS) {
    await prisma.customer.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }
  console.log(`  ${CUSTOMERS.length} customers`);

  // Categories + brands
  const catMap = new Map<string, string>();
  for (const name of CATEGORIES) {
    const c = await prisma.partCategory.upsert({ where: { name }, update: {}, create: { name } });
    catMap.set(name, c.id);
  }
  const brandMap = new Map<string, string>();
  for (const name of BRANDS) {
    const b = await prisma.brand.upsert({ where: { name }, update: {}, create: { name } });
    brandMap.set(name, b.id);
  }
  console.log(`  ${CATEGORIES.length} categories, ${BRANDS.length} brands`);

  // Suppliers map by code
  const supplierByCode = new Map(
    (await prisma.supplier.findMany({ select: { id: true, code: true } })).map((s) => [s.code, s.id] as const)
  );

  // Parts (upsert by sku) + cross-references + inventory
  for (const p of PARTS) {
    const part = await prisma.part.upsert({
      where: { sku: p.sku },
      update: {
        partNumber: p.partNumber,
        name: p.name,
        categoryId: catMap.get(p.category),
        brandId: brandMap.get(p.brand),
        primarySupplierId: p.supplierCode ? supplierByCode.get(p.supplierCode) : null,
        costPrice: p.costPrice,
        sellPrice: p.sellPrice,
        minStock: p.minStock,
        reorderQty: p.reorderQty,
        leadTimeDays: p.leadTimeDays,
      },
      create: {
        sku: p.sku,
        partNumber: p.partNumber,
        name: p.name,
        categoryId: catMap.get(p.category),
        brandId: brandMap.get(p.brand),
        primarySupplierId: p.supplierCode ? supplierByCode.get(p.supplierCode) : null,
        costPrice: p.costPrice,
        sellPrice: p.sellPrice,
        minStock: p.minStock,
        reorderQty: p.reorderQty,
        leadTimeDays: p.leadTimeDays,
      },
    });

    if (p.crossRefs && p.crossRefs.length) {
      for (const ref of p.crossRefs) {
        await prisma.partCrossReference.upsert({
          where: { partId_partNumber: { partId: part.id, partNumber: ref } },
          update: {},
          create: { partId: part.id, partNumber: ref },
        });
      }
    }

    // Inventory: mostly healthy, ~15% low, ~5% out, others around 2-4× minStock
    const r = Math.random();
    let qty: number;
    if (r < 0.05) qty = 0;
    else if (r < 0.20) qty = Math.max(0, p.minStock - randInt(1, p.minStock || 3));
    else qty = p.minStock * randInt(2, 5);

    await prisma.inventory.upsert({
      where: { partId_locationId: { partId: part.id, locationId: mainLoc.id } },
      update: { quantity: qty, reserved: 0 },
      create: { partId: part.id, locationId: mainLoc.id, quantity: qty, reserved: 0 },
    });
  }
  console.log(`  ${PARTS.length} parts + inventory at MAIN`);

  // ----- Sales orders --------------------------------------------------------
  // Skip if we already have plenty of orders (avoid runaway re-runs)
  const existingOrderCount = await prisma.salesOrder.count();
  if (existingOrderCount >= 20) {
    console.log(`  ${existingOrderCount} sales orders already exist — skipping order generation`);
  } else {
    const customers = await prisma.customer.findMany({ where: { code: { startsWith: "CUST-" } } });
    const partsList = await prisma.part.findMany({ where: { sku: { startsWith: "OMG-" } } });

    const ORDERS_TO_CREATE = 25;
    let createdOrders = 0;

    for (let i = 0; i < ORDERS_TO_CREATE; i++) {
      const customer = pick(customers);
      const orderDate = daysAgo(randInt(1, 90));

      // 3-7 line items per order
      const lineCount = randInt(2, 6);
      const linePartIds = new Set<string>();
      while (linePartIds.size < lineCount) linePartIds.add(pick(partsList).id);

      const items = Array.from(linePartIds).map((id) => {
        const part = partsList.find((p) => p.id === id)!;
        const qty = randInt(1, 8);
        const unitPrice = Number(part.sellPrice);
        const unitCost = Number(part.costPrice);
        const sstRate = 0;
        const lineTotal = unitPrice * qty;
        return { partId: id, quantity: qty, unitPrice, unitCost, sstRate, lineTotal };
      });

      const subtotal = items.reduce((a, x) => a + x.lineTotal, 0);
      const total = subtotal;

      // Status distribution: 60% delivered, 15% dispatched, 10% confirmed, 10% pending, 5% cancelled
      const r = Math.random();
      let status: SalesOrderStatus;
      if (r < 0.6)       status = "DELIVERED";
      else if (r < 0.75) status = "DISPATCHED";
      else if (r < 0.85) status = "CONFIRMED";
      else if (r < 0.95) status = "PENDING";
      else               status = "CANCELLED";

      const number = await nextSO();
      const so = await prisma.salesOrder.create({
        data: {
          number,
          customerId: customer.id,
          status,
          orderDate,
          deliveryAddress: customer.address,
          subtotal,
          taxTotal: 0,
          total,
          items: { create: items },
        },
        include: { items: true },
      });

      // For non-pending/cancelled, create invoice + delivery
      if (status !== "PENDING" && status !== "CANCELLED") {
        const dueDate = new Date(orderDate);
        dueDate.setDate(dueDate.getDate() + customer.paymentTermsDays);

        const invNum = await nextINV();
        await prisma.invoice.create({
          data: {
            number: invNum,
            customerId: customer.id,
            salesOrderId: so.id,
            status: "UNPAID",
            issueDate: orderDate,
            dueDate,
            subtotal,
            taxTotal: 0,
            total,
            items: {
              create: so.items.map((it) => {
                const part = partsList.find((p) => p.id === it.partId)!;
                return {
                  partId: it.partId,
                  description: part.name,
                  quantity: it.quantity,
                  unitPrice: it.unitPrice,
                  sstRate: it.sstRate,
                  lineTotal: it.lineTotal,
                };
              }),
            },
          },
        });

        const delNum = await nextDEL();
        await prisma.delivery.create({
          data: {
            number: delNum,
            salesOrderId: so.id,
            status: status === "DELIVERED" ? "DELIVERED" : status === "DISPATCHED" ? "DISPATCHED" : "PENDING",
            dispatchedAt: status === "DISPATCHED" || status === "DELIVERED" ? new Date(orderDate.getTime() + 24 * 3600 * 1000) : null,
            deliveredAt: status === "DELIVERED" ? new Date(orderDate.getTime() + 48 * 3600 * 1000) : null,
            recipient: status === "DELIVERED" ? customer.contactName : null,
          },
        });

        // Stock movements + inventory decrement for delivered/dispatched
        if (status === "DELIVERED" || status === "DISPATCHED") {
          for (const it of so.items) {
            await prisma.stockMovement.create({
              data: {
                partId: it.partId,
                locationId: mainLoc.id,
                type: "SHIPMENT",
                quantity: -it.quantity,
                refType: "SALES_ORDER",
                refId: so.id,
                notes: `Sample shipment for ${so.number}`,
                createdAt: orderDate,
              },
            });
            // Don't decrement inventory in seed — leave stock realistic, but add a tiny touch for delivered
            if (status === "DELIVERED") {
              await prisma.inventory.update({
                where: { partId_locationId: { partId: it.partId, locationId: mainLoc.id } },
                data: { quantity: { decrement: Math.min(it.quantity, 1) } },
              });
            }
          }
        }
      }
      createdOrders++;
    }
    console.log(`  ${createdOrders} sales orders + invoices + deliveries`);
  }

  // ----- Payments ------------------------------------------------------------
  const existingPmts = await prisma.payment.count();
  if (existingPmts >= 10) {
    console.log(`  ${existingPmts} payments already exist — skipping`);
  } else {
    const openInvoices = await prisma.invoice.findMany({
      where: { status: { in: ["UNPAID", "PARTIAL"] } },
      orderBy: { issueDate: "desc" },
    });

    let createdPmts = 0;
    for (const inv of openInvoices) {
      // Pay only ~60% of invoices
      if (Math.random() > 0.6) continue;

      const total = Number(inv.total);
      const isFull = Math.random() > 0.3; // 70% of paying customers pay in full
      const amount = isFull ? total : Math.round(total * (0.3 + Math.random() * 0.4) * 100) / 100;
      const reference = await nextPMT();

      await prisma.payment.create({
        data: {
          reference,
          customerId: inv.customerId,
          amount,
          method: pick(["BANK_TRANSFER", "BANK_TRANSFER", "CASH", "CHEQUE", "ONLINE"] as const),
          receivedAt: new Date(inv.issueDate.getTime() + randInt(1, 25) * 24 * 3600 * 1000),
          notes: pick(["Bank Maybank ref ABC", "FPX online", "Cash settlement", "Cheque drawn on CIMB", null]),
          applications: { create: { invoiceId: inv.id, amount } },
        },
      });

      const newPaid = Number(inv.amountPaid) + amount;
      await prisma.invoice.update({
        where: { id: inv.id },
        data: {
          amountPaid: newPaid,
          status: newPaid >= total - 0.001 ? "PAID" : "PARTIAL",
        },
      });
      createdPmts++;
    }
    console.log(`  ${createdPmts} payments recorded + applied`);
  }

  // ----- Contact requests ----------------------------------------------------
  const existingLeads = await prisma.contactRequest.count();
  if (existingLeads >= 4) {
    console.log(`  ${existingLeads} contact requests already exist — skipping`);
  } else {
    for (const lead of CONTACT_REQUESTS) {
      await prisma.contactRequest.create({
        data: {
          name: lead.name,
          company: lead.company,
          email: lead.email,
          phone: lead.phone,
          message: lead.message,
          source: "homepage",
          status: lead.status,
          createdAt: daysAgo(lead.daysAgo),
        },
      });
    }
    console.log(`  ${CONTACT_REQUESTS.length} contact requests`);
  }

  console.log("\nDone. Refresh https://xentioos.online/admin to see populated data.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
