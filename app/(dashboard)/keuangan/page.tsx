import Link from "next/link";
import { Suspense } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Receipt,
  TrendingUp,
  TrendingDown,
  Wallet,
  Trash2,
  Printer,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { CardSection } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  MobileCard,
  MobileField,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { SearchInput } from "@/components/ui/search-input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TRANSACTION_TYPE_LABEL } from "@/lib/labels";
import { monthRangeFromParam } from "@/lib/date-range";
import { PaymentForm } from "./payment-form";
import { deletePayment } from "./actions";

export default async function KeuanganPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; q?: string }>;
}) {
  await requireRole(["ADMIN", "FINANCE"]);
  const { month, q } = await searchParams;
  const query = q?.trim() ?? "";
  const range = monthRangeFromParam(month);

  const [payments, departures] = await Promise.all([
    prisma.payment.findMany({
      where: {
        date: { gte: range.start, lt: range.end },
        ...(query
          ? {
              OR: [
                { category: { contains: query, mode: "insensitive" as const } },
                { note: { contains: query, mode: "insensitive" as const } },
                { method: { contains: query, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      include: {
        departure: { include: { trip: true } },
        participant: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    }),
    prisma.departure.findMany({
      include: {
        trip: { select: { name: true } },
        participants: {
          where: { paymentStatus: { not: "CANCELLED" } },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        },
      },
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
    participants: d.participants,
  }));

  const monthQuery = (value: string) =>
    `/keuangan?month=${value}${query ? `&q=${encodeURIComponent(query)}` : ""}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Keuangan"
        description={`Laporan laba-rugi periode ${range.label}.`}
        actions={
          <Link href={`/api/export/keuangan?month=${range.value}`}>
            <Button variant="outline" size="sm">
              <Download aria-hidden />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Excel</span>
            </Button>
          </Link>
        }
      />

      <div className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white p-2 shadow-sm">
        <Link href={monthQuery(range.prevValue)}>
          <Button variant="ghost" size="sm">
            <ChevronLeft aria-hidden />
            <span className="hidden sm:inline">Sebelumnya</span>
          </Button>
        </Link>
        <p className="text-sm font-semibold text-neutral-900">{range.label}</p>
        <Link href={monthQuery(range.nextValue)}>
          <Button variant="ghost" size="sm">
            <span className="hidden sm:inline">Berikutnya</span>
            <ChevronRight aria-hidden />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Pemasukan"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          tone="green"
        />
        <StatCard
          label="Pengeluaran"
          value={formatCurrency(totalExpense)}
          icon={TrendingDown}
          tone="red"
        />
        <StatCard
          label="Laba Bersih"
          value={formatCurrency(net)}
          icon={Wallet}
          tone={net < 0 ? "red" : "brand"}
          valueClassName={net < 0 ? "text-red-600" : "text-green-700"}
        />
      </div>

      <CardSection
        title="Laba-Rugi per Trip"
        description="Rekap otomatis dari transaksi bulan ini."
      >
        {perTrip.size > 0 ? (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip / Keberangkatan</TableHead>
                    <TableHead className="text-right">Pemasukan</TableHead>
                    <TableHead className="text-right">Pengeluaran</TableHead>
                    <TableHead className="text-right">Laba</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...perTrip.values()].map((entry) => {
                    const laba = entry.income - entry.expense;
                    return (
                      <TableRow key={entry.label}>
                        <TableCell className="font-medium">
                          {entry.label}
                        </TableCell>
                        <TableCell className="tabular text-right text-green-700">
                          {formatCurrency(entry.income)}
                        </TableCell>
                        <TableCell className="tabular text-right text-red-600">
                          {formatCurrency(entry.expense)}
                        </TableCell>
                        <TableCell
                          className={`tabular text-right font-semibold ${
                            laba < 0 ? "text-red-600" : "text-neutral-900"
                          }`}
                        >
                          {formatCurrency(laba)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-2 md:hidden">
              {[...perTrip.values()].map((entry) => {
                const laba = entry.income - entry.expense;
                return (
                  <MobileCard key={entry.label}>
                    <p className="mb-2 font-medium text-neutral-900">
                      {entry.label}
                    </p>
                    <div className="divide-y divide-neutral-100 border-t border-neutral-100 pt-1">
                      <MobileField label="Pemasukan">
                        <span className="tabular text-green-700">
                          {formatCurrency(entry.income)}
                        </span>
                      </MobileField>
                      <MobileField label="Pengeluaran">
                        <span className="tabular text-red-600">
                          {formatCurrency(entry.expense)}
                        </span>
                      </MobileField>
                      <MobileField label="Laba">
                        <span
                          className={`tabular font-semibold ${
                            laba < 0 ? "text-red-600" : "text-neutral-900"
                          }`}
                        >
                          {formatCurrency(laba)}
                        </span>
                      </MobileField>
                    </div>
                  </MobileCard>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Receipt}
            title="Belum ada transaksi bulan ini"
            description="Catat pemasukan atau pengeluaran lewat form di bawah."
          />
        )}
      </CardSection>

      <CardSection
        title="Catat Transaksi"
        description="Pemasukan dari peserta atau pengeluaran operasional."
      >
        <PaymentForm departures={departureOptions} />
      </CardSection>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-neutral-900">
            Riwayat Transaksi{" "}
            <span className="tabular font-normal text-neutral-400">
              ({payments.length})
            </span>
          </h2>
          <Suspense fallback={null}>
            <SearchInput
              placeholder="Cari kategori, metode, catatan..."
              className="w-full sm:w-72"
            />
          </Suspense>
        </div>

        {payments.length > 0 ? (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Terkait</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="whitespace-nowrap text-neutral-600">
                        {formatDate(p.date)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          dot
                          variant={p.type === "INCOME" ? "green" : "red"}
                        >
                          {TRANSACTION_TYPE_LABEL[p.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{p.category ?? "—"}</span>
                        {p.note && (
                          <span className="block text-xs text-neutral-400">
                            {p.note}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-neutral-600">
                        {p.departure ? p.departure.trip.name : "Umum"}
                        {p.participant && (
                          <span className="block text-xs text-neutral-400">
                            {p.participant.name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        className={`tabular text-right font-semibold ${
                          p.type === "INCOME" ? "text-green-700" : "text-red-600"
                        }`}
                      >
                        {p.type === "INCOME" ? "+" : "−"}
                        {formatCurrency(p.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {p.type === "INCOME" && (
                            <Link
                              href={`/api/kwitansi/${p.id}`}
                              target="_blank"
                              title="Cetak kwitansi"
                            >
                              <Button variant="ghost" size="icon">
                                <Printer aria-hidden />
                                <span className="sr-only">Cetak kwitansi</span>
                              </Button>
                            </Link>
                          )}
                          <ConfirmForm
                            action={deletePayment}
                            title="Hapus transaksi ini?"
                            description={`${TRANSACTION_TYPE_LABEL[p.type]} ${formatCurrency(p.amount)} tanggal ${formatDate(p.date)} akan dihapus permanen dan laporan disesuaikan.`}
                            triggerIcon={<Trash2 aria-hidden />}
                            triggerLabel=""
                          >
                            <input type="hidden" name="id" value={p.id} />
                            <input
                              type="hidden"
                              name="departureId"
                              value={p.departureId ?? ""}
                            />
                          </ConfirmForm>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-2 md:hidden">
              {payments.map((p) => (
                <MobileCard key={p.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-neutral-900">
                        {p.category ?? "Tanpa kategori"}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {formatDate(p.date)} &middot;{" "}
                        {p.departure ? p.departure.trip.name : "Umum"}
                        {p.participant && ` · ${p.participant.name}`}
                      </p>
                    </div>
                    <p
                      className={`tabular shrink-0 font-semibold ${
                        p.type === "INCOME" ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {p.type === "INCOME" ? "+" : "−"}
                      {formatCurrency(p.amount)}
                    </p>
                  </div>

                  {(p.note || p.method) && (
                    <div className="mt-2 divide-y divide-neutral-100 border-t border-neutral-100 pt-1">
                      {p.method && (
                        <MobileField label="Metode">{p.method}</MobileField>
                      )}
                      {p.note && (
                        <MobileField label="Catatan">{p.note}</MobileField>
                      )}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-end gap-1 border-t border-neutral-100 pt-3">
                    {p.type === "INCOME" && (
                      <Link href={`/api/kwitansi/${p.id}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <Printer aria-hidden />
                          Kwitansi
                        </Button>
                      </Link>
                    )}
                    <ConfirmForm
                      action={deletePayment}
                      title="Hapus transaksi ini?"
                      description={`${TRANSACTION_TYPE_LABEL[p.type]} ${formatCurrency(p.amount)} tanggal ${formatDate(p.date)} akan dihapus permanen.`}
                      triggerIcon={<Trash2 aria-hidden />}
                      triggerLabel="Hapus"
                    >
                      <input type="hidden" name="id" value={p.id} />
                      <input
                        type="hidden"
                        name="departureId"
                        value={p.departureId ?? ""}
                      />
                    </ConfirmForm>
                  </div>
                </MobileCard>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Receipt}
            title={
              query ? "Transaksi tidak ditemukan" : "Belum ada transaksi"
            }
            description={
              query
                ? `Tidak ada transaksi bulan ini yang cocok dengan "${query}".`
                : `Belum ada catatan keuangan untuk ${range.label}.`
            }
          />
        )}
      </div>
    </div>
  );
}
