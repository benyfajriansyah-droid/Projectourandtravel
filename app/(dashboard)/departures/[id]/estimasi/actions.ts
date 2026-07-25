"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOneOf, COST_CATEGORIES, COST_UNITS } from "@/lib/types";

export interface FormState {
  error?: string;
}

export async function addCostComponent(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireRole(["ADMIN", "FINANCE"]);

  const departureId = String(formData.get("departureId") ?? "");
  const category = String(formData.get("category") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const qty = Number(formData.get("qty") ?? 1);

  if (!departureId || !name) {
    return { error: "Nama komponen biaya wajib diisi." };
  }
  if (!isOneOf(COST_CATEGORIES, category)) {
    return { error: "Kategori tidak valid." };
  }
  if (!isOneOf(COST_UNITS, unit)) {
    return { error: "Satuan tidak valid." };
  }
  if (amount < 0 || qty < 1) {
    return { error: "Nominal atau jumlah tidak valid." };
  }

  await prisma.costComponent.create({
    data: { departureId, category, name, unit, amount, qty },
  });

  revalidatePath(`/departures/${departureId}/estimasi`);
  revalidatePath(`/departures/${departureId}`);
  return {};
}

export async function deleteCostComponent(formData: FormData) {
  await requireRole(["ADMIN", "FINANCE"]);

  const id = String(formData.get("id") ?? "");
  const departureId = String(formData.get("departureId") ?? "");
  if (!id) return;

  await prisma.costComponent.delete({ where: { id } });

  revalidatePath(`/departures/${departureId}/estimasi`);
  revalidatePath(`/departures/${departureId}`);
}

export async function updateDeparturePrice(formData: FormData) {
  await requireRole(["ADMIN", "FINANCE"]);

  const departureId = String(formData.get("departureId") ?? "");
  const pricePerPax = Number(formData.get("pricePerPax") ?? 0);
  if (!departureId || pricePerPax < 0) return;

  await prisma.departure.update({
    where: { id: departureId },
    data: { pricePerPax },
  });

  revalidatePath(`/departures/${departureId}/estimasi`);
  revalidatePath(`/departures/${departureId}`);
}
