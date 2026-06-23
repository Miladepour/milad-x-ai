export const SUBSCRIBER_CSV_HEADERS = [
  "email",
  "full_name",
  "locale",
  "source",
  "source_detail",
  "notes",
] as const;

export const LEAD_CSV_HEADERS = [
  "email",
  "full_name",
  "phone",
  "country",
  "locale",
  "source",
  "source_detail",
  "notes",
] as const;

export function subscriberCsvTemplate(): string {
  return [
    SUBSCRIBER_CSV_HEADERS.join(","),
    "jane@example.com,Jane Doe,EN,webinar,Free AI Webinar March 2026,",
  ].join("\n");
}

export function leadCsvTemplate(): string {
  return [
    LEAD_CSV_HEADERS.join(","),
    "ali@example.com,Ali Reza,+989121234567,IR,FA,webinar,Free AI Webinar March 2026,",
  ].join("\n");
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  cells.push(current.trim());
  return cells;
}

export function parseCsvRows(text: string): string[][] {
  return text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(parseCsvLine);
}

export function csvRowsToRecords(
  rows: string[][],
  expectedHeaders: readonly string[]
): { records: Record<string, string>[]; errors: string[] } {
  if (rows.length === 0) {
    return { records: [], errors: ["CSV file is empty"] };
  }

  const header = rows[0].map((cell) => cell.toLowerCase());
  const missing = expectedHeaders.filter((name) => !header.includes(name));
  if (missing.length > 0) {
    return {
      records: [],
      errors: [`Missing required columns: ${missing.join(", ")}`],
    };
  }

  const indexes = Object.fromEntries(
    expectedHeaders.map((name) => [name, header.indexOf(name)])
  ) as Record<string, number>;

  const records: Record<string, string>[] = [];
  const errors: string[] = [];

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const record: Record<string, string> = {};
    for (const name of expectedHeaders) {
      record[name] = row[indexes[name]] ?? "";
    }
    if (!record.email?.trim()) {
      errors.push(`Row ${rowIndex + 1}: email is required`);
      continue;
    }
    records.push(record);
  }

  return { records, errors };
}
