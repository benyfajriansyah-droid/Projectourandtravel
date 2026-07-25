export const TRIP_TYPE_LABEL: Record<string, string> = {
  OPEN_TRIP: "Open Trip",
  PRIVATE: "Private/Custom",
};

export const DEPARTURE_STATUS_LABEL: Record<string, string> = {
  PLANNING: "Perencanaan",
  CONFIRMED: "Terkonfirmasi",
  ONGOING: "Berlangsung",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export const DEPARTURE_STATUS_BADGE: Record<
  string,
  "default" | "blue" | "green" | "yellow" | "red" | "purple"
> = {
  PLANNING: "default",
  CONFIRMED: "blue",
  ONGOING: "purple",
  COMPLETED: "green",
  CANCELLED: "red",
};

export const COST_CATEGORY_LABEL: Record<string, string> = {
  TRANSPORT: "Transportasi",
  AKOMODASI: "Akomodasi",
  KONSUMSI: "Konsumsi",
  GUIDE: "Guide",
  TIKET_MASUK: "Tiket Masuk",
  LAINNYA: "Lainnya",
};

export const COST_UNIT_LABEL: Record<string, string> = {
  FLAT: "Flat (total)",
  PER_PAX: "Per peserta",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  DP: "DP",
  LUNAS: "Lunas",
  CANCELLED: "Batal",
};

export const PAYMENT_STATUS_BADGE: Record<
  string,
  "default" | "blue" | "green" | "yellow" | "red" | "purple"
> = {
  DP: "yellow",
  LUNAS: "green",
  CANCELLED: "red",
};

export const TRANSACTION_TYPE_LABEL: Record<string, string> = {
  INCOME: "Pemasukan",
  EXPENSE: "Pengeluaran",
};

export const VENDOR_CATEGORY_LABEL: Record<string, string> = {
  HOTEL: "Hotel",
  TRANSPORT: "Transportasi",
  KONSUMSI: "Konsumsi",
  GUIDE: "Guide",
  LAINNYA: "Lainnya",
};

export const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  FINANCE: "Finance",
  SALES: "Sales",
  OPERASIONAL: "Operasional",
};
