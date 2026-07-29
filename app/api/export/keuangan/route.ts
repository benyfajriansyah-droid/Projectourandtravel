import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv, csvResponse } from "@/lib/csv";
import { formatDate } from "@/lib/utils";
import { TRANSACTION_TYPE_LABEL } from "@/lib/labels";
import { monthRangeFromParam } from "@/lib/date-range";

export async function GET(request: Request) {
  await requireRole(["ADMIN", "FINANCE"]);

  const { searchParams } = new URL(request.url);
  const range = monthRangeFromParam(searchParams.get("month") ?? undefined);

  const payments = await prisma.payment.findMany({
    where: { date: { gte: range.start, lt: range.end } },
    include: { departure: { include: { trip: true } }, participant: true },
    orderBy: { date: "asc" },
  });

  const rows = payments.map((p) => [
    formatDate(p.date),
    TRANSACTION_TYPE_LABEL[p.type],
    p.category ?? "",
    p.departure ? p.departure.trip.name : "Umum / operasional",
    p.departure ? formatDate(p.departure.departureDate) : "",
    p.participant?.name ?? "",
    p.method ?? "",
    p.type === "INCOME" ? p.amount : 0,
    p.type === "EXPENSE" ? p.amount : 0,
    p.note ?? "",
  ]);

  const totalIncome = payments
    .filter((p) => p.type === "INCOME")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = payments
    .filter((p) => p.type === "EXPENSE")
    .reduce((sum, p) => sum + p.amount, 0);

  rows.push([]);
  rows.push(["", "", "", "", "", "", "TOTAL", totalIncome, totalExpense, ""]);
  rows.push([
    "",
    "",
    "",
    "",
    "",
    "",
    "LABA BERSIH",
    totalIncome - totalExpense,
    "",
    "",
  ]);

  const csv = toCsv(
    [
      "Tanggal",
      "Jenis",
      "Kategori",
      "Trip / Keberangkatan",
      "Tgl Berangkat",
      "Peserta",
      "Metode",
      "Pemasukan",
      "Pengeluaran",
      "Catatan",
    ],
    rows
  );

  return csvResponse(`laporan-keuangan-${range.value}.csv`, csv);
}
