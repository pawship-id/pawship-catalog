# 💱 Currency Management System

Dokumentasi untuk sistem manajemen currency di Pawship Catalog. Sistem ini memungkinkan admin mengelola nilai tukar setiap currency terhadap rupiah dari dashboard, menggantikan rate yang sebelumnya di-hardcode di dalam kode.

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [File Structure](#-file-structure)
- [Data Structure](#-data-structure)
- [API Endpoints](#-api-endpoints)
- [Frontend](#-frontend)
- [Harga Produk (Variant Editor)](#-harga-produk-variant-editor)
- [Revenue Snapshot](#-revenue-snapshot)
- [Seeder](#-seeder)
- [Backfill Order Lama](#-backfill-order-lama)
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
- ✅ Order menyimpan `grossRevenue` (sebelum diskon produk & ongkir) dan `netRevenue` (setelah semua diskon)
- ✅ Seeder idempotent untuk mengisi rate awal
- ✅ Uang order dibulatkan ke presisi currency saat disimpan (DB = tampilan UI)
- ✅ Script backfill (dry run by default) untuk merapikan order lama: rate historis & pembulatan uang

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
├── components/admin/
│   ├── currencies/
│   │   ├── table-currency.tsx        # Tabel + pagination + delete
│   │   └── form-currency.tsx         # Form create & edit
│   └── products/
│       └── varian-editor.tsx         # Konversi harga produk, rate dari API
├── lib/
│   ├── models/Currency.ts            # Mongoose model
│   ├── types/currency.ts             # CurrencyForm & CurrencyData
│   ├── helpers/currency-helper.ts    # Rate lookup & revenue calculation
│   ├── seeders/currencySeeder.js     # Seeder rate default
│   └── migrations/
│       ├── backfillOrderRevenue.js   # Backfill gross/net revenue order lama
│       └── backfillOrderMoney.js     # Backfill pembulatan uang order lama
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

| Field          | Type   | Keterangan                                                           |
| -------------- | ------ | -------------------------------------------------------------------- |
| `baseRupiah`   | Number | Snapshot rate `currency` order ini saat order dibuat. Optional \*     |
| `grossRevenue` | Number | Revenue IDR **sebelum semua diskon** (diskon produk + diskon ongkir)  |
| `netRevenue`   | Number | Revenue IDR **setelah semua diskon** — uang yang benar-benar diterima |
| `revenue`      | Number | **Deprecated.** Lihat penjelasan di bawah                             |

\* Optional karena order yang dibuat sebelum fitur ini ada tidak memilikinya.

**Rumusnya:**

```
grossAmount  = Σ (quantity × originalPrice[currency])   // harga sebelum diskon produk
grossRevenue = (grossAmount + shippingCost) × baseRupiah

netRevenue   = (totalAmount + shippingCost − discountShipping) × baseRupiah
               //  ^ totalAmount = Σ subTotal, sudah termasuk diskon produk
```

Perbedaan `grossRevenue` dan `netRevenue` mencakup **dua** jenis diskon:

| Jenis diskon  | Sumber                                     | Masuk gross? | Masuk net? |
| ------------- | ------------------------------------------ | ------------ | ---------- |
| Diskon produk | `originalPrice` vs `discountedPrice` item  | ❌ tidak      | ✅ ya       |
| Diskon ongkir | `discountShipping`                         | ❌ tidak      | ✅ ya       |

**Contoh** — 2 item @ $100 diskon 20% (jadi $80), ongkir $10 diskon $5, rate 16000:

| Field          | Perhitungan                | Nilai       |
| -------------- | -------------------------- | ----------- |
| `grossRevenue` | (2 × 100 + 10) × 16000     | `3.360.000` |
| `netRevenue`   | (160 + 10 − 5) × 16000     | `2.640.000` |

> Kalau `originalPrice` untuk currency order tidak tersedia pada suatu item, item itu jatuh ke `subTotal`-nya sendiri (dianggap tanpa diskon). Ini disengaja supaya harga yang hilang tidak membuat revenue menjadi `NaN`.

### Field `revenue` (deprecated)

`revenue` **tidak pernah ditulis lagi**. Field ini hanya tersisa pada order yang dibuat sebelum `netRevenue` ada, dan dipertahankan agar data lama tetap terbaca.

Semua pembaca memakai pola `netRevenue ?? revenue`:

- `src/app/api/admin/dashboard/stats/route.ts` → Total Revenue di dashboard
- `src/lib/helpers/export-order-excel.ts` → kolom "Revenue (IDR)"
- `src/app/(admin)/dashboard/orders/[id]/detail/page.tsx` → tampilan detail order
- `src/app/(admin)/dashboard/orders/[id]/edit/page.tsx` → tampilan revenue di form edit

Sebelumnya `revenue` sempat diisi kembar dengan `netRevenue`. Itu redundan — dua field dengan isi identik harus terus disinkronkan dan cepat atau lambat akan berbeda. Sekarang `netRevenue` adalah satu-satunya sumber kebenaran, dan `revenue` murni sebagai fallback baca untuk data lama.

`revenue` yang dikirim client juga di-strip di endpoint create (`const { revenue: _ignoredRevenue, ...safeBody } = body`), karena body di-spread ke dokumen order — tanpa itu, client bisa menitipkan revenue palsu.

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

## 🏷️ Harga Produk (Variant Editor)

Selain revenue, collection `currencies` juga dipakai untuk mengonversi **harga produk** di `src/components/admin/products/varian-editor.tsx`.

Di form variant, admin memasukkan satu harga dalam IDR lalu menekan **Apply**. Harga untuk currency lain dihitung otomatis:

```
harga[currency] = hargaIDR / baseRupiah[currency]
```

Sebelumnya komponen ini punya tabel rate sendiri yang di-hardcode (`USD: 16000`, `SGD: 11000`, `HKD: 2000`) — terpisah dan bisa berbeda dari rate di database. Sekarang daftar currency diambil dari `GET /api/admin/currencies`, jadi menambah currency baru di dashboard otomatis memunculkan input harganya di variant editor dan di modal price.

**Perlu diperhatikan:**

- **Domainnya beda dengan revenue.** Ini harga yang dibayar customer dan hanya dipakai saat admin menekan Apply. Harga produk yang sudah tersimpan **tidak** ikut berubah saat rate diubah — tidak ada konversi ulang otomatis.
- **IDR selalu ada.** Karena harga default diinput dalam IDR, IDR ditambahkan dengan rate 1 kalau barisnya tidak ada di database. Ini sengaja mencerminkan fallback `BASE_CURRENCY` di `currency-helper.ts`.
- **Urutan currency**: IDR paling depan, sisanya urut abjad.
- **Currency dengan `baseRupiah` 0 dilewati** saat konversi (pembagiannya menghasilkan `Infinity`). Currency-nya tetap muncul di modal price sehingga harganya bisa diisi manual.
- **Tombol Apply nonaktif selama currency dimuat**, dan kalau fetch gagal errornya ditampilkan. Ini penting: tanpa daftar currency, konversi menghasilkan objek kosong yang justru **menghapus** harga variant.

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

| Fungsi                                   | Kegunaan                                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `getRateToIDR(currency)`                 | Ambil rate terbaru dari collection `currencies`. Throw jika currency belum terdaftar  |
| `resolveBaseRupiah(currency, snapshot?)` | Pakai `snapshot` kalau ada dan valid (> 0), kalau tidak ambil rate terbaru            |
| `calculateOrderRevenue({ orderDetails, currency, totalAmount, shippingCost, discountShipping, baseRupiah })` | Hitung `grossRevenue` & `netRevenue` dari rate yang sudah pasti. Fungsi murni, tanpa akses DB |

`calculateOrderRevenue()` menerima **satu object**, bukan argumen posisional, dan mewajibkan semua field-nya. Sebelumnya tiap endpoint menghitung aritmatikanya sendiri — itulah penyebab bug di mana create tidak mengurangi diskon ongkir sedangkan edit mengurangi. Satu fungsi dengan parameter eksplisit membuat perbedaan seperti itu tidak bisa terulang, dan object parameter menghindari salah urut argumen.

`BASE_CURRENCY` (`"IDR"`) selalu bernilai 1 sebagai fallback kalau row IDR tidak ada di database.

### Alur per endpoint

**Create order** — `POST /api/admin/orders` dan `POST /api/public/orders`

```ts
const baseRupiah = await getRateToIDR(body.currency); // snapshot rate saat ini
const { grossRevenue, netRevenue } = calculateOrderRevenue({
  orderDetails: body.orderDetails,
  currency: body.currency,
  totalAmount: body.totalAmount,
  shippingCost: body.shippingCost,
  discountShipping: body.discountShipping || 0,
  baseRupiah,
});
// baseRupiah, grossRevenue, dan netRevenue disimpan ke order
```

**Edit order** — `PUT /api/admin/orders/:id`

```ts
const baseRupiah = await resolveBaseRupiah(
  originalOrder.currency, // pakai currency yang tersimpan, bukan dari body
  originalOrder.baseRupiah // snapshot menang; kalau kosong → ambil rate terbaru
);
const { grossRevenue, netRevenue } = calculateOrderRevenue({
  orderDetails: body.orderDetails,
  currency: originalOrder.currency,
  totalAmount: body.totalAmount,
  shippingCost: body.shippingCost,
  discountShipping: body.discountShipping,
  baseRupiah,
});
// baseRupiah ikut disimpan → order lama otomatis ter-backfill
```

Revenue sepenuhnya milik API. Frontend tidak pernah menghitung atau mengirim revenue.

Currency order tidak pernah ikut diubah saat edit, sehingga snapshot selalu konsisten dengan currency-nya.

### Perilaku yang sudah diverifikasi

Diuji lewat endpoint `PUT /api/admin/orders/:id` sungguhan, dengan rate USD di database bernilai `17930`:

| Kondisi order                     | Hasil setelah diedit                                      |
| --------------------------------- | --------------------------------------------------------- |
| Punya `baseRupiah: 16000`         | Tetap `16000`, revenue tetap `1.760.000` (tidak ikut naik) |
| Tidak punya `baseRupiah` (legacy) | Terisi `17930`, revenue `1.972.300`, snapshot di-backfill  |

Perhitungan gross/net juga diverifikasi lewat endpoint yang sama — order berisi 2 item @ $100 dengan diskon produk 20% (jadi $80), ongkir $10 dengan diskon $5, `baseRupiah: 16000`:

| Field          | Perhitungan            | Hasil       |
| -------------- | ---------------------- | ----------- |
| `grossRevenue` | (2 × 100 + 10) × 16000 | `3.360.000` |
| `netRevenue`   | (160 + 10 − 5) × 16000 | `2.640.000` |

Kasus tepi yang ikut diverifikasi:

| Kasus                                          | Hasil                                         |
| ---------------------------------------------- | --------------------------------------------- |
| Currency huruf kecil (`usd`)                   | Cocok, key `originalPrice` tetap ketemu       |
| `originalPrice` tidak punya currency order     | Jatuh ke `subTotal`, bukan `NaN`              |
| `discountShipping` `undefined`                 | Dianggap 0                                    |
| Client mengirim `revenue` palsu di body        | Diabaikan, `revenue` legacy tidak tertimpa    |

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

## 🔄 Backfill Order Lama

Ada dua script backfill di `src/lib/migrations/`. Keduanya dry run secara default (tidak menulis apa pun tanpa `--apply`), idempotent, dan mengimpor rumus dari `currency-helper.ts` — bukan menyalinnya — sehingga tidak mungkin berbeda dari perhitungan API.

### A. Backfill revenue — `backfillOrderRevenue.js`

Mengisi `baseRupiah`, `grossRevenue`, dan `netRevenue` untuk order yang dibuat sebelum field tersebut ada.

```bash
npm run backfill:revenue            # dry run
npm run backfill:revenue -- --apply # jalankan sungguhan
```

Alias `@/` di-resolve manual lalu file TS di-load lewat `ts-node`.

#### Rate historis, bukan rate hari ini

Bagian terpenting dari script ini: order lama **tidak boleh** dinilai ulang dengan kurs hari ini — itu justru menaikkan revenue masa lalu, kebalikan dari tujuan snapshot.

Untungnya rate historisnya diketahui: semua order lama dinilai dengan konstanta `currencyRates` yang dulu di-hardcode. Angka itu disalin ke `LEGACY_RATES` di dalam script:

```js
const LEGACY_RATES = { IDR: 1, USD: 16000, SGD: 11000, HKD: 2000 };
```

Urutan penentuan rate:

1. `order.baseRupiah` kalau sudah ada → dipakai (snapshot menang)
2. `LEGACY_RATES[currency]` → rate historis order lama
3. Selain itu → order dilewati, karena rate historisnya tidak bisa ditebak

> Kalau suatu saat script ini dijalankan pada order yang dibuat setelah currency dikelola di database, order tersebut sudah punya `baseRupiah` sendiri sehingga langkah 1 yang berlaku. `LEGACY_RATES` tidak akan pernah menimpa snapshot.

#### Cek silang otomatis

Untuk tiap order tanpa snapshot, script memverifikasi bahwa `revenue` lama bisa direproduksi dari rate legacy:

```
revenue ≈ (totalAmount + shippingCost) × legacyRate            // jalur create
       ≈ (totalAmount + shippingCost − discountShipping) × legacyRate  // jalur edit
```

Kalau tidak cocok, order tetap diproses tetapi dilaporkan sebagai **rate mismatch** — tandanya asumsi rate legacy meleset untuk order itu dan perlu dilihat manual.

#### Pengaman

- **Dry run adalah default.** Tanpa `--apply` tidak ada satu pun tulisan ke database.
- **Idempotent.** Order yang sudah benar dilaporkan "sudah benar" dan tidak ditulis ulang.
- **`revenue` legacy tidak pernah disentuh**, jadi angka aslinya tetap ada sebagai cadangan.
- **Order bermasalah dilewati, bukan bikin error**: currency di luar tabel legacy, hasil hitung `NaN`/negatif, atau `grossRevenue < netRevenue` (mustahil secara logika — menandakan `orderDetails` tidak konsisten dengan `totalAmount`).
- Laporan menampilkan **dampak ke Total Revenue dashboard** memakai filter status yang sama dengan `dashboard/stats/route.ts`.

#### Hasil eksekusi

Dijalankan pada `db_pawship_catalog_development`:

| Metrik                         | Hasil                                |
| ------------------------------ | ------------------------------------ |
| Order diproses                 | 59                                   |
| Diupdate                       | 59                                   |
| Dilewati                       | 0                                    |
| Rate mismatch                  | 0                                    |
| Pakai rate legacy              | 58 (1 order sudah punya snapshot)    |
| Perubahan Total Revenue        | −Rp27.792                            |

Nol mismatch berarti seluruh 59 order revenue lamanya cocok persis dengan `LEGACY_RATES` — konfirmasi bahwa rate historisnya benar. Perubahan revenue hanya −Rp27.792, murni dari koreksi diskon ongkir; nilai historis tidak bergeser.

### B. Backfill pembulatan uang — `backfillOrderMoney.js`

Membulatkan `subTotal`, price map (`originalPrice`/`discountedPrice`), dan `totalAmount` tiap order ke presisi currency-nya, supaya nilai di database sama persis dengan yang ditampilkan UI. Karena `totalAmount` bisa berubah, gross/net revenue ikut dihitung ulang dari `baseRupiah` yang sudah tersimpan agar tetap konsisten.

```bash
npm run backfill:money            # dry run
npm run backfill:money -- --apply # jalankan sungguhan
```

Rumusnya memakai `normalizeOrderMoney()` + `calculateOrderRevenue()` — persis yang dipakai route order, jadi hasil backfill dan order baru identik.

**Pengaman** sama dengan backfill revenue: dry run default, idempotent, order dengan revenue tidak valid (`gross < net`, negatif, `NaN`) dilewati. Order tanpa `baseRupiah` hanya dibulatkan uangnya, revenue tidak disentuh (itu tugas backfill A).

#### Hasil eksekusi

Dijalankan pada `db_pawship_catalog_development`:

| Metrik            | Hasil |
| ----------------- | ----- |
| Order diproses    | 59    |
| Diupdate          | 15    |
| Sudah bersih      | 44    |
| Dilewati          | 0     |

15 order yang punya galat float (mis. `1450.8000000000002`) dirapikan; sisanya sudah bersih. Verifikasi akhir: 0 nilai yang melebihi presisi currency-nya, dan invarian `totalAmount == Σ subTotal` tetap utuh di semua order.

> Urutan menjalankan pada data lama: **backfill revenue (A) dulu**, baru **backfill money (B)**. B butuh `baseRupiah` (dari A) untuk menghitung ulang revenue dari nilai yang sudah dibulatkan.

---

## ⚠️ Breaking Changes

### 1. Fungsi lama di `currency-helper.ts` dihapus

| Dihapus                   | Pengganti                                            |
| ------------------------- | ---------------------------------------------------- |
| `currencyRates`           | Collection `currencies` di database                  |
| `CurrencyCode`            | —                                                    |
| `convertToIDR()`          | `getRateToIDR()` + `calculateOrderRevenue()`         |
| `calculateRevenueInIDR()` | `resolveBaseRupiah()` + `calculateOrderRevenue()`    |

`calculateRevenueInIDR()` sengaja dihapus, bukan dibiarkan sebagai deprecated. Fungsi itu selalu mengambil rate terbaru, sehingga kalau masih tersedia akan mudah terpakai lagi dan diam-diam merusak mekanisme snapshot.

### 2. Diskon ongkir sekarang mengurangi revenue saat create

**Ini perbaikan bug.** Sebelumnya `POST /api/admin/orders` dan `POST /api/public/orders` menghitung revenue tanpa mengurangi `discountShipping`, sedangkan `PUT /api/admin/orders/:id` menguranginya. Akibatnya:

- Order dengan diskon ongkir tercatat revenue-nya **terlalu tinggi** saat dibuat
- Angkanya baru berubah (turun) saat order tersebut pertama kali diedit

Sekarang keduanya konsisten memakai `calculateOrderRevenue()`, dan angka yang dibaca dashboard adalah `netRevenue`.

> **Dampak:** Total Revenue di dashboard akan turun untuk order yang punya diskon ongkir, karena angka lamanya memang kelebihan. Order lama tidak otomatis diperbaiki — lihat bagian Catatan.

### 3. `revenue` tidak lagi ditulis, diganti `netRevenue`

`revenue` berstatus deprecated dan **tidak pernah ditulis lagi**. Order baru hanya punya `grossRevenue` dan `netRevenue`; order lama tetap menyimpan `revenue`-nya. Semua pembaca memakai `netRevenue ?? revenue`, jadi tidak ada data yang hilang.

### 4. Rate hardcoded di frontend dihapus

Ada **dua** tabel rate hardcoded di frontend, keduanya sudah dihapus.

**a. Halaman edit order** — `src/app/(admin)/dashboard/orders/[id]/edit/page.tsx` punya tabel rate sendiri (`USD: 15800`, `SGD: 11800`) yang berbeda dari nilai di server, dipakai untuk menghitung revenue di sisi client lalu dikirim lewat body PUT.

Nilai itu selalu diabaikan server (server menghitung sendiri), dan input revenue-nya `disabled` + `defaultValue` sehingga tidak pernah tampil live. Karena itu tabel rate, fungsi `calculateRevenue()`, dan field `revenue` di body PUT dihapus seluruhnya. Revenue sekarang murni milik API.

**b. Variant editor** — `src/components/admin/products/varian-editor.tsx` punya `currencyList` hardcoded (`USD: 16000`, `SGD: 11000`, `HKD: 2000`) untuk mengonversi harga produk. Sekarang diambil dari `GET /api/admin/currencies`. Lihat [Harga Produk (Variant Editor)](#-harga-produk-variant-editor).

> **Dampak:** tombol **Apply** di form variant sekarang memakai rate terbaru dari dashboard, bukan angka lama. Dengan rate hari ini, harga hasil konversi akan berbeda dari sebelumnya — contoh dari IDR 100.000: USD dulu `6.3` (rate 16000) menjadi `5.6` (rate 17930). Harga produk yang sudah tersimpan tidak ikut berubah; ini hanya berlaku saat admin menekan Apply.

### 5. Currency wajib terdaftar

Membuat order dengan currency yang tidak ada di collection `currencies` sekarang **gagal dengan error**:

```
Currency EUR is not configured. Please add it in Dashboard > Currencies.
```

Sebelumnya `convertToIDR()` hanya menampilkan `console.warn` lalu mengembalikan nilai apa adanya — order senilai $100 tercatat revenue `Rp100`. Gagal secara eksplisit dipilih supaya data revenue tidak rusak diam-diam.

> Konsekuensi: pastikan semua currency yang dipakai sudah terdaftar sebelum deploy. Jalankan `npm run seed:currency`.

### 6. Fungsi rate menjadi async

`getRateToIDR()` dan `resolveBaseRupiah()` mengakses database sehingga `async`. Semua pemanggilnya sudah berada di dalam handler `async`, dan `dbConnect()` dipanggil di dalam helper sehingga aman dipakai dari mana saja.

### 7. Uang order dibulatkan saat disimpan

**Ini perbaikan bug.** Sebelumnya perhitungan diskon menghasilkan nilai seperti `3.8949999999999996`, dan penjumlahan floating point menghasilkan `1450.8000000000002`. Nilai mentah itu tersimpan di database, sementara web merapikannya lewat `Intl.NumberFormat` — jadi angka di DB berbeda dengan yang ditampilkan.

Sekarang saat order dibuat/diedit, `normalizeOrderMoney()` membulatkan `subTotal`, price map, dan `totalAmount` ke presisi currency-nya (IDR 0 desimal, USD/SGD/HKD 2 desimal). `totalAmount` diturunkan dari jumlah `subTotal` yang sudah dibulatkan, menjaga invarian `totalAmount == Σ subTotal`.

> **Dampak:** nilai yang disimpan sekarang identik dengan yang ditampilkan. 15 order lama yang terlanjur berdesimal panjang sudah dirapikan lewat backfill B. Total Revenue dashboard praktis tidak berubah (hanya menghilangkan galat float sepersekian sen).

---

## 📝 Catatan & Limitasi

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
