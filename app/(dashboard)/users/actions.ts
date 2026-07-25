"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOneOf } from "@/lib/types";

const ROLES = ["ADMIN", "FINANCE", "SALES", "OPERASIONAL"] as const;

export interface FormState {
  error?: string;
}

export async function createUser(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireRole(["ADMIN"]);

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!name || !email || password.length < 6) {
    return {
      error: "Nama, email wajib diisi, password minimal 6 karakter.",
    };
  }
  if (!isOneOf(ROLES, role)) {
    return { error: "Role tidak valid." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email sudah terdaftar." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  revalidatePath("/users");
  return {};
}

export async function updateUserRole(formData: FormData) {
  await requireRole(["ADMIN"]);

  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!id || !isOneOf(ROLES, role)) return;

  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/users");
}

export async function deleteUser(formData: FormData) {
  const session = await requireRole(["ADMIN"]);

  const id = String(formData.get("id") ?? "");
  if (!id || id === session.userId) return;

  await prisma.user.delete({ where: { id } });
  revalidatePath("/users");
}
