import { notFound } from "next/navigation";
import { Receipt, Trash2, Tag, Info } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCostSummary } from "@/lib/calculations";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { CardSection, Card, CardContent } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import { COST_CATEGORY_LABEL, COST_UNIT_LABEL } from "@/lib/labels";
import { CostComponentForm } from "./cost-component-form";
import { deleteCostComponent, updateDeparturePrice } from "./actions";

export default async function EstimasiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole(["ADMIN", "FINANCE"]);

  const departure = await prisma.departure.findUnique({
    where: { id },
    include: {
      trip: true,
      costComponents: { orderBy: { createdAt: "asc" } },
      participants: { select: { paymentStatus: true } },
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

  const hasComponents = departure.costComponents.length > 0;
  const marginPct =
    summary.marginPerPax !== null && departure.pricePerPax
      ? Math.round((summary.marginPerPax / departure.pricePerPax) * 100)
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kalkulator Estimasi Biaya"
        backHref={`/departures/${departure.id}`}
        backLabel={departure.trip.name}
        description={
          <>
            {formatDate(departure.departureDate)} &ndash;{" "}
            {formatDate(departure.returnDate)} &middot; estimasi untuk{" "}
            <span className="tabular font-medium text-neutral-700">
              {paxForEstimate} pax
            </span>
            {activePax === 0 && " (asumsi minimum, belum ada peserta)"}
          </>
        }
      />

      {/* Langkah 1 */}
      <CardSection
        title="1. Komponen Biaya"
        description="Masukkan semua pengeluaran trip. Flat = total sekali bayar, Per peserta = dikali jumlah pax."
      >
        <CostComponentForm departureId={departure.id} />
      </CardSection>

      {hasComponents ? (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {departure.costComponents.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Badge>{COST_CATEGORY_LABEL[c.category]}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-neutral-500">
                      {COST_UNIT_LABEL[c.unit]}
                    </TableCell>
                    <TableCell className="tabular text-right">
                      {formatCurrency(c.amount)}
                    </TableCell>
                    <TableCell className="tabular text-right">{c.qty}</TableCell>
                    <TableCell className="tabular text-right font-medium">
                      {formatCurrency(c.amount * c.qty)}
                    </TableCell>
                    <TableCell className="text-right">
                      <ConfirmForm
                        action={deleteCostComponent}
                        title={`Hapus "${c.name}"?`}
                        description="Komponen biaya ini akan dihapus dan perhitungan HPP disesuaikan."
                        triggerIcon={<Trash2 aria-hidden />}
                        triggerLabel=""
                      >
                        <input type="hidden" name="id" value={c.id} />
                        <input
                          type="hidden"
                          name="departureId"
                          value={departure.id}
                        />
                      </ConfirmForm>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2 md:hidden">
            {departure.costComponents.map((c) => (
              <MobileCard key={c.id}>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-900">
                      {c.name}
                    </p>
                    <Badge className="mt-1">
                      {COST_CATEGORY_LABEL[c.category]}
                    </Badge>
                  </div>
                  <ConfirmForm
                    action={deleteCostComponent}
                    title={`Hapus "${c.name}"?`}
                    description="Komponen biaya ini akan dihapus dan perhitungan HPP disesuaikan."
                    triggerIcon={<Trash2 aria-hidden />}
                    triggerLabel=""
                  >
                    <input type="hidden" name="id" value={c.id} />
                    <input
                      type="hidden"
                      name="departureId"
                      value={departure.id}
                    />
                  </ConfirmForm>
                </div>
                <div className="divide-y divide-neutral-100 border-t border-neutral-100 pt-1">
                  <MobileField label="Satuan">
                    {COST_UNIT_LABEL[c.unit]}
                  </MobileField>
                  <MobileField label="Nominal">
                    <span className="tabular">{formatCurrency(c.amount)}</span>
                  </MobileField>
                  <MobileField label="Qty">
                    <span className="tabular">{c.qty}</span>
                  </MobileField>
                  <MobileField label="Subtotal">
                    <span className="tabular font-semibold">
                      {formatCurrency(c.amount * c.qty)}
                    </span>
                  </MobileField>
                </div>
              </MobileCard>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Receipt}
          title="Belum ada komponen biaya"
          description="Tambahkan transportasi, akomodasi, konsumsi, guide, dan biaya lain lewat form di atas untuk mulai menghitung HPP."
        />
      )}

      {/* Langkah 2 */}
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">
            2. Total Biaya Trip
          </h2>
          <p className="text-xs text-neutral-500">
            Hasil hitung otomatis dari komponen biaya di atas.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Biaya Flat"
            value={formatCurrency(summary.totalFlat)}
            hint="Total sekali bayar"
          />
          <StatCard
            label="Variabel / Pax"
            value={formatCurrency(summary.totalPerPaxUnit)}
            hint="Dikali jumlah peserta"
          />
          <StatCard
            label="HPP Total"
            value={formatCurrency(summary.hpp)}
            tone="brand"
            icon={Receipt}
            hint={`Untuk ${paxForEstimate} pax`}
          />
          <StatCard
            label="Cost / Pax"
            value={formatCurrency(summary.costPerPax)}
            tone="brand"
            hint="Modal per peserta"
          />
        </div>
      </div>

      {/* Langkah 3 */}
      <CardSection
        title="3. Tentukan Harga Jual"
        description={
          hasComponents
            ? `Modal per peserta saat ini ${formatCurrency(summary.costPerPax)}. Tentukan harga jual di atas angka itu.`
            : "Isi komponen biaya dulu agar modal per peserta terhitung."
        }
      >
        <form
          action={updateDeparturePrice}
          className="flex flex-wrap items-end gap-3"
        >
          <input type="hidden" name="departureId" value={departure.id} />
          <div className="w-full space-y-1.5 sm:w-64">
            <label
              htmlFor="pricePerPax"
              className="block text-sm font-medium text-neutral-700"
            >
              Harga Jual / Peserta (Rp)
            </label>
            <Input
              id="pricePerPax"
              type="number"
              name="pricePerPax"
              min={0}
              placeholder={
                hasComponents
                  ? `Minimal ${Math.ceil(summary.costPerPax)}`
                  : "0"
              }
              defaultValue={departure.pricePerPax ?? undefined}
            />
          </div>
          <Button type="submit">
            <Tag aria-hidden />
            {departure.pricePerPax === null ? "Set Harga" : "Update Harga"}
          </Button>
        </form>
      </CardSection>

      {departure.pricePerPax === null ? (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardContent className="flex items-start gap-2.5 py-4">
            <Info className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
            <p className="text-sm text-amber-800">
              Margin dan BEP akan muncul otomatis setelah harga jual diisi.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Margin / Pax"
            value={formatCurrency(summary.marginPerPax ?? 0)}
            tone={(summary.marginPerPax ?? 0) < 0 ? "red" : "green"}
            valueClassName={
              (summary.marginPerPax ?? 0) < 0 ? "text-red-600" : "text-green-700"
            }
            hint={marginPct !== null ? `${marginPct}% dari harga jual` : undefined}
          />
          <StatCard
            label="Total Margin"
            value={formatCurrency(summary.marginTotal ?? 0)}
            tone={(summary.marginTotal ?? 0) < 0 ? "red" : "green"}
            valueClassName={
              (summary.marginTotal ?? 0) < 0 ? "text-red-600" : "text-green-700"
            }
            hint={`Bila terisi ${paxForEstimate} pax`}
          />
          <StatCard
            label="BEP (Break Even Point)"
            value={
              summary.bepPax === null
                ? "Tidak tercapai"
                : `${Math.ceil(summary.bepPax)} pax`
            }
            tone={summary.bepPax === null ? "red" : "amber"}
            hint={
              summary.bepPax === null
                ? "Harga jual di bawah biaya variabel"
                : "Minimal peserta agar balik modal"
            }
          />
        </div>
      )}
    </div>
  );
}
