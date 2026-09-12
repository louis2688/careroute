// One CSV line. Quotes only the cells that need it.
export const csvRow = (cells: unknown[]) =>
  cells
    .map((c) => {
      const s = c == null ? "" : String(c);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    })
    .join(",");
