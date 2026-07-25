import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TripForm } from "./trip-form";
import { TRIP_TYPE_LABEL } from "@/lib/labels";

export default async function TripsPage() {
  const session = await requireSession();
  const trips = await prisma.trip.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { departures: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">
          Trip &amp; Keberangkatan
        </h1>
        <p className="text-sm text-neutral-500">
          Daftar paket trip dan jadwal keberangkatannya.
        </p>
      </div>

      {session.role === "ADMIN" && (
        <Card>
          <CardContent className="pt-4">
            <h2 className="mb-3 text-sm font-medium text-neutral-700">
              Tambah Trip Baru
            </h2>
            <TripForm />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <Link key={trip.id} href={`/trips/${trip.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="space-y-2 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-neutral-900">{trip.name}</h3>
                  <Badge variant={trip.type === "OPEN_TRIP" ? "blue" : "purple"}>
                    {TRIP_TYPE_LABEL[trip.type]}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-500">{trip.destination}</p>
                <p className="text-xs text-neutral-400">
                  {trip.durationDays} hari &middot; {trip._count.departures}{" "}
                  keberangkatan
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
        {trips.length === 0 && (
          <p className="text-sm text-neutral-500">Belum ada trip.</p>
        )}
      </div>
    </div>
  );
}
