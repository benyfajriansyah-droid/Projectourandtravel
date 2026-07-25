import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tour & Travel Ops",
  description: "Sistem internal operasional tour & travel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  );
}
