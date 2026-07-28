import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { renderKwitansiPdf, type KwitansiData } from "@/lib/pdf/kwitansi-document";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  await requireRole(["ADMIN", "FINANCE"]);
  const { paymentId } = await params;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      departure: { include: { trip: true } },
      participant: true,
    },
  });

  if (!payment) {
    return NextResponse.json(
      { error: "Transaksi tidak ditemukan" },
      { status: 404 }
    );
  }

  const data: KwitansiData = {
    id: payment.id,
    date: payment.date,
    amount: payment.amount,
    category: payment.category,
    note: payment.note,
    method: payment.method,
    participantName: payment.participant?.name ?? null,
    tripName: payment.departure?.trip.name ?? null,
    departureDateLabel: payment.departure
      ? formatDate(payment.departure.departureDate)
      : null,
  };

  const buffer = await renderKwitansiPdf(data);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="kwitansi-${payment.id}.pdf"`,
    },
  });
}
