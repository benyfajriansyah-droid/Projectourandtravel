import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calculator,
  Users,
  FileText,
  Wallet,
  TrendingUp,
  Receipt,
  MapPin,
} from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCostSummary } from "@/lib/calculations";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { CardSection } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DEPARTURE_STATUS_LABEL, DEPARTURE_STATUS_BADGE } from "@/lib/labels";
import { DEPARTURE_STATUSES } from "@/lib/types";
import { updateDepartureStatus } from "../../trips/actions";

export default async function DepartureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const departure = await prisma.departure.findUnique({
    where: { id },
    include: {
      trip: true,
      costComponents: true,
      participants: { select: { paymentStatus: true } },
      payments: { select: { type: true, amount: true } },
    },
  });

  if (!departure) notFound();

  const activePax = departure.participants.filter(
    (p) => p.paymentStatus !== "CANCELLED"
  ).length;
  const paidPax = departure.participants.filter(
    (p) => p.paymentStatus === "LUNAS"
  ).length;
  const paxForEstimate = activePax > 0 ? activePax : departure.minPax;
  const summary = calculateCostSummary(
    departure.costComponents,
    paxForEstimate,
    departure.pricePerPax
  );

  const totalIncome = departure.payments
    .filter((p) => p.type === "INCOME")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = departure.payments
    .filter((p) => p.type === "EXPENSE")
    .reduce((sum, p) => sum + p.amount, 0);
  const net = totalIncome - totalExpense;

  const canSeeEstimasi = session.role === "ADMIN" || session.role === "FINANCE";
  const isAdmin = session.role === "ADMIN";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${formatDate(departure.departureDate)} – ${formatDate(departure.returnDate)}`}
        backHref={`/trips/${departure.tripId}`}
        backLabel={departure.trip.name}
        badge={
          <Badge dot variant={DEPARTURE_STATUS_BADGE[departure.status]}>
            {DEPARTURE_STATUS_LABEL[departure.status]}
          </Badge>
        }
        description={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden />
              {departure.trip.destination}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden />
              <span className="tabular">
                {activePax}/{departure.maxPax}
              </span>{" "}
              peserta (min {departure.minPax})
            </span>
            <span>
              {departure.pricePerPax === null ? (
                <span className="text-amber-600">Harga belum ditentukan</span>
              ) : (
                <>{formatCurrency(departure.pricePerPax)} / peserta</>
              )}
            </span>
          </span>
        }
      />

      <div className="flex flex-wrap gap-2">
        {canSeeEstimasi && (
          <Link href={`/departures/${departure.id}/estimasi`}>
            <Button>
              <Calculator aria-hidden />
              Kalkulator Biaya
            </Button>
          </Link>
        )}
        <Link href={`/departures/${departure.id}/peserta`}>
          <Button variant="outline">
            <Users aria-hidden />
            Kelola Peserta
          </Button>
        </Link>
        <Link href={`/api/manifest/${departure.id}`} target="_blank">
          <Button variant="outline">
            <FileText aria-hidden />
            Cetak Manifest
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label={`HPP (est. ${paxForEstimate} pax)`}
          value={formatCurrency(summary.hpp)}
          icon={Calculator}
          tone="brand"
          hint={
            activePax > 0 ? "Berdasar peserta aktif" : "Asumsi minimum pax"
          }
        />
        <StatCard
          label="Margin / Pax"
          value={
            summary.marginPerPax === null
              ? "—"
              : formatCurrency(summary.marginPerPax)
          }
          icon={TrendingUp}
          tone={
            summary.marginPerPax !== null && summary.marginPerPax < 0
              ? "red"
              : "green"
          }
          valueClassName={
            summary.marginPerPax !== null && summary.marginPerPax < 0
              ? "text-red-600"
              : undefined
          }
          hint={
            summary.marginPerPax === null ? "Harga jual belum diisi" : undefined
          }
        />
        <StatCard
          label="Pemasukan Tercatat"
          value={formatCurrency(totalIncome)}
          icon={Wallet}
          tone="green"
          hint={`${paidPax} peserta lunas`}
        />
        <StatCard
          label="Pengeluaran Tercatat"
          value={formatCurrency(totalExpense)}
          icon={Receipt}
          tone="amber"
          hint={`Selisih ${formatCurrency(net)}`}
        />
      </div>

      {isAdmin && (
        <CardSection
          title="Status Keberangkatan"
          description="Ubah saat trip dikonfirmasi, berjalan, selesai, atau dibatalkan."
        >
          <form
            action={updateDepartureStatus}
            className="flex flex-wrap items-end gap-3"
          >
            <input type="hidden" name="departureId" value={departure.id} />
            <input type="hidden" name="tripId" value={departure.tripId} />
            <div className="w-full space-y-1.5 sm:w-56">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-neutral-700"
              >
                Status
              </label>
              <Select id="status" name="status" defaultValue={departure.status}>
                {DEPARTURE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {DEPARTURE_STATUS_LABEL[s]}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" variant="outline">
              Simpan Status
            </Button>
          </form>
        </CardSection>
      )}
    </div>
  );
}
