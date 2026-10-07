/** A single CSV row: column name to value. */
export type CsvRow = Record<string, string | number>;

const CSV_SPECIAL_CHARACTERS = /[",\n]/;

function escapeCsvValue(value: string | number): string {
  const text = String(value);
  if (!CSV_SPECIAL_CHARACTERS.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

/** Builds CSV text. Column names come from the first row. */
export function toCsv(rows: readonly CsvRow[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const headerLine = headers.join(',');
  const dataLines = rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(','));
  return [headerLine, ...dataLines].join('\n');
}

/** Starts a browser download of a text file. */
export function downloadTextFile(fileName: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
