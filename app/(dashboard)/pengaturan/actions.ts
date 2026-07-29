"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface FormState {
  error?: string;
  success?: boolean;
}

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

export async function updateSettings(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireRole(["ADMIN"]);

  const companyName = String(formData.get("companyName") ?? "").trim();
  if (!companyName) {
    return { error: "Nama perusahaan wajib diisi." };
  }

  const data = {
    companyName,
    address: clean(formData.get("address")),
    phone: clean(formData.get("phone")),
    email: clean(formData.get("email")),
    website: clean(formData.get("website")),
    footerNote: clean(formData.get("footerNote")),
  };

  await prisma.settings.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });

  // Nama perusahaan tampil di sidebar seluruh halaman.
  revalidatePath("/", "layout");
  return { success: true };
}
