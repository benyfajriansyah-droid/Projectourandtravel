import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardValue } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TRANSACTION_TYPE_LABEL } from "@/lib/labels";
import { PaymentForm } from "./payment-form";
import { deletePayment } from "./actions";

function getMonthRange(monthParam?: string) {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    year = y;
    month = m - 1;
  }

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  const prev = new Date(year, month - 1, 1);
  const next = new Date(year, month + 1, 1);
  const label = start.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const toValue = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  return {
    start,
    end,
    label,
    value: toValue(start),
    prevValue: toValue(prev),
    nextValue: toValue(next),
  };
}

export default async function KeuanganPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  await requireRole(["ADMIN", "FINANCE"]);
  const { month } = await searchParams;
  const range = getMonthRange(month);

  const [payments, departures] = await Promise.all([
    prisma.payment.findMany({
      where: { date: { gte: range.start, lt: range.end } },
      include: { departure: { include: { trip: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.departure.findMany({
      include: { trip: true },
      orderBy: { departureDate: "desc" },
      take: 100,
    }),
  ]);

  const totalIncome = payments
    .filter((p) => p.type === "INCOME")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = payments
    .filter((p) => p.type === "EXPENSE")
    .reduce((sum, p) => sum + p.amount, 0);
  const net = totalIncome - totalExpense;

  const perTrip = new Map<
    string,
    { label: string; income: number; expense: number }
  >();
  for (const p of payments) {
    const key = p.departureId ?? "umum";
    const label = p.departure
      ? `${p.departure.trip.name} (${formatDate(p.departure.departureDate)})`
      : "Umum / operasional";
    const entry = perTrip.get(key) ?? { label, income: 0, expense: 0 };
    if (p.type === "INCOME") entry.income += p.amount;
    else entry.expense += p.amount;
    perTrip.set(key, entry);
  }

  const departureOptions = departures.map((d) => ({
    id: d.id,
    label: `${d.trip.name} (${formatDate(d.departureDate)})`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Keuangan</h1>
          <p className="text-sm text-neutral-500">
            Laporan laba-rugi periode {range.label}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/keuangan?month=${range.prevValue}`}>
            <Button variant="outline" size="sm">
              &larr; Bulan Sebelumnya
            </Button>
          </Link>
          <Link href={`/keuangan?month=${range.nextValue}`}>
            <Button variant="outline" size="sm">
              Bulan Berikutnya &rarr;
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pemasukan</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardValue>{formatCurrency(totalIncome)}</CardValue>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardValue>{formatCurrency(totalExpense)}</CardValue>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Laba Bersih</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardValue className={net < 0 ? "text-red-600" : "text-green-700"}>
              {formatCurrency(net)}
            </CardValue>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-neutral-700">
          Laba-Rugi per Trip/Keberangkatan
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trip / Keberangkatan</TableHead>
              <TableHead>Pemasukan</TableHead>
              <TableHead>Pengeluaran</TableHead>
              <TableHead>Laba</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...perTrip.values()].map((entry) => (
              <TableRow key={entry.label}>
                <TableCell>{entry.label}</TableCell>
                <TableCell>{formatCurrency(entry.income)}</TableCell>
                <TableCell>{formatCurrency(entry.expense)}</TableCell>
                <TableCell
                  className={
                    entry.income - entry.expense < 0 ? "text-red-600" : ""
                  }
                >
                  {formatCurrency(entry.income - entry.expense)}
                </TableCell>
              </TableRow>
            ))}
            {perTrip.size === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-neutral-400">
                  Belum ada transaksi bulan ini.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Card>
        <CardContent className="pt-4">
          <h2 className="mb-3 text-sm font-medium text-neutral-700">
            Catat Transaksi
          </h2>
          <PaymentForm departures={departureOptions} />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-medium text-neutral-700">
          Riwayat Transaksi
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Terkait</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Catatan</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{formatDate(p.date)}</TableCell>
                <TableCell
                  className={p.type === "INCOME" ? "text-green-700" : "text-red-600"}
                >
                  {TRANSACTION_TYPE_LABEL[p.type]}
                </TableCell>
                <TableCell>{p.category ?? "—"}</TableCell>
                <TableCell>{p.departure ? p.departure.trip.name : "Umum"}</TableCell>
                <TableCell>{formatCurrency(p.amount)}</TableCell>
                <TableCell>{p.note ?? "—"}</TableCell>
                <TableCell>
                  <form action={deletePayment}>
                    <input type="hidden" name="id" value={p.id} />
                    <input
                      type="hidden"
                      name="departureId"
                      value={p.departureId ?? ""}
                    />
                    <Button type="submit" variant="ghost" size="sm">
                      Hapus
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-neutral-400">
                  Belum ada transaksi bulan ini.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
