import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tour & Travel Ops",
    template: "%s · Tour & Travel Ops",
  },
  description:
    "Sistem operasional internal untuk biro perjalanan: estimasi biaya keberangkatan, manajemen peserta, dan laporan keuangan.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  // Biarkan pengguna zoom di perangkat kecil (aksesibilitas).
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  );
}
