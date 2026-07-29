export interface MonthRange {
  start: Date;
  end: Date;
  /** Label ramah pengguna, mis. "Juli 2026". */
  label: string;
  /** Nilai untuk query string, mis. "2026-07". */
  value: string;
  prevValue: string;
  nextValue: string;
}

function toValue(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Rentang satu bulan dari parameter `?month=YYYY-MM` (default: bulan ini). */
export function monthRangeFromParam(monthParam?: string): MonthRange {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    if (m >= 1 && m <= 12) {
      year = y;
      month = m - 1;
    }
  }

  const start = new Date(year, month, 1);

  return {
    start,
    end: new Date(year, month + 1, 1),
    label: start.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
    value: toValue(start),
    prevValue: toValue(new Date(year, month - 1, 1)),
    nextValue: toValue(new Date(year, month + 1, 1)),
  };
}
