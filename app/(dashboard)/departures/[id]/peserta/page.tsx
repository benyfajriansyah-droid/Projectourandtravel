import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Users, Trash2, FileText, Download, Phone } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { CardSection } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
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
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { SearchInput } from "@/components/ui/search-input";
import { formatDate } from "@/lib/utils";
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_BADGE } from "@/lib/labels";
import { PAYMENT_STATUSES } from "@/lib/types";
import { ParticipantForm } from "./participant-form";
import { updateParticipantStatus, deleteParticipant } from "./actions";

export default async function PesertaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const session = await requireSession();

  const departure = await prisma.departure.findUnique({
    where: { id },
    include: {
      trip: true,
      participants: {
        where: query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { phone: { contains: query, mode: "insensitive" } },
              ],
            }
          : undefined,
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { participants: true } },
    },
  });

  if (!departure) notFound();

  const canEdit = session.role === "ADMIN" || session.role === "SALES";
  const rows = departure.participants;
  const lunas = rows.filter((p) => p.paymentStatus === "LUNAS").length;
  const dp = rows.filter((p) => p.paymentStatus === "DP").length;
  const totalTerdaftar = departure._count.participants;

  const statusSelect = (participantId: string, current: string) => (
    <form
      action={updateParticipantStatus}
      className="flex items-center justify-end gap-2"
    >
      <input type="hidden" name="id" value={participantId} />
      <input type="hidden" name="departureId" value={departure.id} />
      <Select
        name="paymentStatus"
        defaultValue={current}
        className="h-8 w-28 text-xs"
        aria-label="Status pembayaran"
      >
        {PAYMENT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {PAYMENT_STATUS_LABEL[s]}
          </option>
        ))}
      </Select>
      <Button type="submit" size="sm" variant="outline">
        Simpan
      </Button>
    </form>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Peserta"
        backHref={`/departures/${departure.id}`}
        backLabel={departure.trip.name}
        description={
          <>
            {formatDate(departure.departureDate)} &ndash;{" "}
            {formatDate(departure.returnDate)}
          </>
        }
        actions={
          <>
            <Link href={`/api/export/peserta/${departure.id}`}>
              <Button variant="outline" size="sm">
                <Download aria-hidden />
                <span className="hidden sm:inline">Excel</span>
              </Button>
            </Link>
            <Link href={`/api/manifest/${departure.id}`} target="_blank">
              <Button variant="outline" size="sm">
                <FileText aria-hidden />
                <span className="hidden sm:inline">Manifest</span>
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Terdaftar"
          value={`${totalTerdaftar}/${departure.maxPax}`}
          icon={Users}
          tone="brand"
          hint={`Min ${departure.minPax} pax`}
        />
        <StatCard label="Lunas" value={lunas} tone="green" />
        <StatCard
          label="Masih DP"
          value={dp}
          tone={dp > 0 ? "amber" : "neutral"}
          valueClassName={dp > 0 ? "text-amber-600" : undefined}
        />
      </div>

      {canEdit && (
        <CardSection
          title="Tambah Peserta"
          description="Form tetap terbuka agar bisa input beberapa peserta berturut-turut."
        >
          <ParticipantForm departureId={departure.id} />
        </CardSection>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-neutral-900">
            Daftar Peserta{" "}
            <span className="tabular font-normal text-neutral-400">
              ({rows.length}
              {query && ` dari ${totalTerdaftar}`})
            </span>
          </h2>
          <Suspense fallback={null}>
            <SearchInput
              placeholder="Cari nama atau telepon..."
              className="w-full sm:w-64"
            />
          </Suspense>
        </div>

        {rows.length > 0 ? (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>No. Identitas</TableHead>
                    <TableHead>Kontak Darurat</TableHead>
                    <TableHead className="text-right">Status Bayar</TableHead>
                    {canEdit && <TableHead />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="tabular text-neutral-600">
                        {p.phone}
                      </TableCell>
                      <TableCell className="tabular text-neutral-600">
                        {p.idNumber ?? "—"}
                      </TableCell>
                      <TableCell className="text-neutral-600">
                        {p.emergencyContact ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {canEdit ? (
                          statusSelect(p.id, p.paymentStatus)
                        ) : (
                          <Badge
                            dot
                            variant={PAYMENT_STATUS_BADGE[p.paymentStatus]}
                          >
                            {PAYMENT_STATUS_LABEL[p.paymentStatus]}
                          </Badge>
                        )}
                      </TableCell>
                      {canEdit && (
                        <TableCell className="text-right">
                          <ConfirmForm
                            action={deleteParticipant}
                            title={`Hapus peserta ${p.name}?`}
                            description="Data peserta ini akan dihapus permanen dari keberangkatan."
                            triggerIcon={<Trash2 aria-hidden />}
                            triggerLabel=""
                          >
                            <input type="hidden" name="id" value={p.id} />
                            <input
                              type="hidden"
                              name="departureId"
                              value={departure.id}
                            />
                          </ConfirmForm>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-2 md:hidden">
              {rows.map((p) => (
                <MobileCard key={p.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-neutral-900">
                        {p.name}
                      </p>
                      <a
                        href={`tel:${p.phone}`}
                        className="tabular mt-0.5 inline-flex items-center gap-1 text-sm text-brand-600"
                      >
                        <Phone className="size-3" aria-hidden />
                        {p.phone}
                      </a>
                    </div>
                    <Badge dot variant={PAYMENT_STATUS_BADGE[p.paymentStatus]}>
                      {PAYMENT_STATUS_LABEL[p.paymentStatus]}
                    </Badge>
                  </div>

                  <div className="mt-2 divide-y divide-neutral-100 border-t border-neutral-100 pt-1">
                    <MobileField label="No. Identitas">
                      {p.idNumber ?? "—"}
                    </MobileField>
                    <MobileField label="Kontak Darurat">
                      {p.emergencyContact ?? "—"}
                    </MobileField>
                  </div>

                  {canEdit && (
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3">
                      {statusSelect(p.id, p.paymentStatus)}
                      <ConfirmForm
                        action={deleteParticipant}
                        title={`Hapus peserta ${p.name}?`}
                        description="Data peserta ini akan dihapus permanen dari keberangkatan."
                        triggerIcon={<Trash2 aria-hidden />}
                        triggerLabel=""
                      >
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          type="hidden"
                          name="departureId"
                          value={departure.id}
                        />
                      </ConfirmForm>
                    </div>
                  )}
                </MobileCard>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Users}
            title={query ? "Peserta tidak ditemukan" : "Belum ada peserta"}
            description={
              query
                ? `Tidak ada peserta yang cocok dengan "${query}".`
                : canEdit
                  ? "Tambahkan peserta pertama lewat form di atas."
                  : "Belum ada peserta terdaftar untuk keberangkatan ini."
            }
          />
        )}
      </div>
    </div>
  );
}
