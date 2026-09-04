# PRD — Aplikasi Kasir, Stok & Stok Opname Grosir Makanan Ringan

| | |
|---|---|
| **Nama Produk** | Grosir Snack — Aplikasi Kasir, Stok & Stok Opname |
| **Versi Dokumen** | 1.0 |
| **Status** | Implemented (MVP berjalan) |
| **Domain** | Retail / Grosir Makanan Ringan (Small Business POS & Inventory) |
| **Bahasa Aplikasi** | Bahasa Indonesia |
| **Repositori** | `bawbao/survey` — branch `claude/sales-inventory-app-jjw1x1` |

---

## 1. Ringkasan Eksekutif

Aplikasi ini adalah sistem pencatatan penjualan (kasir), stok, dan stok
opname berbasis web untuk usaha grosir makanan ringan skala kecil-menengah.
Aplikasi menggantikan pencatatan manual (buku/Excel) dengan satu sistem
terpusat yang menangani seluruh siklus operasional toko: pencatatan barang
masuk dari supplier (pembelian), penjualan ke pelanggan (kasir), penghitungan
stok fisik berkala (stok opname), pencatatan biaya operasional (pengeluaran),
serta pelaporan penjualan/pembelian/stok/laba secara otomatis dan real-time.

Aplikasi dirancang **mobile-first dari sisi kemudahan pakai** (orang awam,
bukan hanya developer) dengan dukungan **scan barcode** di setiap alur
transaksi, dan bisa dijalankan baik sebagai **aplikasi web di cloud**
(diakses dari mana saja) maupun **dijalankan lokal di 1 PC toko** (tanpa
biaya hosting bulanan, cocok untuk toko yang tidak butuh akses jarak jauh).

---

## 2. Latar Belakang & Masalah

Grosir makanan ringan skala kecil umumnya masih mencatat penjualan dan stok
secara manual, menimbulkan masalah:

1. **Stok tidak akurat** — selisih antara catatan dan stok fisik baru
   diketahui saat barang sudah habis atau menumpuk berlebih.
2. **Tidak ada visibilitas laba** — pemilik tidak tahu produk mana yang
   sebenarnya menguntungkan setelah dikurangi biaya operasional (gaji,
   sewa, dll), karena pencatatan manual jarang memisahkan modal barang dari
   biaya operasional.
3. **Proses pencatatan lambat** — pencatatan manual per transaksi memakan
   waktu, rawan salah tulis kode/harga barang.
4. **Tidak ada jejak audit** — sulit menelusuri riwayat pergerakan stok
   satu barang tertentu (kapan masuk, kapan keluar, karena transaksi apa).
5. **Data rawan hilang** — dicatat di buku fisik atau spreadsheet lokal
   tanpa cadangan.

## 3. Tujuan & Sasaran

| Tujuan | Ukuran Keberhasilan |
|---|---|
| Percepat pencatatan transaksi | Satu transaksi penjualan/pembelian bisa dicatat < 1 menit dengan scan barcode |
| Stok selalu akurat | Selisih stok sistem vs fisik terlihat & bisa dikoreksi lewat Stok Opname kapan saja |
| Visibilitas laba real-time | Laba kotor & laba bersih per periode tersedia otomatis tanpa hitung manual |
| Mudah dipakai orang awam | Navigasi berbahasa Indonesia, alur linear, minim istilah teknis |
| Data aman | Tersedia mekanisme backup/restore mandiri, khususnya untuk instalasi lokal/offline |
| Fleksibel infrastruktur | Bisa dijalankan cloud (multi-device) maupun lokal 1 PC (tanpa biaya bulanan) |

## 4. Target Pengguna & Peran

Aplikasi multi-user dengan 2 peran:

### 4.1 Admin (pemilik / manajer toko)
- Akses penuh ke semua modul.
- Mengelola data master (produk, kategori, supplier, pengguna).
- Melihat data finansial sensitif: harga beli, modal, laba kotor/bersih,
  pengeluaran operasional.
- Mengelola stok opname, pembelian, laporan, pengaturan & backup.
- Bisa membatalkan (hapus) transaksi penjualan/pembelian.

### 4.2 Kasir (staf toko)
- Fokus pada operasional harian: mencatat penjualan, melihat stok.
- **Tidak** bisa melihat harga beli/modal, laba, pengeluaran, atau data
  pengguna lain.
- Tidak bisa mengubah data master produk maupun membatalkan transaksi.

---

## 5. Ruang Lingkup

### 5.1 Dalam Ruang Lingkup (Implemented)
- Autentikasi multi-user berbasis peran (Admin/Kasir)
- Manajemen produk & kategori (CRUD, aktif/nonaktifkan, hapus permanen)
- Manajemen stok real-time + kartu stok (ledger pergerakan stok)
- Pembelian barang dari supplier (dengan manajemen data supplier)
- Penjualan/kasir dengan validasi stok tersedia
- Stok opname (hitung fisik, hitung selisih, penyesuaian otomatis)
- Pendaftaran barang baru langsung dari alur scan (quick-add)
- Pengeluaran operasional dengan kategori custom
- Laporan: Penjualan, Pembelian, Stok, Laba Kotor, Laba Bersih
- Cetak: struk penjualan, bukti pembelian, semua jenis laporan
- Manajemen pengguna (Admin & Kasir)
- Backup & restore seluruh data aplikasi (file JSON)
- Pembatalan (hapus) transaksi penjualan & pembelian dengan pembalikan stok otomatis
- Dashboard ringkasan harian

### 5.2 Di Luar Ruang Lingkup (v1 / belum diimplementasikan)
- Multi-tenant (1 deployment hanya untuk 1 toko/bisnis)
- Multi-cabang/multi-outlet dalam 1 akun
- Integrasi pembayaran digital (payment gateway, QRIS otomatis terverifikasi)
- Aplikasi mobile native (Android/iOS) — saat ini web responsif
- Notifikasi otomatis (email/WhatsApp) untuk stok menipis
- Manajemen piutang/utang pelanggan-supplier
- Sistem diskon/promo bertingkat otomatis
- Multi-currency
- Backup otomatis terjadwal di dalam aplikasi (saat ini manual via tombol unduh)
- Fitur audit-log/histori perubahan data master secara rinci

---

## 6. Tech Stack

### 6.1 Frontend & Framework Aplikasi
| Komponen | Teknologi | Keterangan |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | Full-stack — UI & API dalam satu aplikasi |
| Bahasa | **TypeScript** | Type-safety di seluruh codebase |
| Styling | **Tailwind CSS 4** | Desain custom, tanpa UI kit pihak ketiga |
| Komponen UI | Custom (Button, Card, Modal, Input, Badge, Alert, EmptyState) | Dibangun sendiri, konsisten dengan tema warna brand |
| Ikon | **lucide-react** | |
| Grafik | **Recharts** | Grafik tren laporan (bar chart harian) |
| Font | Geist (via `next/font/google`) | |

### 6.2 Backend & Data
| Komponen | Teknologi | Keterangan |
|---|---|---|
| API | Next.js Route Handlers (`app/api/**`) | REST-style JSON API |
| ORM | **Prisma ORM 7** (generator `prisma-client`) | Skema di `prisma/schema.prisma` |
| Database | **PostgreSQL** | Driver adapter `@prisma/adapter-pg` (koneksi via `pg`) |
| Autentikasi | **NextAuth v5** (Credentials provider) | Sesi JWT, tanpa database session |
| Hash Password | **bcryptjs** | |
| Validasi Input | **Zod** | Skema validasi di setiap endpoint API |

### 6.3 Infrastruktur & Deployment
| Komponen | Opsi | Keterangan |
|---|---|---|
| Hosting Aplikasi | **Vercel** (cloud) atau **PC lokal** (`npm run start`) | Kode sama untuk kedua mode |
| Database Cloud | **Neon** (PostgreSQL serverless) — atau Supabase/Railway | Connection string via `DATABASE_URL` |
| Database Lokal | PostgreSQL terinstall langsung di PC toko | |
| Migrasi Schema | `prisma migrate deploy` (otomatis lewat script `vercel-build`) | |
| Setup Data Awal | Endpoint `/api/setup` (one-time, aman dijalankan berkali-kali) | Alternatif dari `npm run db:seed` |

### 6.4 Struktur Middleware & Proteksi
- `src/proxy.ts` — middleware Next.js (Edge runtime) untuk redirect
  login & pembatasan halaman khusus Admin berdasarkan prefix URL.
- `src/auth.config.ts` — konfigurasi NextAuth yang aman dijalankan di Edge
  (tanpa Prisma), dipakai middleware.
- `src/auth.ts` — konfigurasi penuh NextAuth (dengan Credentials provider +
  Prisma), dipakai di Server Component & API routes (Node.js runtime).
- Setiap API route memanggil `requireApiUser()` atau `requireApiAdmin()`
  (helper di `src/lib/api-auth.ts`) sebagai lapis proteksi kedua,
  independen dari middleware (defense-in-depth).

### 6.5 Struktur Direktori Kunci
```
prisma/schema.prisma       Skema database
prisma/seed.ts              Seed data awal (dev lokal)
src/lib/seed-data.ts        Logika seed bersama (dipakai seed.ts & /api/setup)
src/app/(app)/...           Halaman utama (perlu login)
src/app/print/...           Halaman cetak (struk, bukti, laporan)
src/app/api/...             REST API
src/components/             Komponen UI, layout, komponen scan barcode
src/lib/                    Prisma client, helper laporan, validasi, format
```

---

## 7. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Admin / Kasir)                  │
│   Desktop / Tablet / HP — scanner barcode USB/Bluetooth      │
└───────────────────────────┬────────────────────────────────┘
                             │ HTTPS
┌───────────────────────────▼────────────────────────────────┐
│                Next.js App (Vercel atau PC lokal)             │
│  ┌─────────────┐  ┌───────────────┐  ┌────────────────────┐ │
│  │ App Router  │  │ Middleware    │  │ API Route Handlers │ │
│  │ (RSC pages) │  │ (auth guard)  │  │ (REST, Zod valid.) │ │
│  └─────────────┘  └───────────────┘  └──────────┬─────────┘ │
└──────────────────────────────────────────────────┼──────────┘
                                                     │ Prisma + pg
                                          ┌──────────▼─────────┐
                                          │   PostgreSQL       │
                                          │ (Neon cloud / lokal)│
                                          └─────────────────────┘
```

- **Server Components** melakukan query langsung ke database (via Prisma)
  untuk render awal (SSR), meminimalkan round-trip client.
- **Client Components** (form, tabel interaktif, modal) memanggil API route
  lewat `fetch` untuk aksi CRUD & pencarian real-time.
- Semua operasi yang mengubah stok (pembelian, penjualan, stok opname
  selesai, hapus transaksi) dibungkus **Prisma transaction** — perubahan
  `Product.stock` dan pencatatan `StockMovement` terjadi atomik.

---

## 8. Model Data

### 8.1 Entitas Utama

| Model | Deskripsi |
|---|---|
| `User` | Akun pengguna (Admin/Kasir), password ter-hash bcrypt |
| `Category` | Kategori produk |
| `Product` | Data barang: SKU, barcode, harga beli/jual, stok, stok minimum |
| `Supplier` | Data pemasok |
| `Purchase` + `PurchaseItem` | Transaksi pembelian & rincian barangnya |
| `Sale` + `SaleItem` | Transaksi penjualan & rincian barangnya (termasuk snapshot `buyPriceAtSale` untuk akurasi laporan laba historis) |
| `StockOpname` + `StockOpnameItem` | Sesi stok opname & rincian per barang (stok sistem vs aktual) |
| `StockMovement` | **Ledger/kartu stok** — setiap kejadian yang mengubah stok (Pembelian/Penjualan/Penyesuaian Opname/Manual), menyimpan saldo setelah pergerakan |
| `ExpenseCategory` | Kategori pengeluaran operasional (custom, dikelola Admin) |
| `Expense` | Catatan pengeluaran operasional (gaji, sewa, dll) |

### 8.2 Diagram Relasi (ringkas)

```
User ──< Purchase ──< PurchaseItem >── Product >── Category
User ──< Sale ──< SaleItem >── Product
User ──< StockOpname ──< StockOpnameItem >── Product
User ──< Expense >── ExpenseCategory
Product ──< StockMovement >── (Purchase | Sale | StockOpname, opsional)
Supplier ──< Purchase
```

### 8.3 Aturan Kunci Model Data
- **Stok bukan hasil kalkulasi on-the-fly** — `Product.stock` adalah kolom
  yang di-update langsung di setiap transaksi (increment/decrement) di
  dalam transaction yang sama dengan pencatatan `StockMovement`, untuk
  performa (tidak perlu SUM seluruh histori tiap kali menampilkan stok).
- **`StockMovement.balance`** menyimpan saldo *setelah* pergerakan
  tersebut — sehingga kartu stok bisa ditampilkan tanpa kalkulasi ulang.
- **`SaleItem.buyPriceAtSale`** adalah snapshot harga beli produk *pada
  saat transaksi terjadi* — dipakai laporan laba supaya tidak berubah
  retroaktif kalau harga beli produk diperbarui di kemudian hari. Baris
  lama (sebelum kolom ini ada) jatuh balik ke harga beli produk saat ini.
- Semua ID memakai **cuid** (bukan auto-increment), memudahkan restore
  data dari backup tanpa konflik ID.

---

## 9. Proses Bisnis per Modul

### 9.1 Autentikasi
1. Pengguna membuka aplikasi → diarahkan ke `/login` jika belum login.
2. Login dengan email + password → NextAuth memverifikasi via bcrypt.
3. Sesi JWT menyimpan `id` dan `role` pengguna.
4. Middleware mengecek setiap request: kalau belum login → redirect ke
   `/login`; kalau mencoba akses halaman khusus Admin sebagai Kasir →
   redirect ke Dashboard.

### 9.2 Manajemen Produk & Kategori (Admin)
1. Admin membuka **Produk** → melihat daftar (filter kategori, status
   aktif/semua, pencarian nama/SKU/barcode).
2. **Tambah/Ubah**: isi nama, SKU, barcode, kategori, satuan, harga
   beli/jual, stok, stok minimum.
3. **Nonaktifkan/Aktifkan**: sembunyikan produk dari alur transaksi tanpa
   menghapus data (dipakai untuk barang yang sudah tidak dijual tapi
   masih punya riwayat transaksi).
4. **Hapus**: hapus permanen — hanya berhasil jika produk **belum pernah**
   dipakai di transaksi apa pun (dicegah sistem lewat foreign key
   constraint); kalau sudah dipakai, sistem menyarankan Nonaktifkan.
5. **Kategori** dikelola lewat modal terpisah (tambah/ubah/hapus).

### 9.3 Manajemen Stok
1. Halaman **Stok** menampilkan stok real-time semua produk + badge
   "Menipis" untuk yang stoknya ≤ stok minimum.
2. Klik satu produk → **Kartu Stok**: riwayat lengkap pergerakan (jenis,
   perubahan +/-, saldo, siapa & kapan, catatan) — sumber kebenaran untuk
   audit "kenapa stok segini".

### 9.4 Pembelian (Admin)
1. Buka **Pembelian → Pembelian Baru**.
2. Scan barcode barang (atau cari manual) → otomatis masuk ke daftar
   dengan harga beli default dari data produk (bisa diedit).
3. Kalau barang belum terdaftar → muncul opsi **"Daftarkan sebagai barang
   baru"** (isi nama, harga beli/jual, stok awal) langsung dari alur ini.
4. Pilih/tambah supplier, isi catatan opsional.
5. Simpan → sistem membuat nomor invoice otomatis (`PB-YYYYMMDD-NNNN`),
   menambah stok tiap barang, dan mencatat `StockMovement` (tipe
   `PURCHASE`) sekaligus, dalam satu transaksi database.
6. Bisa dicetak (bukti pembelian) atau **dihapus** — penghapusan
   membalikkan penambahan stok, ditolak jika sebagian stok itu sudah
   terpakai (mencegah stok negatif).

### 9.5 Penjualan / Kasir (Admin & Kasir)
1. Buka **Penjualan → Penjualan Baru**.
2. Scan barcode barang → masuk ke keranjang dengan harga jual default
   (bisa diedit), kuantitas bisa diubah.
3. Sistem **memvalidasi stok tersedia** — tidak bisa checkout kalau
   jumlah melebihi stok.
4. Isi nama pelanggan (opsional), metode pembayaran (Tunai/Transfer/
   QRIS/Lainnya), diskon (opsional).
5. Simpan → nomor invoice otomatis (`PJ-YYYYMMDD-NNNN`), stok berkurang,
   `StockMovement` tipe `SALE` tercatat, harga beli produk saat itu
   disimpan sebagai snapshot (`buyPriceAtSale`) untuk laporan laba.
6. Struk bisa langsung dicetak.
7. **Hapus** (khusus Admin): membalikkan stok yang berkurang tadi.

### 9.6 Stok Opname (Admin)
1. Buat sesi baru → pilih cakupan (semua produk aktif, atau 1 kategori
   saja) → sistem mengambil snapshot stok sistem (`systemQty`) tiap
   produk saat itu.
2. Hitung fisik: **scan barang** menambah hitungan aktual +1 tiap scan
   (mensimulasikan cara kerja stock-take fisik: staf scan tiap unit
   barang satu per satu), atau isi manual di kolom "Stok Aktual".
3. Kalau barang yang di-scan **belum ada di sesi** (baru didaftarkan lewat
   quick-add) → otomatis ditambahkan sebagai baris baru di sesi berjalan.
4. Sistem menghitung **selisih** (`actualQty - systemQty`) secara live.
5. **Simpan Progres** — bisa dilakukan bertahap, sesi tetap berstatus
   "Berjalan" sampai diselesaikan.
6. **Selesaikan Opname** — barang yang tidak diisi dianggap sesuai (tanpa
   selisih). Untuk tiap barang yang ada selisih: stok sistem disesuaikan
   ke `actualQty`, dan `StockMovement` tipe `OPNAME_ADJUST` tercatat.
   Sesi terkunci (tidak bisa diubah lagi setelah selesai).

### 9.7 Pengeluaran (Admin)
1. Kategori pengeluaran bisa **dicustom sendiri** (Gaji Karyawan, Sewa
   Tempat, Transportasi, Listrik & Air, Lainnya sebagai contoh awal;
   admin bisa tambah/ubah/hapus kategori sendiri).
2. Catat pengeluaran: kategori, jumlah, tanggal, catatan.
3. Daftar bisa difilter periode & kategori, dengan total otomatis.
4. Data ini menjadi input untuk kalkulasi **Laba Bersih** di Laporan.

### 9.8 Laporan (Admin)
Empat tab, semua dengan filter periode (preset Hari Ini/7 Hari/Bulan Ini/
Bulan Lalu, atau rentang tanggal bebas):

| Tab | Isi |
|---|---|
| **Penjualan** | Total pendapatan, jumlah transaksi, barang terjual, total diskon, grafik tren harian, produk terlaris |
| **Pembelian** | Total pembelian, jumlah transaksi, barang dibeli, grafik tren harian, barang paling banyak dibeli |
| **Laba** | Dua bagian: **Laba Kotor** (Pendapatan − Modal, + margin %) dan **Laba Bersih** (Laba Kotor − Total Pengeluaran periode, + margin bersih %), rincian pengeluaran per kategori, produk paling menguntungkan. Kartu Laba/Margin Bersih otomatis berwarna merah kalau minus. |
| **Stok** | Total produk aktif, nilai stok (berdasar harga beli), jumlah barang menipis, rincian per produk |

Semua laporan bisa **dicetak** ke halaman cetak khusus.

### 9.9 Cetak
- **Struk Penjualan** (`/print/penjualan/[id]`) — format ringkas ala
  struk kasir (80mm-friendly), monospace.
- **Bukti Pembelian** (`/print/pembelian/[id]`) — format A4, lengkap
  dengan info supplier.
- **Laporan** (`/print/laporan?type=...`) — ringkasan + tabel rincian
  sesuai jenis laporan & periode yang dipilih.
- Semua dipicu tombol "Cetak" yang memanggil `window.print()` bawaan
  browser — kompatibel printer thermal maupun printer biasa/PDF.

### 9.10 Manajemen Pengguna (Admin)
- CRUD akun (nama, email, password, peran).
- Admin **tidak bisa** menonaktifkan atau mengubah peran akunnya sendiri
  (mencegah admin terkunci dari sistemnya sendiri).
- Nonaktifkan (bukan hapus permanen) untuk mencabut akses tanpa
  menghilangkan riwayat transaksi yang tercatat atas nama akun tsb.

### 9.11 Pengaturan — Backup & Restore (Admin)
- **Unduh Backup Data**: satu file `.json` berisi seluruh data aplikasi
  (produk, transaksi, stok, pengguna, pengeluaran, dll), diunduh langsung
  dari browser.
- **Pulihkan dari Backup**: unggah file backup → **mengganti seluruh**
  data saat ini (bukan menggabungkan) dalam satu transaksi database
  (atomik — gagal total atau berhasil total). Dipakai untuk pindah
  komputer atau memulihkan dari kerusakan data.
- Terutama penting untuk instalasi **lokal/offline** yang tidak memiliki
  cadangan otomatis ke cloud.

### 9.12 Scan Barcode (Lintas Modul)
Komponen `BarcodeInput` dipakai di Pembelian, Penjualan, dan Stok Opname:
- Scanner USB/Bluetooth bekerja sebagai keyboard (mode HID) — hasil scan
  otomatis masuk & memicu pencarian saat scanner mengirim `Enter`.
- Tanpa scanner, kolom yang sama bisa dipakai mengetik nama/SKU manual —
  hasil pencarian muncul sebagai dropdown untuk dipilih.
- Kalau kode tidak ditemukan, Admin bisa langsung mendaftarkan barang
  baru dari situ (lihat 9.4 & 9.6).

---

## 10. Kebutuhan Fungsional

| ID | Kebutuhan | Modul | Peran |
|---|---|---|---|
| F-01 | Login dengan email & password | Auth | Semua |
| F-02 | Redirect otomatis kalau belum login / akses halaman terlarang | Auth | Semua |
| F-03 | CRUD produk (nama, SKU, barcode, kategori, harga, stok) | Produk | Admin |
| F-04 | Nonaktifkan / aktifkan / hapus permanen produk | Produk | Admin |
| F-05 | CRUD kategori produk | Produk | Admin |
| F-06 | Lihat stok real-time seluruh produk + indikator stok menipis | Stok | Admin, Kasir |
| F-07 | Lihat kartu stok (riwayat pergerakan) per produk | Stok | Admin, Kasir |
| F-08 | Catat pembelian dengan scan barcode, kelola supplier | Pembelian | Admin |
| F-09 | Hapus pembelian dengan pembalikan stok otomatis | Pembelian | Admin |
| F-10 | Catat penjualan dengan scan barcode & validasi stok | Penjualan | Admin, Kasir |
| F-11 | Hapus penjualan dengan pembalikan stok otomatis | Penjualan | Admin |
| F-12 | Buat & jalankan sesi stok opname, hitung selisih otomatis | Stok Opname | Admin |
| F-13 | Selesaikan opname → penyesuaian stok otomatis | Stok Opname | Admin |
| F-14 | Daftarkan barang baru langsung dari alur scan | Pembelian/Penjualan/Opname | Admin |
| F-15 | CRUD kategori & catatan pengeluaran operasional | Pengeluaran | Admin |
| F-16 | Laporan penjualan/pembelian/stok per periode + grafik | Laporan | Admin |
| F-17 | Laporan laba kotor & laba bersih per periode | Laporan | Admin |
| F-18 | Cetak struk, bukti pembelian, dan semua laporan | Cetak | Admin, Kasir* |
| F-19 | CRUD akun pengguna & peran | Pengguna | Admin |
| F-20 | Unduh backup seluruh data aplikasi | Pengaturan | Admin |
| F-21 | Pulihkan data dari file backup | Pengaturan | Admin |
| F-22 | Dashboard ringkasan (pendapatan hari ini, tren 7 hari, stok menipis) | Dashboard | Admin, Kasir |

\* Kasir hanya bisa cetak struk penjualan; laporan & bukti pembelian
khusus Admin.

## 11. Kebutuhan Non-Fungsional

| Kategori | Kebutuhan |
|---|---|
| **Keamanan** | Password di-hash (bcrypt), proteksi route 2 lapis (middleware + per-API-route), validasi input server-side (Zod) di semua endpoint yang menerima data |
| **Kegunaan (Usability)** | Bahasa Indonesia penuh, navigasi sederhana, form dengan validasi & pesan error yang jelas, responsif desktop & mobile |
| **Performa** | Stok disimpan sebagai kolom ter-update (bukan agregasi on-the-fly), query laporan dioptimalkan per periode |
| **Konsistensi Data** | Semua operasi yang mengubah stok dibungkus database transaction (atomik) |
| **Ketersediaan** | Bisa dijalankan cloud (Vercel, akses 24/7 multi-device) maupun lokal (bergantung uptime PC toko) |
| **Portabilitas Data** | Backup/restore penuh dalam format JSON, tidak terkunci ke satu provider hosting |
| **Skalabilitas** | Cocok untuk skala 1 toko/grosir tunggal; belum multi-tenant |

## 12. Matriks Hak Akses

| Halaman/Fitur | Admin | Kasir |
|---|:---:|:---:|
| Dashboard | ✅ | ✅ (versi ringkas, tanpa harga beli/modal) |
| Penjualan (lihat, buat) | ✅ | ✅ |
| Penjualan (hapus) | ✅ | ❌ |
| Stok (lihat, kartu stok) | ✅ | ✅ |
| Produk (kelola) | ✅ | ❌ |
| Pembelian (semua) | ✅ | ❌ |
| Stok Opname (semua) | ✅ | ❌ |
| Pengeluaran (semua) | ✅ | ❌ |
| Laporan (semua tab) | ✅ | ❌ |
| Pengguna (kelola) | ✅ | ❌ |
| Pengaturan / Backup / Restore | ✅ | ❌ |
| Daftarkan barang baru via scan | ✅ | ❌ |

---

## 13. Alur Pengguna Utama (User Flows)

### 13.1 Alur Transaksi Penjualan Harian (Kasir)
```
Login → Penjualan → Penjualan Baru → Scan barang berulang kali
     → Isi metode bayar/diskon → Simpan → Struk tercetak
```

### 13.2 Alur Kedatangan Barang dari Supplier (Admin)
```
Login → Pembelian → Pembelian Baru → Scan/tambah barang
     → (kalau barang baru: daftarkan di tempat) → Pilih supplier
     → Simpan → Stok bertambah otomatis
```

### 13.3 Alur Stok Opname Bulanan (Admin)
```
Login → Stok Opname → Sesi Baru → Scan tiap barang fisik satu per satu
     → Simpan Progres (bisa jeda & lanjut kapan saja)
     → Review selisih → Selesaikan Opname → Stok sistem tersinkron
```

### 13.4 Alur Tutup Buku / Evaluasi Bulanan (Admin)
```
Login → Laporan → pilih periode "Bulan Lalu" → cek tab Laba
     → (kalau minus) buka Pengeluaran untuk audit biaya
     → Cetak laporan untuk arsip
```

### 13.5 Alur Migrasi ke Komputer Baru (Admin)
```
PC lama: Pengaturan → Unduh Backup Data
Install aplikasi di PC baru → jalankan migrasi database kosong
PC baru: Pengaturan → Pulihkan dari Backup → pilih file tadi
     → Login ulang dengan akun yang sama
```

---

## 14. Deployment & Infrastruktur

### 14.1 Mode Cloud
1. Database PostgreSQL di Neon (atau provider lain).
2. Deploy ke Vercel, environment variables: `DATABASE_URL`, `AUTH_SECRET`,
   `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
3. Script `vercel-build` (`prisma migrate deploy && prisma generate &&
   next build`) menjalankan migrasi otomatis setiap deploy.
4. Isi data awal lewat `/api/setup` (one-time, aman diulang).

### 14.2 Mode Lokal/Offline
1. PostgreSQL terinstall di PC toko.
2. `npm install && npm run db:migrate && npm run db:seed && npm run
   build && npm run start`.
3. Device lain (HP kasir, dst.) mengakses lewat IP lokal PC tersebut di
   jaringan WiFi yang sama.
4. Tidak ada biaya hosting bulanan; tanggung jawab backup manual (lihat
   9.11).

## 15. Metrik Keberhasilan (KPI)

| Metrik | Target Kualitatif |
|---|---|
| Waktu rata-rata 1 transaksi penjualan | < 1 menit dengan scan barcode |
| Selisih stok sistem vs fisik | Terkoreksi rutin lewat stok opname berkala |
| Adopsi oleh staf non-teknis | Kasir bisa memakai tanpa training lebih dari demo singkat |
| Frekuensi laporan laba dicek | Minimal bulanan, sebagai bagian evaluasi bisnis |
| Insiden kehilangan data | Nol, berkat backup rutin (mode lokal) atau cloud (mode Vercel) |

## 16. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| PC toko rusak/hilang (mode lokal) tanpa backup rutin | Fitur backup manual disediakan; disarankan jadwal rutin (mis. mingguan) |
| Salah hapus transaksi | Konfirmasi eksplisit + validasi anti-stok-negatif untuk pembelian |
| Laba historis berubah karena harga beli diedit | Snapshot `buyPriceAtSale` per transaksi penjualan |
| Kasir mengakses data sensitif | Proteksi berlapis (middleware + per-API-route) khusus Admin |
| Restore backup keliru (menimpa data produksi) | Peringatan eksplisit sebelum restore, ditampilkan besar & jelas di UI |
| Scanner barcode tidak terbaca / rusak | Fallback pencarian manual nama/SKU di komponen yang sama |

## 17. Batasan yang Diketahui (Known Limitations)

- Single-tenant: 1 deployment = 1 toko/bisnis (bukan SaaS multi-klien).
- Tidak ada FIFO/lot tracking untuk harga beli — laporan laba pakai
  snapshot per transaksi, bukan per batch pembelian spesifik.
- Backup/restore bersifat manual (tidak otomatis terjadwal di dalam
  aplikasi); untuk mode lokal, penjadwalan otomatis perlu bantuan
  scheduler OS (mis. Windows Task Scheduler) di luar aplikasi.
- Tidak ada dukungan multi-outlet/multi-gudang dalam satu akun.
- Endpoint `/api/setup` hanya berjalan sekali (saat database kosong) —
  tidak menambahkan data baru (mis. kategori pengeluaran) ke database
  yang sudah pernah diisi.

## 18. Rencana Pengembangan Selanjutnya (Roadmap)

| Prioritas | Fitur | Kompleksitas |
|---|---|---|
| Tinggi | Backup terjadwal otomatis (built-in, bukan manual) | Sedang |
| Tinggi | Notifikasi stok menipis (in-app/lonceng) | Rendah |
| Sedang | Multi-outlet dalam satu akun | Tinggi |
| Sedang | Ekspor laporan ke Excel/PDF (selain print) | Rendah |
| Sedang | Riwayat perubahan harga produk (price history) | Sedang |
| Rendah | Multi-tenant SaaS (banyak toko, satu instalasi) | Tinggi |
| Rendah | Aplikasi mobile native | Tinggi |
| Rendah | Manajemen piutang pelanggan / utang supplier | Sedang |

## 19. Glosarium

| Istilah | Arti |
|---|---|
| **Stok Opname** | Proses menghitung stok fisik barang dan mencocokkannya dengan catatan sistem |
| **Kartu Stok** | Riwayat/ledger seluruh pergerakan stok satu produk |
| **Laba Kotor** | Pendapatan penjualan dikurangi modal (harga beli) barang terjual |
| **Laba Bersih** | Laba kotor dikurangi pengeluaran operasional (gaji, sewa, dll) |
| **HID Keyboard Wedge** | Mode kerja scanner barcode yang meniru input keyboard |
| **Soft-delete** | Menonaktifkan data tanpa menghapusnya secara permanen dari database |
| **Snapshot (buyPriceAtSale)** | Nilai harga beli yang "dibekukan" pada saat transaksi terjadi, tidak berubah walau data master berubah kemudian |

---

*Dokumen ini disusun berdasarkan implementasi aktual aplikasi per commit
terakhir di branch `claude/sales-inventory-app-jjw1x1`. Untuk detail teknis
instalasi & deployment langkah-demi-langkah, lihat `README.md` di root
repositori.*
