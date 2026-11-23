/** Quotes a CSV field if it contains a comma, quote, or newline. */
function csvField(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Rows of fields → CSV text (with a trailing newline). */
export function toCsv(rows: (string | number)[][]): string {
  return rows.map((row) => row.map(csvField).join(",")).join("\n") + "\n";
}
