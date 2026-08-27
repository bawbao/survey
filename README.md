# Grosir Snack — Aplikasi Kasir, Stok & Stok Opname

Aplikasi web untuk mencatat penjualan dan stok opname grosir makanan ringan.
Dibangun dengan Next.js (App Router) + TypeScript + Tailwind CSS + Prisma +
PostgreSQL, dan bisa dijalankan sebagai server lokal (mirip aplikasi desktop)
maupun di-deploy online agar bisa diakses banyak perangkat sekaligus.

## Fitur

- **Login multi-user** dengan peran **Admin** dan **Kasir** (NextAuth,
  password di-hash dengan bcrypt).
- **Produk & Kategori** — kelola data barang (SKU, barcode, harga beli/jual,
  satuan, stok minimum).
- **Stok** — lihat stok real-time semua barang + **kartu stok** (riwayat
  keluar-masuk) per barang.
- **Pembelian** — catat barang masuk dari supplier, scan barcode untuk
  menambah barang ke daftar, stok otomatis bertambah, bisa dicetak.
- **Penjualan (Kasir)** — scan barcode untuk transaksi, validasi stok
  tersedia, diskon, metode pembayaran, stok otomatis berkurang, cetak struk.
- **Stok Opname** — buat sesi hitung fisik, scan barang untuk menambah
  hitungan (+1 setiap scan) atau isi manual, sistem menghitung selisih
  otomatis, saat diselesaikan stok sistem disesuaikan dengan hasil hitung.
- **Laporan** — penjualan, pembelian, dan stok per periode (harian, mingguan,
  bulanan, atau rentang tanggal bebas), lengkap dengan grafik tren dan daftar
  produk terlaris. Semua laporan bisa dicetak.
- **Cetak** — struk penjualan, bukti pembelian, dan laporan menggunakan
  halaman cetak khusus (tombol "Cetak" memicu dialog print browser) — bisa ke
  printer thermal 80mm maupun printer biasa/PDF.
- **Scan barcode** — didesain untuk scanner USB/Bluetooth (bekerja sebagai
  keyboard). Kolom scan juga mendukung pencarian manual by nama/SKU untuk
  perangkat tanpa scanner.
- Tampilan responsif (desktop & mobile) dengan bahasa Indonesia, dirancang
  agar mudah dipakai orang awam.

## Teknologi

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- TypeScript, Tailwind CSS 4
- [Prisma ORM](https://www.prisma.io/) + PostgreSQL (driver adapter `@prisma/adapter-pg`)
- [NextAuth v5](https://authjs.dev/) (Credentials provider, JWT session)
- [Recharts](https://recharts.org/) untuk grafik laporan
- [Zod](https://zod.dev/) untuk validasi input

## Menjalankan di Lokal

### 1. Prasyarat

- Node.js 20+
- PostgreSQL (lokal, Docker, atau layanan cloud)

### 2. Install dependency

```bash
npm install
```

### 3. Siapkan database

Jalankan PostgreSQL lokal (contoh dengan Docker):

```bash
docker run --name grosir-postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=grosir_app -p 5432:5432 -d postgres:16
```

Atau gunakan PostgreSQL yang sudah terinstall di komputer Anda — cukup buat
database baru bernama `grosir_app`.

### 4. Konfigurasi environment

```bash
cp .env.example .env
```

Sesuaikan `DATABASE_URL` jika perlu. `AUTH_SECRET` sebaiknya diganti nilai
acak (`openssl rand -base64 32`), terutama sebelum dipakai di produksi.

### 5. Migrasi & data awal

```bash
npx prisma migrate dev
npm run db:seed
```

Perintah seed akan membuat:

- Akun **Admin**: `admin@grosir.local` / `admin123`
- Akun **Kasir**: `kasir@grosir.local` / `kasir123`
- Beberapa kategori, produk contoh, dan 1 supplier contoh.

> Ganti password akun default ini setelah login pertama kali (lewat menu
> **Pengguna**, khusus Admin).

### 6. Jalankan aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Karena ini aplikasi
web biasa, komputer toko cukup menjalankan `npm run dev` (atau
`npm run build && npm run start` untuk mode produksi) lalu dibuka lewat
browser — terasa seperti aplikasi desktop, dan device lain di jaringan yang
sama juga bisa mengaksesnya lewat alamat IP komputer tersebut.

## Menyiapkan Scanner Barcode

Aplikasi ini didesain untuk scanner barcode USB atau Bluetooth yang bekerja
sebagai keyboard (mode "HID keyboard wedge") — ini adalah mode default
hampir semua scanner barcode genggam yang dijual di pasaran, jadi biasanya
tidak perlu instalasi driver tambahan:

1. Sambungkan scanner ke komputer/laptop (USB) atau pasangkan lewat
   Bluetooth.
2. Klik pada kolom **"Scan barcode..."** di halaman Penjualan, Pembelian,
   atau Stok Opname supaya kursor aktif di kolom tersebut.
3. Scan barang — kode barcode akan otomatis terisi dan barang langsung
   ditambahkan ke daftar transaksi.
4. Tanpa scanner pun kolom yang sama bisa dipakai untuk mengetik nama/SKU
   barang secara manual — hasil pencarian akan muncul untuk dipilih.

## Deploy ke Cloud (Produksi)

Karena data disimpan di PostgreSQL, aplikasi ini bisa di-deploy ke provider
mana pun yang mendukung Next.js + PostgreSQL, misalnya:

1. **Database**: buat database PostgreSQL di [Supabase](https://supabase.com),
   [Neon](https://neon.tech), [Railway](https://railway.app), atau provider
   lain, lalu salin connection string-nya ke `DATABASE_URL`.
2. **Aplikasi**: deploy folder ini ke [Vercel](https://vercel.com),
   [Railway](https://railway.app), atau VPS sendiri. Set environment
   variable `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_SECRET`, dan
   `NEXTAUTH_URL` (isi dengan domain produksi).
3. Jalankan migrasi di database produksi: `npx prisma migrate deploy`.
4. (Opsional) jalankan `npm run db:seed` sekali untuk akun admin awal, atau
   buat akun admin pertama secara manual lewat `npx prisma studio`.

Setelah online, aplikasi bisa diakses dari HP, tablet, atau komputer mana
pun — kasir di toko dan pemilik yang memantau dari luar bisa memakai data
yang sama secara real-time.

## Struktur Folder Singkat

```
prisma/schema.prisma       Skema database (produk, transaksi, stok, dll)
prisma/seed.ts             Data awal (akun & produk contoh)
src/auth.ts, auth.config.ts, middleware konfigurasi NextAuth + proteksi peran
src/app/(app)/...          Halaman utama (perlu login) — dashboard, produk,
                            stok, pembelian, penjualan, opname, laporan, users
src/app/print/...          Halaman cetak (struk, bukti pembelian, laporan)
src/app/api/...            REST API (dipakai oleh halaman & komponen scan)
src/components/            Komponen UI, layout, dan komponen scan barcode
src/lib/                   Prisma client, helper laporan, validasi, format
```

## Perintah Berguna

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Jalankan server pengembangan |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan hasil build produksi |
| `npm run lint` | Cek lint |
| `npm run db:migrate` | Jalankan migrasi Prisma (dev) |
| `npm run db:seed` | Isi data awal (akun & produk contoh) |
| `npm run db:studio` | Buka Prisma Studio untuk lihat/edit data langsung |
