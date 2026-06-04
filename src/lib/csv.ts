// Minimal RFC 4180-ish CSV parser. Handles quoted fields with commas, escaped quotes,
// CRLF or LF line endings, and trims surrounding whitespace.
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  // Strip BOM if present
  if (text.charCodeAt(0) === 0xfeff) i = 1;

  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\n" || c === "\r") {
      row.push(field);
      field = "";
      // Skip CRLF
      if (c === "\r" && text[i + 1] === "\n") i++;
      // Skip blank rows
      if (row.length > 1 || (row.length === 1 && row[0].trim() !== "")) {
        rows.push(row);
      }
      row = [];
      i++;
      continue;
    }
    field += c;
    i++;
  }
  // Tail
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.length > 1 || (row.length === 1 && row[0].trim() !== "")) {
      rows.push(row);
    }
  }

  return rows.map((r) => r.map((cell) => cell.trim()));
}

export function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}
