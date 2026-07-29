import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv, csvResponse } from "@/lib/csv";
import { formatDate } from "@/lib/utils";
import { PAYMENT_STATUS_LABEL } from "@/lib/labels";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ departureId: string }> }
) {
  await requireSession();
  const { departureId } = await params;

  const departure = await prisma.departure.findUnique({
    where: { id: departureId },
    include: {
      trip: true,
      participants: { orderBy: { name: "asc" } },
    },
  });

  if (!departure) {
    return NextResponse.json(
      { error: "Keberangkatan tidak ditemukan" },
      { status: 404 }
    );
  }

  const csv = toCsv(
    [
      "No",
      "Nama",
      "Telepon",
      "No. Identitas",
      "Kontak Darurat",
      "Status Bayar",
      "Terdaftar",
    ],
    departure.participants.map((p, i) => [
      i + 1,
      p.name,
      p.phone,
      p.idNumber ?? "",
      p.emergencyContact ?? "",
      PAYMENT_STATUS_LABEL[p.paymentStatus] ?? p.paymentStatus,
      formatDate(p.createdAt),
    ])
  );

  const slug = departure.trip.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return csvResponse(`peserta-${slug}-${departure.id.slice(0, 6)}.csv`, csv);
}
