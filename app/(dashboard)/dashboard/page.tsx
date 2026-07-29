import Link from "next/link";
import {
  CalendarDays,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Plus,
} from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardSection } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DEPARTURE_STATUS_LABEL, DEPARTURE_STATUS_BADGE } from "@/lib/labels";
import {
  RevenueTrendChartLazy,
  type MonthlyPoint,
} from "@/components/charts/revenue-trend-chart-lazy";

const ACTIVE_STATUSES = ["PLANNING", "CONFIRMED", "ONGOING"] as const;

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d: Date) {
  return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
}

function daysUntil(date: Date) {
  const diff = Math.ceil(
    (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (diff <= 0) return "hari ini";
  if (diff === 1) return "besok";
  return `${diff} hari lagi`;
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
      ? prisma.payment.findMany({ where: { date: { gte: sixMonthsAgo } } })
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
    const entry = monthly.get(monthKey(p.date));
    if (!entry) continue;
    if (p.type === "INCOME") entry.income += p.amount;
    else entry.expense += p.amount;
  }

  const hasChartData = [...monthly.values()].some(
    (m) => m.income > 0 || m.expense > 0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Halo, ${session.name}`}
        description="Ringkasan operasional tour & travel kamu."
        actions={
          <Link href="/trips">
            <Button>
              <Plus aria-hidden />
              <span className="hidden sm:inline">Trip Baru</span>
              <span className="sm:hidden">Trip</span>
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Keberangkatan Mendatang"
          value={upcomingDepartures.length}
          icon={CalendarDays}
          tone="brand"
          hint={
            upcomingDepartures[0]
              ? `Terdekat ${daysUntil(upcomingDepartures[0].departureDate)}`
              : "Belum ada jadwal"
          }
        />
        <StatCard
          label="Pax Aktif Terdaftar"
          value={activePaxCount}
          icon={Users}
          tone="purple"
          hint="Di seluruh trip berjalan"
        />
        {canSeeFinance && (
          <StatCard
            label="Pemasukan Bulan Ini"
            value={formatCurrency(revenueThisMonth)}
            icon={TrendingUp}
            tone="green"
            hint={now.toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          />
        )}
        <StatCard
          label="Peserta Belum Lunas"
          value={dpParticipantCount}
          icon={AlertCircle}
          tone={dpParticipantCount > 0 ? "amber" : "neutral"}
          valueClassName={dpParticipantCount > 0 ? "text-amber-600" : undefined}
          hint={dpParticipantCount > 0 ? "Perlu ditagih" : "Semua lunas"}
        />
      </div>

      {canSeeFinance && (
        <CardSection
          title="Tren Keuangan"
          description="Pemasukan vs pengeluaran 6 bulan terakhir"
          action={
            <Link href="/keuangan">
              <Button variant="ghost" size="sm">
                Lihat detail
                <ArrowRight aria-hidden />
              </Button>
            </Link>
          }
        >
          {hasChartData ? (
            <RevenueTrendChartLazy data={[...monthly.values()]} />
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="Belum ada transaksi"
              description="Grafik akan muncul setelah kamu mencatat pemasukan atau pengeluaran."
              action={
                <Link href="/keuangan">
                  <Button size="sm">Catat transaksi</Button>
                </Link>
              }
            />
          )}
        </CardSection>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardSection
          title="Keberangkatan Mendatang"
          description="5 jadwal terdekat"
        >
          <div className="space-y-2">
            {upcomingDepartures.map((dep) => (
              <Link
                key={dep.id}
                href={`/departures/${dep.id}`}
                className="block rounded-lg border border-neutral-200 p-3 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {dep.trip.name}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {formatDate(dep.departureDate)} &middot;{" "}
                      <span className="tabular">
                        {dep._count.participants}/{dep.maxPax}
                      </span>{" "}
                      peserta &middot; {daysUntil(dep.departureDate)}
                    </p>
                  </div>
                  <Badge dot variant={DEPARTURE_STATUS_BADGE[dep.status]}>
                    {DEPARTURE_STATUS_LABEL[dep.status]}
                  </Badge>
                </div>
              </Link>
            ))}
            {upcomingDepartures.length === 0 && (
              <EmptyState
                icon={CalendarDays}
                title="Tidak ada keberangkatan mendatang"
                description="Buat jadwal keberangkatan dari halaman trip."
                action={
                  <Link href="/trips">
                    <Button size="sm">Buka daftar trip</Button>
                  </Link>
                }
              />
            )}
          </div>
        </CardSection>

        <CardSection
          title="Peserta Belum Lunas"
          description="Perlu ditindaklanjuti"
        >
          <div className="space-y-2">
            {dpParticipants.map((p) => (
              <Link
                key={p.id}
                href={`/departures/${p.departureId}/peserta`}
                className="block rounded-lg border border-neutral-200 p-3 transition-colors hover:border-amber-300 hover:bg-amber-50/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {p.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      {p.departure.trip.name} &middot;{" "}
                      {formatDate(p.departure.departureDate)}
                    </p>
                  </div>
                  <Badge dot variant="yellow">
                    DP
                  </Badge>
                </div>
              </Link>
            ))}
            {dpParticipants.length === 0 && (
              <Card className="border-dashed bg-green-50/40">
                <CardContent className="flex items-center gap-2 py-4">
                  <div className="flex size-8 items-center justify-center rounded-full bg-green-100">
                    <Users className="size-4 text-green-600" aria-hidden />
                  </div>
                  <p className="text-sm text-neutral-700">
                    Semua peserta sudah lunas.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardSection>
      </div>
    </div>
  );
}
