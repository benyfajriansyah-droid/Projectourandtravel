"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOneOf, TRANSACTION_TYPES } from "@/lib/types";

export interface FormState {
  error?: string;
  success?: boolean;
}

export async function createPayment(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireRole(["ADMIN", "FINANCE"]);

  const type = String(formData.get("type") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const date = String(formData.get("date") ?? "");
  const method = String(formData.get("method") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const departureId = String(formData.get("departureId") ?? "").trim();
  const participantId = String(formData.get("participantId") ?? "").trim();

  if (!isOneOf(TRANSACTION_TYPES, type)) {
    return { error: "Jenis transaksi tidak valid." };
  }
  if (amount <= 0 || !date) {
    return { error: "Nominal dan tanggal wajib diisi dengan benar." };
  }

  // Peserta hanya valid bila benar-benar milik keberangkatan yang dipilih,
  // supaya nama di kwitansi tidak tertukar.
  let validParticipantId: string | null = null;
  if (participantId && departureId) {
    const participant = await prisma.participant.findFirst({
      where: { id: participantId, departureId },
      select: { id: true },
    });
    validParticipantId = participant?.id ?? null;
  }

  await prisma.payment.create({
    data: {
      type,
      amount,
      date: new Date(date),
      method: method || null,
      category: category || null,
      note: note || null,
      departureId: departureId || null,
      participantId: validParticipantId,
    },
  });

  revalidatePath("/keuangan");
  if (departureId) revalidatePath(`/departures/${departureId}`);
  return { success: true };
}

export async function deletePayment(formData: FormData) {
  await requireRole(["ADMIN", "FINANCE"]);

  const id = String(formData.get("id") ?? "");
  const departureId = String(formData.get("departureId") ?? "");
  if (!id) return;

  await prisma.payment.delete({ where: { id } });

  revalidatePath("/keuangan");
  if (departureId) revalidatePath(`/departures/${departureId}`);
}
