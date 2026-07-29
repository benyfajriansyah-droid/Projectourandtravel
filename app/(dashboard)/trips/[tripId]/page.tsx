import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarRange, MapPin, Clock, Users, Trash2 } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardSection } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TRIP_TYPE_LABEL,
  DEPARTURE_STATUS_LABEL,
  DEPARTURE_STATUS_BADGE,
} from "@/lib/labels";
import { DepartureForm } from "./departure-form";
import { deleteTrip } from "../actions";

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

  const isAdmin = session.role === "ADMIN";

  return (
    <div className="space-y-6">
      <PageHeader
        title={trip.name}
        backHref="/trips"
        backLabel="Semua trip"
        badge={
          <Badge variant={trip.type === "OPEN_TRIP" ? "blue" : "purple"}>
            {TRIP_TYPE_LABEL[trip.type]}
          </Badge>
        }
        description={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden />
              {trip.destination}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden />
              <span className="tabular">{trip.durationDays}</span> hari
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarRange className="size-3.5" aria-hidden />
              <span className="tabular">{trip.departures.length}</span>{" "}
              keberangkatan
            </span>
          </span>
        }
        actions={
          isAdmin ? (
            <ConfirmForm
              action={deleteTrip}
              title={`Hapus trip "${trip.name}"?`}
              description="Semua jadwal keberangkatan, peserta, komponen biaya, dan transaksi terkait trip ini ikut terhapus permanen."
              submitLabel="Ya, hapus trip"
              triggerLabel="Hapus Trip"
              triggerVariant="outline"
              triggerSize="default"
              triggerIcon={<Trash2 aria-hidden />}
              triggerClassName="text-red-600 hover:border-red-300 hover:bg-red-50"
            >
              <input type="hidden" name="id" value={trip.id} />
            </ConfirmForm>
          ) : undefined
        }
      />

      {trip.description && (
        <Card>
          <CardContent className="py-3">
            <p className="text-sm leading-relaxed text-neutral-600">
              {trip.description}
            </p>
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <CardSection
          title="Tambah Jadwal Keberangkatan"
          description="Satu trip bisa punya banyak tanggal keberangkatan."
        >
          <DepartureForm tripId={trip.id} />
        </CardSection>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-900">
          Jadwal Keberangkatan{" "}
          <span className="tabular font-normal text-neutral-400">
            ({trip.departures.length})
          </span>
        </h2>

        {trip.departures.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {trip.departures.map((dep) => {
              const filled = dep._count.participants;
              const pct = Math.min(
                100,
                Math.round((filled / Math.max(dep.maxPax, 1)) * 100)
              );
              return (
                <Link key={dep.id} href={`/departures/${dep.id}`}>
                  <Card interactive className="h-full">
                    <CardContent className="space-y-3 pt-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-neutral-900">
                          {formatDate(dep.departureDate)} &ndash;{" "}
                          {formatDate(dep.returnDate)}
                        </p>
                        <Badge dot variant={DEPARTURE_STATUS_BADGE[dep.status]}>
                          {DEPARTURE_STATUS_LABEL[dep.status]}
                        </Badge>
                      </div>

                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs text-neutral-500">
                          <span className="flex items-center gap-1.5">
                            <Users className="size-3.5" aria-hidden />
                            <span className="tabular">
                              {filled}/{dep.maxPax}
                            </span>{" "}
                            peserta
                          </span>
                          <span className="tabular">min {dep.minPax}</span>
                        </div>
                        <div
                          className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"
                          role="progressbar"
                          aria-valuenow={filled}
                          aria-valuemin={0}
                          aria-valuemax={dep.maxPax}
                          aria-label="Kuota peserta terisi"
                        >
                          <div
                            className={
                              filled >= dep.minPax
                                ? "h-full rounded-full bg-green-500 transition-all"
                                : "h-full rounded-full bg-brand-500 transition-all"
                            }
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <p className="border-t border-neutral-100 pt-2.5 text-sm">
                        {dep.pricePerPax === null ? (
                          <span className="text-amber-600">
                            Harga jual belum ditentukan
                          </span>
                        ) : (
                          <span className="font-medium text-neutral-900">
                            {formatCurrency(dep.pricePerPax)}
                            <span className="font-normal text-neutral-400">
                              {" "}
                              / peserta
                            </span>
                          </span>
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={CalendarRange}
            title="Belum ada jadwal keberangkatan"
            description={
              isAdmin
                ? "Tambahkan tanggal keberangkatan lewat form di atas."
                : "Admin belum menambahkan jadwal untuk trip ini."
            }
          />
        )}
      </div>
    </div>
  );
}
