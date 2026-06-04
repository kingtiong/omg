import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const palette = {
  ink: "#1a1a1f",
  inkDim: "#555560",
  inkMuted: "#888894",
  gold: "#a8841e",
  goldDeep: "#7a5e15",
  line: "#dfd9c8",
  panel: "#f7f4eb",
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    color: palette.ink,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
  },
  brand: {
    fontSize: 24,
    fontFamily: "Times-Roman",
    letterSpacing: 4,
    color: palette.goldDeep,
    fontWeight: 700,
  },
  brandSub: { fontSize: 8, letterSpacing: 3, marginTop: 2, color: palette.inkMuted },
  invoiceMeta: { fontSize: 9, textAlign: "right" },
  invoiceMetaLabel: { color: palette.inkMuted, fontSize: 7, letterSpacing: 1.5, textTransform: "uppercase" },
  invoiceMetaValue: { fontSize: 11, marginTop: 2, marginBottom: 8, color: palette.ink, fontFamily: "Courier" },
  twoCol: { flexDirection: "row", gap: 24, marginBottom: 24 },
  col: { flex: 1 },
  sectionLabel: {
    fontSize: 7,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: palette.gold,
    marginBottom: 6,
  },
  sectionBody: { fontSize: 10, color: palette.inkDim, lineHeight: 1.4 },
  sectionStrong: { fontSize: 11, color: palette.ink, marginBottom: 2 },
  table: { borderWidth: 1, borderColor: palette.line, marginBottom: 16 },
  thead: { flexDirection: "row", backgroundColor: palette.panel, borderBottomWidth: 1, borderColor: palette.line },
  th: { padding: 8, fontSize: 8, textTransform: "uppercase", letterSpacing: 1.2, color: palette.inkMuted },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderColor: palette.line },
  td: { padding: 8, fontSize: 9, color: palette.ink },
  totals: { marginLeft: "auto", width: 240, marginTop: 4 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderColor: palette.line,
  },
  totalRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderColor: palette.gold,
  },
  totalLabel: { fontSize: 9, color: palette.inkDim },
  totalValue: { fontSize: 10, color: palette.ink, fontFamily: "Courier" },
  totalValueBig: { fontSize: 13, color: palette.ink, fontFamily: "Courier", fontWeight: 700 },
  footer: {
    marginTop: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: palette.line,
    fontSize: 8,
    color: palette.inkMuted,
    textAlign: "center",
  },
});

export interface InvoicePdfProps {
  invoice: {
    number: string;
    issueDate: Date;
    dueDate: Date;
    subtotal: number;
    taxTotal: number;
    total: number;
    notes?: string | null;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      sstRate: number;
      lineTotal: number;
    }>;
  };
  customer: {
    name: string;
    code: string;
    address?: string | null;
    contactName?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  company: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    sstRegistered: boolean;
  };
}

const fmt = (n: number) => `RM ${n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d: Date) => {
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
};

export function InvoicePdfDoc({ invoice, customer, company }: InvoicePdfProps) {
  return (
    <Document title={`Invoice ${invoice.number}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>OMG</Text>
            <Text style={styles.brandSub}>SPARE PARTS · TAX INVOICE</Text>
            <View style={{ marginTop: 12 }}>
              <Text style={styles.sectionStrong}>{company.name}</Text>
              {company.address && <Text style={styles.sectionBody}>{company.address}</Text>}
              {company.phone && <Text style={styles.sectionBody}>Tel: {company.phone}</Text>}
              {company.email && <Text style={styles.sectionBody}>{company.email}</Text>}
            </View>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceMetaLabel}>Invoice #</Text>
            <Text style={styles.invoiceMetaValue}>{invoice.number}</Text>
            <Text style={styles.invoiceMetaLabel}>Issued</Text>
            <Text style={styles.invoiceMetaValue}>{fmtDate(invoice.issueDate)}</Text>
            <Text style={styles.invoiceMetaLabel}>Due</Text>
            <Text style={styles.invoiceMetaValue}>{fmtDate(invoice.dueDate)}</Text>
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>Bill to</Text>
            <Text style={styles.sectionStrong}>{customer.name}</Text>
            <Text style={styles.sectionBody}>{customer.code}</Text>
            {customer.contactName && <Text style={styles.sectionBody}>{customer.contactName}</Text>}
            {customer.address && <Text style={styles.sectionBody}>{customer.address}</Text>}
            {customer.phone && <Text style={styles.sectionBody}>{customer.phone}</Text>}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.thead}>
            <Text style={[styles.th, { flex: 4 }]}>Description</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>Qty</Text>
            <Text style={[styles.th, { flex: 1.5, textAlign: "right" }]}>Unit</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>SST</Text>
            <Text style={[styles.th, { flex: 1.5, textAlign: "right" }]}>Total</Text>
          </View>
          {invoice.items.map((it, i) => (
            <View key={i} style={styles.tr}>
              <Text style={[styles.td, { flex: 4 }]}>{it.description}</Text>
              <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>{it.quantity}</Text>
              <Text style={[styles.td, { flex: 1.5, textAlign: "right" }]}>{fmt(it.unitPrice)}</Text>
              <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>{it.sstRate.toFixed(2)}%</Text>
              <Text style={[styles.td, { flex: 1.5, textAlign: "right" }]}>{fmt(it.lineTotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{fmt(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>SST</Text>
            <Text style={styles.totalValue}>{fmt(invoice.taxTotal)}</Text>
          </View>
          <View style={styles.totalRowLast}>
            <Text style={[styles.totalLabel, { fontSize: 11 }]}>Total due</Text>
            <Text style={styles.totalValueBig}>{fmt(invoice.total)}</Text>
          </View>
        </View>

        {!company.sstRegistered && (
          <Text style={[styles.sectionBody, { marginTop: 18, fontSize: 8 }]}>
            * OMG is not currently SST-registered. Sales tax is not charged on this invoice.
          </Text>
        )}

        {invoice.notes && (
          <View style={{ marginTop: 18 }}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text style={styles.sectionBody}>{invoice.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Thank you for your business. Please remit payment by the due date to avoid service interruption.
        </Text>
      </Page>
    </Document>
  );
}
