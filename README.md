# Tour & Travel Ops

Sistem internal (back-office) untuk tim tour & travel: estimasi biaya
keberangkatan otomatis (HPP, margin, BEP), manajemen peserta/booking,
laporan keuangan, dan dashboard ringkasan. Bukan marketplace publik —
akun dibuat oleh admin untuk tim sendiri.

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + komponen UI kecil buatan sendiri (pola shadcn/ui,
  lihat `components/ui/`)
- Prisma ORM 7 + SQLite (dev) via driver adapter `@prisma/adapter-better-sqlite3`
- Auth berbasis session JWT (`jose`) + `proxy.ts` (pengganti middleware
  di Next 16) untuk proteksi route per role
- Recharts untuk grafik tren keuangan

## Role

| Role | Akses |
|---|---|
| Admin | Semua modul |
| Finance | Keuangan, kalkulator biaya, lihat peserta (read-only) |
| Sales | Manajemen peserta (CRUD), lihat trip/keberangkatan |
| Operasional | Lihat manifest peserta & jadwal keberangkatan (read-only) |

## Menjalankan Secara Lokal

```bash
npm install
cp .env.example .env   # lalu isi SESSION_SECRET (lihat komentar di file)
npx prisma migrate dev
npm run db:seed        # buat akun admin awal
npm run dev
```

Login awal setelah seed: `admin@travel.local` / `admin123` (segera
ganti password / buat akun baru lewat menu **Tim & User**).

## Struktur Modul

- `/trips` — Trip & jadwal keberangkatan
- `/departures/[id]/estimasi` — Kalkulator estimasi biaya (HPP, margin, BEP)
- `/departures/[id]/peserta` — Manajemen peserta & status pembayaran
- `/keuangan` — Catat transaksi & laporan laba-rugi
- `/users` — Kelola akun tim & role (admin only)

## Perintah Lain

```bash
npm run build      # production build
npm run lint        # eslint
npm run db:migrate  # jalankan migrasi Prisma baru
npm run db:seed     # jalankan ulang seed admin
```
