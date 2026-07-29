import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCompanyProfile } from "@/lib/settings";
import { renderManifestPdf, type ManifestData } from "@/lib/pdf/manifest-document";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ departureId: string }> }
) {
  // Manifest dibutuhkan tim lapangan, jadi semua role yang sudah login boleh cetak.
  await requireSession();
  const { departureId } = await params;

  const [departure, company] = await Promise.all([
    prisma.departure.findUnique({
      where: { id: departureId },
      include: {
        trip: true,
        participants: {
          where: { paymentStatus: { not: "CANCELLED" } },
          orderBy: { name: "asc" },
        },
      },
    }),
    getCompanyProfile(),
  ]);

  if (!departure) {
    return NextResponse.json(
      { error: "Keberangkatan tidak ditemukan" },
      { status: 404 }
    );
  }

  const data: ManifestData = {
    tripName: departure.trip.name,
    destination: departure.trip.destination,
    departureDate: departure.departureDate,
    returnDate: departure.returnDate,
    participants: departure.participants.map((p) => ({
      name: p.name,
      phone: p.phone,
      idNumber: p.idNumber,
      emergencyContact: p.emergencyContact,
      paymentStatus: p.paymentStatus,
    })),
  };

  const buffer = await renderManifestPdf(data, company);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="manifest-${departure.id}.pdf"`,
    },
  });
}
