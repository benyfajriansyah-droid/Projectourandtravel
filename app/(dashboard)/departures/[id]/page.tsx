import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCostSummary } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle, CardValue } from "@/components/ui/card";
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
      participants: true,
      payments: true,
    },
  });

  if (!departure) notFound();

  const activePax = departure.participants.filter(
    (p) => p.paymentStatus !== "CANCELLED"
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

  const canSeeEstimasi = session.role === "ADMIN" || session.role === "FINANCE";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/trips/${departure.tripId}`}
          className="text-sm text-neutral-500 hover:underline"
        >
          &larr; {departure.trip.name}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-neutral-900">
            {formatDate(departure.departureDate)} &ndash;{" "}
            {formatDate(departure.returnDate)}
          </h1>
          <Badge variant={DEPARTURE_STATUS_BADGE[departure.status]}>
            {DEPARTURE_STATUS_LABEL[departure.status]}
          </Badge>
        </div>
        <p className="text-sm text-neutral-500">
          {departure.trip.destination} &middot; {activePax}/{departure.maxPax}{" "}
          peserta (min {departure.minPax}) &middot;{" "}
          {formatCurrency(departure.pricePerPax)}/pax
        </p>
      </div>

      {session.role === "ADMIN" && (
        <Card>
          <CardContent className="flex flex-wrap items-end gap-3 pt-4">
            <form action={updateDepartureStatus} className="flex items-end gap-3">
              <input type="hidden" name="departureId" value={departure.id} />
              <input type="hidden" name="tripId" value={departure.tripId} />
              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-800">
                  Ubah Status
                </label>
                <Select name="status" defaultValue={departure.status}>
                  {DEPARTURE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {DEPARTURE_STATUS_LABEL[s]}
                    </option>
                  ))}
                </Select>
              </div>
              <Button type="submit" variant="outline">
                Simpan
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>HPP (est. {paxForEstimate} pax)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardValue>{formatCurrency(summary.hpp)}</CardValue>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Margin / Pax</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardValue
              className={summary.marginPerPax < 0 ? "text-red-600" : undefined}
            >
              {formatCurrency(summary.marginPerPax)}
            </CardValue>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pemasukan Tercatat</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardValue>{formatCurrency(totalIncome)}</CardValue>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pengeluaran Tercatat</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardValue>{formatCurrency(totalExpense)}</CardValue>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        {canSeeEstimasi && (
          <Link href={`/departures/${departure.id}/estimasi`}>
            <Button variant="outline">Kalkulator Estimasi Biaya</Button>
          </Link>
        )}
        <Link href={`/departures/${departure.id}/peserta`}>
          <Button variant="outline">Manajemen Peserta</Button>
        </Link>
      </div>
    </div>
  );
}
