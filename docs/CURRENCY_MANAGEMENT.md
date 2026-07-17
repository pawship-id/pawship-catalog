# 💱 Currency Management System

Dokumentasi untuk sistem manajemen currency di Pawship Catalog. Sistem ini memungkinkan admin mengelola nilai tukar setiap currency terhadap rupiah dari dashboard, menggantikan rate yang sebelumnya di-hardcode di dalam kode.

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [File Structure](#-file-structure)
- [Data Structure](#-data-structure)
- [API Endpoints](#-api-endpoints)
- [Frontend](#-frontend)
- [Revenue Snapshot](#-revenue-snapshot)
- [Seeder](#-seeder)
- [Breaking Changes](#-breaking-changes)
- [Catatan & Limitasi](#-catatan--limitasi)

---

## 🎯 Overview

Sebelumnya nilai tukar currency disimpan sebagai konstanta di `src/lib/helpers/currency-helper.ts`:

```ts
// SEBELUM — hardcode, hanya bisa diubah lewat deploy
export const currencyRates = {
  IDR: 1,
  USD: 16000,
  SGD: 11000,
  HKD: 2000,
} as const;
```

Sekarang rate disimpan di collection `currencies` dan bisa dikelola lewat **Dashboard > Currencies**, tanpa perlu ubah kode.

Sistem ini punya dua bagian:

1. **CRUD currency** — admin mengelola daftar currency beserta base rupiah-nya.
2. **Revenue snapshot** — order menyimpan rate yang berlaku saat order dibuat, sehingga perubahan rate di kemudian hari tidak mengubah revenue order lama.

---

## ✨ Features

- ✅ CRUD currency (create, read, update, soft delete) dari dashboard
- ✅ Field sederhana: `name` (kode currency) dan `baseRupiah` (nilai 1 unit dalam rupiah)
- ✅ Nama currency otomatis di-uppercase (`usd` → `USD`)
- ✅ Validasi duplikat — satu currency tidak bisa didaftarkan dua kali
- ✅ Currency yang sudah di-soft delete boleh dibuat ulang dengan nama yang sama
- ✅ Search by name + pagination (25 per halaman)
- ✅ Perhitungan revenue order membaca rate dari database
- ✅ Order menyimpan snapshot `baseRupiah` saat dibuat
- ✅ Order lama tanpa snapshot otomatis di-backfill saat diedit
- ✅ Seeder idempotent untuk mengisi rate awal

---

## 📁 File Structure

```
src/
├── app/
│   ├── (admin)/dashboard/currencies/
│   │   ├── page.tsx                  # List + search
│   │   ├── create/page.tsx           # Form create
│   │   └── edit/[id]/page.tsx        # Form edit
│   └── api/admin/currencies/
│       ├── route.ts                  # GET (all), POST (create)
│       └── [id]/route.ts             # GET (by id), PUT (update), PATCH (soft delete)
├── components/admin/currencies/
│   ├── table-currency.tsx            # Tabel + pagination + delete
│   └── form-currency.tsx             # Form create & edit
├── lib/
│   ├── models/Currency.ts            # Mongoose model
│   ├── types/currency.ts             # CurrencyForm & CurrencyData
│   ├── helpers/currency-helper.ts    # Rate lookup & revenue calculation
│   └── seeders/currencySeeder.js     # Seeder rate default
└── components/admin/sidebar.tsx      # Menu "Currencies" (icon Coins)
```

---

## 🗄️ Data Structure

### Model `Currency`

Collection: `currencies`

| Field        | Type    | Keterangan                                            |
| ------------ | ------- | ----------------------------------------------------- |
| `name`       | String  | Kode currency. Required, auto `uppercase`, auto `trim` |
| `baseRupiah` | Number  | Nilai 1 unit currency dalam rupiah. Required, min 0    |
| `deleted`    | Boolean | Soft delete flag (plugin `mongoose-delete`)            |
| `deletedAt`  | Date    | Waktu soft delete                                      |
| `createdAt`  | Date    | Timestamp                                              |
| `updatedAt`  | Date    | Timestamp                                              |

**Contoh dokumen:**

```json
{
  "_id": "6a59...",
  "name": "USD",
  "baseRupiah": 18000,
  "deleted": false
}
```

Artinya: 1 USD = Rp18.000.

> Model didaftarkan di `src/lib/mongodb.ts` agar ikut ter-load saat `dbConnect()`.

### Field baru di Model `Order`

| Field        | Type   | Keterangan                                                       |
| ------------ | ------ | ---------------------------------------------------------------- |
| `baseRupiah` | Number | Snapshot rate `currency` order ini saat order dibuat. Optional \* |

\* Optional karena order yang dibuat sebelum fitur ini ada tidak memilikinya.

---

## 🚀 API Endpoints

Semua endpoint berada di bawah `/api/admin/currencies`.

### 1. Get All Currencies

**GET** `/api/admin/currencies`

Mengembalikan semua currency (kecuali yang sudah di-soft delete), diurutkan dari yang terbaru.

```json
{
  "success": true,
  "data": [{ "_id": "6a59...", "name": "USD", "baseRupiah": 18000 }],
  "message": "Data currencies has been fetch"
}
```

### 2. Create Currency

**POST** `/api/admin/currencies`

```json
{ "name": "usd", "baseRupiah": 18000 }
```

- `name` otomatis di-uppercase menjadi `USD`
- Ditolak (400) jika currency dengan nama sama sudah ada dan belum dihapus

**Response Error (duplikat):**

```json
{ "success": false, "message": "Currency USD already exists" }
```

**Response Error (validasi):**

```json
{ "success": false, "message": ["Please input a base rupiah"] }
```

### 3. Get Currency By ID

**GET** `/api/admin/currencies/:id`

### 4. Update Currency

**PUT** `/api/admin/currencies/:id`

```json
{ "name": "USD", "baseRupiah": 18500 }
```

Validasi duplikat mengecualikan dokumen itu sendiri, jadi rename ke nama sendiri tetap boleh.

### 5. Soft Delete Currency

**PATCH** `/api/admin/currencies/:id`

Menandai `deleted: true` dan mengisi `deletedAt`. Data tidak dihapus permanen.

> Konvensi ini sama dengan resource lain (`categories`, `reseller-categories`), sehingga komponen `DeleteButton` bisa dipakai langsung dengan `resource="currencies"`.

---

## 🖥️ Frontend

| Halaman                        | Keterangan                                     |
| ------------------------------ | ---------------------------------------------- |
| `/dashboard/currencies`        | List currency, search by name, pagination 25    |
| `/dashboard/currencies/create` | Form tambah currency                           |
| `/dashboard/currencies/edit/:id` | Form edit currency                             |

Form hanya punya dua input:

- **Currency Name** — kode currency (contoh: `USD`), ditampilkan uppercase
- **Base Rupiah** — nilai 1 unit dalam rupiah (contoh: `18000`)

Kolom Base Rupiah di tabel diformat sebagai rupiah (`Rp18.000`) memakai `Intl.NumberFormat("id-ID")`.

Menu dapat diakses lewat sidebar admin dengan label **Currencies** (icon `Coins`).

---

## 💰 Revenue Snapshot

Ini bagian terpenting dari perubahan ini.

### Masalah

Kalau revenue selalu dihitung dari rate terbaru, maka menaikkan rate USD dari 16000 ke 18000 akan **ikut menaikkan revenue semua order lama** — padahal order tersebut dulu dibayar dengan kurs 16000. Laporan revenue jadi berubah-ubah mengikuti rate hari ini.

### Solusi

Order menyimpan `baseRupiah` saat dibuat, dan revenue selalu dihitung dari angka tersebut.

```
Saat order dibuat (USD = 16000):
  order.baseRupiah = 16000
  order.revenue    = (totalAmount + shippingCost) × 16000

Admin ubah USD jadi 18000
  → revenue order lama TIDAK berubah, tetap memakai 16000
```

### Fungsi di `currency-helper.ts`

| Fungsi                                                         | Kegunaan                                                                            |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `getRateToIDR(currency)`                                        | Ambil rate terbaru dari collection `currencies`. Throw jika currency belum terdaftar |
| `resolveBaseRupiah(currency, snapshot?)`                        | Pakai `snapshot` kalau ada dan valid (> 0), kalau tidak ambil rate terbaru           |
| `calculateRevenueFromBaseRupiah(totalAmount, shippingCost, baseRupiah)` | Hitung revenue dari rate yang sudah pasti. Fungsi murni, tanpa akses DB     |

`BASE_CURRENCY` (`"IDR"`) selalu bernilai 1 sebagai fallback kalau row IDR tidak ada di database.

### Alur per endpoint

**Create order** — `POST /api/admin/orders` dan `POST /api/public/orders`

```ts
const baseRupiah = await getRateToIDR(body.currency); // snapshot rate saat ini
const revenue = calculateRevenueFromBaseRupiah(
  body.totalAmount,
  body.shippingCost,
  baseRupiah
);
// baseRupiah & revenue ikut disimpan ke order
```

**Edit order** — `PUT /api/admin/orders/:id`

```ts
const baseRupiah = await resolveBaseRupiah(
  originalOrder.currency, // pakai currency yang tersimpan, bukan dari body
  originalOrder.baseRupiah // snapshot menang; kalau kosong → ambil rate terbaru
);
const revenue = calculateRevenueFromBaseRupiah(
  body.totalAmount,
  body.shippingCost - body.discountShipping,
  baseRupiah
);
// baseRupiah ikut disimpan → order lama otomatis ter-backfill
```

Currency order tidak pernah ikut diubah saat edit, sehingga snapshot selalu konsisten dengan currency-nya.

### Perilaku yang sudah diverifikasi

Diuji lewat endpoint `PUT /api/admin/orders/:id` sungguhan, dengan rate USD di database bernilai `17930`:

| Kondisi order                     | Hasil setelah diedit                                      |
| --------------------------------- | --------------------------------------------------------- |
| Punya `baseRupiah: 16000`         | Tetap `16000`, revenue tetap `1.760.000` (tidak ikut naik) |
| Tidak punya `baseRupiah` (legacy) | Terisi `17930`, revenue `1.972.300`, snapshot di-backfill  |

---

## 🌱 Seeder

Mengisi rate awal sesuai nilai hardcode sebelumnya, supaya perhitungan tidak berubah setelah migrasi.

```bash
npm run seed:currency
```

Default yang di-insert:

| Currency | Base Rupiah |
| -------- | ----------- |
| IDR      | 1           |
| USD      | 16000       |
| SGD      | 11000       |
| HKD      | 2000        |

Seeder bersifat **idempotent dan tidak pernah menimpa**: currency yang sudah ada akan di-skip, sehingga rate yang sudah diubah admin tetap aman meskipun seeder dijalankan ulang.

```
✅ IDR inserted (Rp1)
⏭️  USD already exists (Rp18000), skipped
```

---

## ⚠️ Breaking Changes

### 1. Fungsi lama di `currency-helper.ts` dihapus

| Dihapus                  | Pengganti                                            |
| ------------------------ | ---------------------------------------------------- |
| `currencyRates`          | Collection `currencies` di database                  |
| `CurrencyCode`           | —                                                    |
| `convertToIDR()`         | `getRateToIDR()` + `calculateRevenueFromBaseRupiah()` |
| `calculateRevenueInIDR()` | `resolveBaseRupiah()` + `calculateRevenueFromBaseRupiah()` |

`calculateRevenueInIDR()` sengaja dihapus, bukan dibiarkan sebagai deprecated. Fungsi itu selalu mengambil rate terbaru, sehingga kalau masih tersedia akan mudah terpakai lagi dan diam-diam merusak mekanisme snapshot.

### 2. Currency wajib terdaftar

Membuat order dengan currency yang tidak ada di collection `currencies` sekarang **gagal dengan error**:

```
Currency EUR is not configured. Please add it in Dashboard > Currencies.
```

Sebelumnya `convertToIDR()` hanya menampilkan `console.warn` lalu mengembalikan nilai apa adanya — order senilai $100 tercatat revenue `Rp100`. Gagal secara eksplisit dipilih supaya data revenue tidak rusak diam-diam.

> Konsekuensi: pastikan semua currency yang dipakai sudah terdaftar sebelum deploy. Jalankan `npm run seed:currency`.

### 3. Fungsi rate menjadi async

`getRateToIDR()` dan `resolveBaseRupiah()` mengakses database sehingga `async`. Semua pemanggilnya sudah berada di dalam handler `async`, dan `dbConnect()` dipanggil di dalam helper sehingga aman dipakai dari mana saja.

---

## 📝 Catatan & Limitasi

### Order lama tidak memakai rate historis

Order yang dibuat sebelum fitur ini ada tidak menyimpan rate tanggal order-nya — datanya memang tidak pernah tercatat. Saat diedit, order tersebut akan memakai **rate hari ini**, bukan rate saat order dulu dibuat. Kalau ada data rate historis, perlu script backfill terpisah untuk mengisi `baseRupiah` order lama dengan angka yang benar.

### Perbedaan perhitungan create vs edit

Perhatikan bahwa `discountShipping` diperlakukan berbeda:

- **Create**: `(totalAmount + shippingCost) × baseRupiah`
- **Edit**: `(totalAmount + shippingCost − discountShipping) × baseRupiah`

Perbedaan ini sudah ada sejak sebelum perubahan ini dan sengaja dipertahankan apa adanya. Efeknya: order yang punya `discountShipping` bisa berubah revenue-nya saat pertama kali diedit, meskipun rate-nya tidak berubah. Perlu dikonfirmasi mana yang benar.

### Rate tidak di-cache

`getRateToIDR()` melakukan query ke database setiap kali dipanggil. Karena hanya dipanggil saat create/edit order (frekuensi rendah), ini tidak dibuat cache agar rate yang dipakai selalu yang terbaru.

### Base rupiah bernilai 0

Model mengizinkan `baseRupiah: 0` (`min: 0`). Namun `resolveBaseRupiah()` menganggap snapshot `0` sebagai tidak valid dan akan mengambil rate terbaru. Sebaiknya jangan mengisi rate dengan 0.

---

## 🔗 Perubahan Terkait (di luar currency)

Dua perbaikan berikut tidak berhubungan dengan currency, tetapi dikerjakan bersamaan karena `npm run build` gagal sebelum perubahan ini bisa diverifikasi. Keduanya adalah bug yang sudah ada sebelumnya.

### 1. `searchParams` di halaman reset password

`src/app/(public)/reset-password/page.tsx` — tipe `searchParams` diubah menjadi `Promise<{ token: string }>` sesuai Next.js 15. Kodenya memang sudah memakai `await searchParams`, hanya tipenya yang belum sesuai.

### 2. `authOptions` dipindah ke `src/lib/auth.ts`

Next.js 15 melarang route handler meng-export apapun selain route field (`GET`, `POST`, dll), sedangkan `src/app/api/auth/[...nextauth]/route.ts` meng-export `authOptions`.

`authOptions` dipindahkan ke `src/lib/auth.ts`, dan **24 file** yang meng-import-nya diarahkan ulang:

```ts
// SEBELUM
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// SESUDAH
import { authOptions } from "@/lib/auth";
```

Route `[...nextauth]/route.ts` sekarang hanya meng-export handler `GET` dan `POST`.
