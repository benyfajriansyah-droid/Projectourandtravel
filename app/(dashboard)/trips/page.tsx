import Link from "next/link";
import { Suspense } from "react";
import { Map, MapPin, CalendarRange, Clock } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardSection } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { TripForm } from "./trip-form";
import { TRIP_TYPE_LABEL } from "@/lib/labels";

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireSession();
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const trips = await prisma.trip.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { destination: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { departures: true } } },
  });

  const isAdmin = session.role === "ADMIN";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trip & Keberangkatan"
        description="Daftar paket trip beserta jadwal keberangkatannya."
      />

      {isAdmin && (
        <CardSection
          title="Tambah Trip Baru"
          description="Buat paket trip dulu, jadwal keberangkatan menyusul di halaman detail."
        >
          <TripForm />
        </CardSection>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-neutral-900">
            Semua Trip{" "}
            <span className="tabular font-normal text-neutral-400">
              ({trips.length})
            </span>
          </h2>
          <Suspense fallback={null}>
            <SearchInput
              placeholder="Cari nama atau destinasi..."
              className="w-full sm:w-72"
            />
          </Suspense>
        </div>

        {trips.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {trips.map((trip) => (
              <Link key={trip.id} href={`/trips/${trip.id}`} className="group">
                <Card interactive className="h-full">
                  <CardContent className="space-y-3 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-neutral-900 transition-colors group-hover:text-brand-700">
                        {trip.name}
                      </h3>
                      <Badge
                        variant={trip.type === "OPEN_TRIP" ? "blue" : "purple"}
                      >
                        {TRIP_TYPE_LABEL[trip.type]}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                      <MapPin className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{trip.destination}</span>
                    </div>

                    <div className="flex items-center gap-4 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5" aria-hidden />
                        <span className="tabular">{trip.durationDays}</span> hari
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarRange className="size-3.5" aria-hidden />
                        <span className="tabular">
                          {trip._count.departures}
                        </span>{" "}
                        keberangkatan
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Map}
            title={query ? "Trip tidak ditemukan" : "Belum ada trip"}
            description={
              query
                ? `Tidak ada trip yang cocok dengan "${query}". Coba kata kunci lain.`
                : isAdmin
                  ? "Mulai dengan menambahkan paket trip pertama kamu di form di atas."
                  : "Admin belum menambahkan paket trip."
            }
          />
        )}
      </div>
    </div>
  );
}
