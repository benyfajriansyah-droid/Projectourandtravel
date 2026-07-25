import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardValue } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DEPARTURE_STATUS_LABEL, DEPARTURE_STATUS_BADGE } from "@/lib/labels";
import { RevenueTrendChart, type MonthlyPoint } from "@/components/charts/revenue-trend-chart";

const ACTIVE_STATUSES = ["PLANNING", "CONFIRMED", "ONGOING"] as const;

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d: Date) {
  return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
}

export default async function DashboardPage() {
  const session = await requireSession();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const canSeeFinance = session.role === "ADMIN" || session.role === "FINANCE";

  const [
    upcomingDepartures,
    activePaxCount,
    dpParticipantCount,
    dpParticipants,
    trendPayments,
  ] = await Promise.all([
    prisma.departure.findMany({
      where: {
        departureDate: { gte: now },
        status: { in: [...ACTIVE_STATUSES] },
      },
      orderBy: { departureDate: "asc" },
      take: 5,
      include: { trip: true, _count: { select: { participants: true } } },
    }),
    prisma.participant.count({
      where: {
        paymentStatus: { not: "CANCELLED" },
        departure: { status: { in: [...ACTIVE_STATUSES] } },
      },
    }),
    prisma.participant.count({ where: { paymentStatus: "DP" } }),
    prisma.participant.findMany({
      where: { paymentStatus: "DP" },
      include: { departure: { include: { trip: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    canSeeFinance
      ? prisma.payment.findMany({
          where: { date: { gte: sixMonthsAgo } },
        })
      : Promise.resolve([]),
  ]);

  const revenueThisMonth = trendPayments
    .filter(
      (p) => p.type === "INCOME" && p.date >= monthStart && p.date < nextMonthStart
    )
    .reduce((sum, p) => sum + p.amount, 0);

  const monthly = new Map<string, MonthlyPoint>();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    monthly.set(monthKey(d), { month: monthLabel(d), income: 0, expense: 0 });
  }
  for (const p of trendPayments) {
    const key = monthKey(p.date);
    const entry = monthly.get(key);
    if (!entry) continue;
    if (p.type === "INCOME") entry.income += p.amount;
    else entry.expense += p.amount;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">
          Halo, {session.name}
        </h1>
        <p className="text-sm text-neutral-500">
          Ringkasan operasional tour &amp; travel.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Keberangkatan Mendatang</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardValue>{upcomingDepartures.length}</CardValue>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pax Aktif Terdaftar</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardValue>{activePaxCount}</CardValue>
          </CardContent>
        </Card>
        {canSeeFinance && (
          <Card>
            <CardHeader>
              <CardTitle>Pemasukan Bulan Ini</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardValue>{formatCurrency(revenueThisMonth)}</CardValue>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Peserta Belum Lunas</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardValue>{dpParticipantCount}</CardValue>
          </CardContent>
        </Card>
      </div>

      {canSeeFinance && (
        <div>
          <h2 className="mb-3 text-sm font-medium text-neutral-700">
            Tren Keuangan (6 Bulan Terakhir)
          </h2>
          <Card>
            <CardContent className="pt-4">
              <RevenueTrendChart data={[...monthly.values()]} />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-medium text-neutral-700">
            Keberangkatan Mendatang
          </h2>
          <div className="space-y-2">
            {upcomingDepartures.map((dep) => (
              <Link key={dep.id} href={`/departures/${dep.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-wrap items-center justify-between gap-2 pt-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {dep.trip.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatDate(dep.departureDate)} &middot;{" "}
                        {dep._count.participants}/{dep.maxPax} peserta
                      </p>
                    </div>
                    <Badge variant={DEPARTURE_STATUS_BADGE[dep.status]}>
                      {DEPARTURE_STATUS_LABEL[dep.status]}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {upcomingDepartures.length === 0 && (
              <p className="text-sm text-neutral-500">
                Tidak ada keberangkatan mendatang.
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium text-neutral-700">
            Peserta Belum Lunas (Terbaru)
          </h2>
          <div className="space-y-2">
            {dpParticipants.map((p) => (
              <Link key={p.id} href={`/departures/${p.departureId}/peserta`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-wrap items-center justify-between gap-2 pt-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {p.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {p.departure.trip.name} &middot;{" "}
                        {formatDate(p.departure.departureDate)}
                      </p>
                    </div>
                    <Badge variant="yellow">DP</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {dpParticipants.length === 0 && (
              <p className="text-sm text-neutral-500">
                Semua peserta sudah lunas.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
