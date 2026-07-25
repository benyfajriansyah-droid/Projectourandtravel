import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_BADGE } from "@/lib/labels";
import { PAYMENT_STATUSES } from "@/lib/types";
import { ParticipantForm } from "./participant-form";
import { updateParticipantStatus, deleteParticipant } from "./actions";

export default async function PesertaPage({
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
      participants: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!departure) notFound();

  const canEdit = session.role === "ADMIN" || session.role === "SALES";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/departures/${departure.id}`}
          className="text-sm text-neutral-500 hover:underline"
        >
          &larr; {departure.trip.name}
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">
          Manajemen Peserta
        </h1>
        <p className="text-sm text-neutral-500">
          {formatDate(departure.departureDate)} &ndash;{" "}
          {formatDate(departure.returnDate)} &middot; {departure.participants.length}
          /{departure.maxPax} peserta
        </p>
      </div>

      {canEdit && (
        <Card>
          <CardContent className="pt-4">
            <h2 className="mb-3 text-sm font-medium text-neutral-700">
              Tambah Peserta
            </h2>
            <ParticipantForm departureId={departure.id} />
          </CardContent>
        </Card>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Telepon</TableHead>
            <TableHead>No. KTP</TableHead>
            <TableHead>Kontak Darurat</TableHead>
            <TableHead>Status Bayar</TableHead>
            {canEdit && <TableHead></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {departure.participants.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.phone}</TableCell>
              <TableCell>{p.idNumber ?? "—"}</TableCell>
              <TableCell>{p.emergencyContact ?? "—"}</TableCell>
              <TableCell>
                {canEdit ? (
                  <form
                    action={updateParticipantStatus}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="id" value={p.id} />
                    <input
                      type="hidden"
                      name="departureId"
                      value={departure.id}
                    />
                    <Select
                      name="paymentStatus"
                      defaultValue={p.paymentStatus}
                      className="h-8 w-28 text-xs"
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
                ) : (
                  <Badge variant={PAYMENT_STATUS_BADGE[p.paymentStatus]}>
                    {PAYMENT_STATUS_LABEL[p.paymentStatus]}
                  </Badge>
                )}
              </TableCell>
              {canEdit && (
                <TableCell>
                  <form action={deleteParticipant}>
                    <input type="hidden" name="id" value={p.id} />
                    <input
                      type="hidden"
                      name="departureId"
                      value={departure.id}
                    />
                    <Button type="submit" variant="ghost" size="sm">
                      Hapus
                    </Button>
                  </form>
                </TableCell>
              )}
            </TableRow>
          ))}
          {departure.participants.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={canEdit ? 6 : 5}
                className="text-center text-neutral-400"
              >
                Belum ada peserta.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
