import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCostSummary } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle, CardValue } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      participants: true,
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
          Kalkulator Estimasi Biaya
        </h1>
        <p className="text-sm text-neutral-500">
          {formatDate(departure.departureDate)} &ndash;{" "}
          {formatDate(departure.returnDate)}
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          Estimasi dihitung untuk {paxForEstimate} pax
          {activePax === 0
            ? " (asumsi minimum pax, belum ada peserta terdaftar)"
            : ""}
          .
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <h2 className="mb-3 text-sm font-medium text-neutral-700">
            1. Tambah Komponen Biaya
          </h2>
          <CostComponentForm departureId={departure.id} />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-medium text-neutral-700">
          Komponen Biaya
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kategori</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departure.costComponents.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{COST_CATEGORY_LABEL[c.category]}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{COST_UNIT_LABEL[c.unit]}</TableCell>
                <TableCell>{formatCurrency(c.amount)}</TableCell>
                <TableCell>{c.qty}</TableCell>
                <TableCell>{formatCurrency(c.amount * c.qty)}</TableCell>
                <TableCell>
                  <form action={deleteCostComponent}>
                    <input type="hidden" name="id" value={c.id} />
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
              </TableRow>
            ))}
            {departure.costComponents.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-neutral-400">
                  Belum ada komponen biaya.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-neutral-700">
          2. Total Biaya Trip
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Biaya Flat</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardValue className="text-lg">
                {formatCurrency(summary.totalFlat)}
              </CardValue>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Variabel / Pax</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardValue className="text-lg">
                {formatCurrency(summary.totalPerPaxUnit)}
              </CardValue>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>HPP Total</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardValue className="text-lg">
                {formatCurrency(summary.hpp)}
              </CardValue>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Cost / Pax</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardValue className="text-lg">
                {formatCurrency(summary.costPerPax)}
              </CardValue>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 pt-4">
          <form action={updateDeparturePrice} className="flex items-end gap-3">
            <input type="hidden" name="departureId" value={departure.id} />
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-800">
                3. Harga Jual / Peserta (Rp)
              </label>
              <Input
                type="number"
                name="pricePerPax"
                min={0}
                placeholder={`Cost/pax saat ini: ${formatCurrency(summary.costPerPax)}`}
                defaultValue={departure.pricePerPax ?? undefined}
                className="w-64"
              />
            </div>
            <Button type="submit" variant="outline">
              {departure.pricePerPax === null ? "Set Harga" : "Update Harga"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Margin / Pax</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardValue
              className={`text-lg ${
                summary.marginPerPax !== null && summary.marginPerPax < 0
                  ? "text-red-600"
                  : ""
              }`}
            >
              {summary.marginPerPax === null
                ? "Isi harga jual dulu"
                : formatCurrency(summary.marginPerPax)}
            </CardValue>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>BEP Pax</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardValue className="text-lg">
              {summary.bepPax === null ? "—" : Math.ceil(summary.bepPax)}
            </CardValue>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
