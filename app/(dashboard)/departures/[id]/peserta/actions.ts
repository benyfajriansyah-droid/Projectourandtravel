"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOneOf, PAYMENT_STATUSES } from "@/lib/types";

export interface FormState {
  error?: string;
}

export async function createParticipant(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireRole(["ADMIN", "SALES"]);

  const departureId = String(formData.get("departureId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const idNumber = String(formData.get("idNumber") ?? "").trim();
  const emergencyContact = String(formData.get("emergencyContact") ?? "").trim();

  if (!departureId || !name || !phone) {
    return { error: "Nama dan nomor telepon peserta wajib diisi." };
  }

  await prisma.participant.create({
    data: {
      departureId,
      name,
      phone,
      idNumber: idNumber || null,
      emergencyContact: emergencyContact || null,
    },
  });

  revalidatePath(`/departures/${departureId}/peserta`);
  revalidatePath(`/departures/${departureId}`);
  return {};
}

export async function updateParticipantStatus(formData: FormData) {
  await requireRole(["ADMIN", "SALES"]);

  const id = String(formData.get("id") ?? "");
  const departureId = String(formData.get("departureId") ?? "");
  const paymentStatus = String(formData.get("paymentStatus") ?? "");

  if (!id || !isOneOf(PAYMENT_STATUSES, paymentStatus)) return;

  await prisma.participant.update({
    where: { id },
    data: { paymentStatus },
  });

  revalidatePath(`/departures/${departureId}/peserta`);
  revalidatePath(`/departures/${departureId}`);
}

export async function deleteParticipant(formData: FormData) {
  await requireRole(["ADMIN", "SALES"]);

  const id = String(formData.get("id") ?? "");
  const departureId = String(formData.get("departureId") ?? "");
  if (!id) return;

  await prisma.participant.delete({ where: { id } });

  revalidatePath(`/departures/${departureId}/peserta`);
  revalidatePath(`/departures/${departureId}`);
}
