# Tour & Travel Ops

Sistem internal (back-office) untuk tim tour & travel: estimasi biaya
keberangkatan otomatis (HPP, margin, BEP), manajemen peserta/booking,
laporan keuangan, dokumen cetak berlogo perusahaan, dan dashboard
ringkasan. Bukan marketplace publik — akun dibuat oleh admin untuk tim
sendiri.

## Fitur Utama

- **Kalkulator biaya keberangkatan** — input komponen biaya (flat /
  per peserta), lalu HPP, cost per pax, margin, dan BEP dihitung otomatis
- **Manajemen peserta** — data peserta, status DP/Lunas, pencarian
- **Keuangan** — catat pemasukan/pengeluaran, laporan laba-rugi per trip
  dan per bulan, riwayat transaksi
- **Dokumen cetak** — kwitansi PDF (dengan terbilang) dan manifest peserta
  PDF, keduanya memakai kop perusahaan dari menu Pengaturan
- **Export Excel/CSV** — laporan keuangan bulanan dan daftar peserta
- **Akses berbasis peran** — 4 role dengan hak berbeda
- **Responsif** — tata letak khusus desktop dan mobile (sidebar jadi drawer,
  tabel jadi kartu), sudah diuji di kedua ukuran layar

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + komponen UI buatan sendiri (pola shadcn/ui,
  lihat `components/ui/`) — termasuk toast, dialog konfirmasi, skeleton
- Prisma ORM 7 + **PostgreSQL** via driver adapter `@prisma/adapter-pg`
- Auth berbasis session JWT (`jose`) + `proxy.ts` (pengganti middleware
  di Next 16) untuk proteksi route per role
- Recharts (dimuat lazy) untuk grafik tren keuangan
- `@react-pdf/renderer` untuk kwitansi & manifest PDF
- Vitest untuk unit test logic bisnis (`lib/calculations.ts`, `lib/terbilang.ts`)

## Role

| Role | Akses |
|---|---|
| Admin | Semua modul |
| Finance | Keuangan, kalkulator biaya, lihat peserta (read-only) |
| Sales | Manajemen peserta (CRUD), lihat trip/keberangkatan |
| Operasional | Lihat manifest peserta & jadwal keberangkatan (read-only) |

## Database (PostgreSQL)

Aplikasi ini butuh PostgreSQL — tidak lagi pakai SQLite. Pilih salah satu:

- **Prisma Postgres** (gratis, cepat): buat akun di [console.prisma.io](https://console.prisma.io),
  buat service token (Workspace Settings → Service Tokens), lalu provision
  database lewat `npx create-db` atau Prisma Console.
- **Provider lain**: Supabase, Neon, Railway, atau instance Postgres sendiri —
  tinggal ambil connection string-nya.

Isi `DATABASE_URL` di `.env` dengan connection string tersebut (format:
`postgresql://user:password@host:5432/dbname`).

## Menjalankan Secara Lokal

```bash
npm install
cp .env.example .env   # isi DATABASE_URL (Postgres) dan SESSION_SECRET
npx prisma migrate dev # terapkan migration ke database Postgres kamu
npm run db:seed        # buat akun admin awal
npm run dev
```

Login awal setelah seed: `admin@travel.local` / `admin123` (segera
ganti password / buat akun baru lewat menu **Tim & User**).

## Deploy ke Production

Direkomendasikan pakai **Vercel** (native support Next.js, tinggal connect
akun GitHub, tanpa setup server manual):

1. Push repo ini ke GitHub (branch apa saja).
2. Buka [vercel.com](https://vercel.com) → **Add New Project** → import repo ini.
3. Di bagian **Environment Variables**, isi `DATABASE_URL` dan `SESSION_SECRET`
   (sama seperti di `.env` lokal, tapi database production sebaiknya
   terpisah dari database development).
4. Deploy. Setelah deploy pertama, jalankan migration ke database production
   sekali (`npx prisma migrate deploy` dari mesin yang punya akses ke
   `DATABASE_URL` production, atau tambahkan sebagai build step di Vercel).
5. Jalankan `npm run db:seed` sekali (atau buat akun admin manual lewat
   Prisma Studio / SQL) untuk akun admin pertama di production.

## Struktur Modul

| Route | Fungsi |
|---|---|
| `/dashboard` | Ringkasan operasional + grafik tren keuangan |
| `/trips` | Daftar & pencarian paket trip |
| `/trips/[tripId]` | Detail trip + jadwal keberangkatan |
| `/departures/[id]` | Ringkasan satu keberangkatan |
| `/departures/[id]/estimasi` | Kalkulator biaya → HPP, margin, BEP |
| `/departures/[id]/peserta` | Manajemen peserta & status pembayaran |
| `/keuangan` | Transaksi + laporan laba-rugi bulanan |
| `/users` | Kelola akun tim & role (admin) |
| `/pengaturan` | Profil perusahaan untuk kop dokumen (admin) |

Endpoint dokumen & export:

| Endpoint | Hasil |
|---|---|
| `/api/kwitansi/[paymentId]` | Kwitansi PDF (A5) |
| `/api/manifest/[departureId]` | Manifest peserta PDF (A4) |
| `/api/export/keuangan?month=YYYY-MM` | Laporan keuangan CSV |
| `/api/export/peserta/[departureId]` | Daftar peserta CSV |

## Menyesuaikan Branding

Menu **Pengaturan** (admin) mengisi nama perusahaan, alamat, kontak, dan
catatan kaki. Data itu langsung dipakai di sidebar, halaman login, kwitansi,
dan manifest — jadi satu instalasi bisa dipakai travel mana pun tanpa
mengubah kode.

## Perintah Lain

```bash
npm run build       # production build
npm run lint         # eslint
npm run test         # jalankan unit test (vitest)
npm run db:migrate   # jalankan migrasi Prisma baru
npm run db:seed      # jalankan ulang seed admin
```

## Belum Ada (Roadmap)

- Upload logo perusahaan (saat ini branding masih berupa teks)
- Upload dokumen peserta (KTP/paspor)
- Notifikasi/reminder pembayaran jatuh tempo
- Mode gelap
- Backup otomatis database (tergantung provider Postgres yang dipakai —
  sebagian besar seperti Prisma Postgres/Supabase/Neon sudah punya backup
  bawaan, tinggal diaktifkan)
