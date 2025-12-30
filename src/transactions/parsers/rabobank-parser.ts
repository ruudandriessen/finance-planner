export type ParsedTransaction = {
  iban: string;
  date: Date;
  amount: number;
  currency: string;
  balanceAfter: number;
  counterpartyIban: string;
  counterpartyName: string;
  transactionCode: string;
  description: string;
};

type ColumnMap = {
  iban: number;
  currency: number;
  date: number;
  amount: number;
  balanceAfter: number;
  counterpartyIban: number;
  counterpartyName: number;
  transactionCode: number;
  description1: number;
  description2: number;
  description3: number;
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

function buildColumnMap(headers: string[]): ColumnMap {
  const findIndex = (name: string) => {
    const index = headers.findIndex((h) => h === name);
    return index;
  };

  return {
    iban: findIndex("IBAN/BBAN"),
    currency: findIndex("Munt"),
    date: findIndex("Datum"),
    amount: findIndex("Bedrag"),
    balanceAfter: findIndex("Saldo na trn"),
    counterpartyIban: findIndex("Tegenrekening IBAN/BBAN"),
    counterpartyName: findIndex("Naam tegenpartij"),
    transactionCode: findIndex("Code"),
    description1: findIndex("Omschrijving-1"),
    description2: findIndex("Omschrijving-2"),
    description3: findIndex("Omschrijving-3"),
  };
}

function parseAmount(amountStr: string): number {
  // Rabobank format: "+100,00" or "-50,00"
  const normalized = amountStr.replace(",", ".");
  return parseFloat(normalized);
}

function parseRabobankDate(dateStr: string): Date {
  // Format: YYYY-MM-DD
  return new Date(dateStr);
}

function parseRow(values: string[], columnMap: ColumnMap): ParsedTransaction {
  const getValue = (index: number) => (index >= 0 ? (values[index] ?? "") : "");

  const description1 = getValue(columnMap.description1).trim();
  const description2 = getValue(columnMap.description2).trim();
  const description3 = getValue(columnMap.description3).trim();
  const description = [description1, description2, description3].filter(Boolean).join(" ");

  return {
    iban: getValue(columnMap.iban),
    currency: getValue(columnMap.currency) || "EUR",
    date: parseRabobankDate(getValue(columnMap.date)),
    amount: parseAmount(getValue(columnMap.amount)),
    balanceAfter: parseAmount(getValue(columnMap.balanceAfter)),
    counterpartyIban: getValue(columnMap.counterpartyIban),
    counterpartyName: getValue(columnMap.counterpartyName),
    transactionCode: getValue(columnMap.transactionCode),
    description: description || "No description",
  };
}

export function parseRabobankCSV(csvContent: string): ParsedTransaction[] {
  // Handle UTF-8 BOM
  const content = csvContent.replace(/^\uFEFF/, "");

  // Handle Windows line endings
  const lines = content.split(/\r?\n/);

  if (lines.length < 2) {
    return [];
  }

  const headerLine = lines[0];
  if (!headerLine) {
    return [];
  }

  const headers = parseCSVLine(headerLine);
  const columnMap = buildColumnMap(headers);

  const transactions: ParsedTransaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) {
      continue;
    }

    const values = parseCSVLine(line);
    transactions.push(parseRow(values, columnMap));
  }

  return transactions;
}
