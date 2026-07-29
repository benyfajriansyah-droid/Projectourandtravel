/** Escape satu sel agar aman untuk CSV (dan aman dibuka di Excel). */
function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  // Cegah formula injection saat file dibuka di Excel/Sheets.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * Bangun CSV dengan BOM UTF-8 dan pemisah titik koma, supaya Excel versi
 * Indonesia langsung memisahkan kolom dengan benar.
 */
export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [
    headers.map(escapeCell).join(";"),
    ...rows.map((row) => row.map(escapeCell).join(";")),
  ];
  return `﻿${lines.join("\r\n")}`;
}

export function csvResponse(filename: string, content: string): Response {
  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
