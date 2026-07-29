import "server-only";
import { prisma } from "./prisma";

export interface CompanyProfile {
  companyName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  footerNote: string | null;
}

const FALLBACK: CompanyProfile = {
  companyName: "Tour & Travel Ops",
  address: null,
  phone: null,
  email: null,
  website: null,
  footerNote: null,
};

/**
 * Profil perusahaan (baris tunggal). Mengembalikan nilai default bila belum
 * pernah diisi, sehingga aplikasi tetap jalan sebelum admin mengisi Pengaturan.
 */
export async function getCompanyProfile(): Promise<CompanyProfile> {
  let settings;
  try {
    settings = await prisma.settings.findUnique({ where: { id: "default" } });
  } catch (error) {
    // Branding hanya kosmetik: kalau database sedang tak terjangkau, halaman
    // tetap dirender dengan nama default alih-alih gagal total.
    console.error("Gagal memuat profil perusahaan:", error);
    return FALLBACK;
  }
  if (!settings) return FALLBACK;

  return {
    companyName: settings.companyName || FALLBACK.companyName,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    website: settings.website,
    footerNote: settings.footerNote,
  };
}
