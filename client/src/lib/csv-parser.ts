export interface CsvRow {
  [key: string]: string;
}

export function parseCsv(csvContent: string): CsvRow[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`);
      continue;
    }

    const row: CsvRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    rows.push(row);
  }

  return rows;
}

export function validateRequiredFields(row: CsvRow, requiredFields: string[]): string[] {
  const missing: string[] = [];
  
  for (const field of requiredFields) {
    if (!row[field] || row[field].trim() === '') {
      missing.push(field);
    }
  }
  
  return missing;
}

export function parseNumber(value: string): number {
  const cleaned = value.replace(/[$,]/g, '');
  const num = parseFloat(cleaned);
  
  if (isNaN(num)) {
    throw new Error(`Invalid number format: ${value}`);
  }
  
  return num;
}

export function parseDate(value: string): Date {
  const date = new Date(value);
  
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${value}`);
  }
  
  return date;
}

export function normalizeSide(side: string): 'LONG' | 'SHORT' {
  const normalized = side.toUpperCase().trim();
  
  if (['BUY', 'LONG', 'B', 'L'].includes(normalized)) {
    return 'LONG';
  } else if (['SELL', 'SHORT', 'S', 'SH'].includes(normalized)) {
    return 'SHORT';
  } else {
    throw new Error(`Invalid side value: ${side}. Must be BUY/SELL or LONG/SHORT`);
  }
}
