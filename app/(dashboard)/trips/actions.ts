"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOneOf, TRIP_TYPES, DEPARTURE_STATUSES } from "@/lib/types";

export interface FormState {
  error?: string;
}

export async function createTrip(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireRole(["ADMIN"]);

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const destination = String(formData.get("destination") ?? "").trim();
  const durationDays = Number(formData.get("durationDays") ?? 0);
  const description = String(formData.get("description") ?? "").trim();

  if (!name || !destination || !durationDays || durationDays < 1) {
    return { error: "Nama, destinasi, dan durasi wajib diisi dengan benar." };
  }
  if (!isOneOf(TRIP_TYPES, type)) {
    return { error: "Jenis trip tidak valid." };
  }

  await prisma.trip.create({
    data: {
      name,
      type,
      destination,
      durationDays,
      description: description || null,
    },
  });

  revalidatePath("/trips");
  return {};
}

export async function createDeparture(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireRole(["ADMIN"]);

  const tripId = String(formData.get("tripId") ?? "");
  const departureDate = String(formData.get("departureDate") ?? "");
  const returnDate = String(formData.get("returnDate") ?? "");
  const minPax = Number(formData.get("minPax") ?? 0);
  const maxPax = Number(formData.get("maxPax") ?? 0);

  if (!tripId || !departureDate || !returnDate) {
    return { error: "Tanggal keberangkatan & kepulangan wajib diisi." };
  }
  if (minPax < 1 || maxPax < minPax) {
    return { error: "Jumlah peserta min/maks tidak valid." };
  }

  await prisma.departure.create({
    data: {
      tripId,
      departureDate: new Date(departureDate),
      returnDate: new Date(returnDate),
      minPax,
      maxPax,
    },
  });

  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}`);
}

export async function updateDepartureStatus(formData: FormData) {
  await requireRole(["ADMIN"]);

  const departureId = String(formData.get("departureId") ?? "");
  const status = String(formData.get("status") ?? "");
  const tripId = String(formData.get("tripId") ?? "");

  if (!departureId || !isOneOf(DEPARTURE_STATUSES, status)) return;

  await prisma.departure.update({
    where: { id: departureId },
    data: { status },
  });

  revalidatePath(`/departures/${departureId}`);
  if (tripId) revalidatePath(`/trips/${tripId}`);
}
