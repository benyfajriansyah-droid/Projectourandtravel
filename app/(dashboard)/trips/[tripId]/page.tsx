import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TRIP_TYPE_LABEL,
  DEPARTURE_STATUS_LABEL,
  DEPARTURE_STATUS_BADGE,
} from "@/lib/labels";
import { DepartureForm } from "./departure-form";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const session = await requireSession();

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      departures: {
        orderBy: { departureDate: "asc" },
        include: { _count: { select: { participants: true } } },
      },
    },
  });

  if (!trip) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/trips" className="text-sm text-neutral-500 hover:underline">
          &larr; Semua trip
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <h1 className="text-xl font-semibold text-neutral-900">{trip.name}</h1>
          <Badge variant={trip.type === "OPEN_TRIP" ? "blue" : "purple"}>
            {TRIP_TYPE_LABEL[trip.type]}
          </Badge>
        </div>
        <p className="text-sm text-neutral-500">
          {trip.destination} &middot; {trip.durationDays} hari
        </p>
        {trip.description && (
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            {trip.description}
          </p>
        )}
      </div>

      {session.role === "ADMIN" && (
        <Card>
          <CardContent className="pt-4">
            <h2 className="mb-3 text-sm font-medium text-neutral-700">
              Tambah Jadwal Keberangkatan
            </h2>
            <DepartureForm tripId={trip.id} />
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-sm font-medium text-neutral-700">
          Jadwal Keberangkatan
        </h2>
        <div className="space-y-2">
          {trip.departures.map((dep) => (
            <Link key={dep.id} href={`/departures/${dep.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-wrap items-center justify-between gap-2 pt-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {formatDate(dep.departureDate)} &ndash;{" "}
                      {formatDate(dep.returnDate)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {dep._count.participants}/{dep.maxPax} peserta (min{" "}
                      {dep.minPax}) &middot; {formatCurrency(dep.pricePerPax)}/pax
                    </p>
                  </div>
                  <Badge variant={DEPARTURE_STATUS_BADGE[dep.status]}>
                    {DEPARTURE_STATUS_LABEL[dep.status]}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
          {trip.departures.length === 0 && (
            <p className="text-sm text-neutral-500">
              Belum ada jadwal keberangkatan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
