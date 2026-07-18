# 💵 Override Base Rupiah (per Order)

Dokumentasi untuk fitur **override base rupiah** di halaman detail order admin. Fitur ini memungkinkan admin mengganti rate rupiah (`baseRupiah`) yang tersimpan di sebuah order — misalnya untuk mengoreksi rate yang keliru — tanpa mengubah item, total, atau status order.

Fitur ini adalah pelengkap dari [Currency Management System](./CURRENCY_MANAGEMENT.md). Baca dokumen itu dulu untuk memahami konsep `baseRupiah`, `grossRevenue`, dan `netRevenue`.

## 📋 Table of Contents

- [Overview](#-overview)
- [Konsep & Aturan](#-konsep--aturan)
- [File Structure](#-file-structure)
- [Data Structure](#-data-structure)
- [API Endpoint](#-api-endpoint)
- [Frontend](#-frontend)
- [Alur Lengkap](#-alur-lengkap)
- [Catatan & Limitasi](#-catatan--limitasi)

---

## 🎯 Overview

Saat order dibuat, sistem menyimpan (snapshot) nilai `baseRupiah` — yaitu rate 1 unit currency order terhadap rupiah — dari collection `currencies` saat itu. Nilai ini dipakai untuk menghitung revenue order dalam IDR (`grossRevenue` & `netRevenue`) dan **tidak ikut berubah** ketika admin mengubah rate currency di kemudian hari.

Kadang rate yang tersnapshot perlu dikoreksi (salah input, kurs berubah sebelum pembayaran, dsb). Fitur ini menyediakan:

- Tombol **Override Base Rupiah** di halaman detail order.
- API terpisah yang **hanya** mengganti `baseRupiah`, menyimpan snapshot rate awal ke `snapshoot_baserupiah`, dan menghitung ulang revenue.

Yang **tidak** disentuh: `orderDetails`, `totalAmount`, `shippingCost`, `discountShipping`, `status`, dan field lainnya.

---

## 📐 Konsep & Aturan

### 1. `snapshoot_baserupiah` diisi HANYA sekali (override pertama)

Tujuannya menjaga nilai rupiah **saat order dibuat** tetap terekam selamanya, berapa kali pun rate dikoreksi.

| Aksi | `baseRupiah` sebelum | `baseRupiah` sesudah | `snapshoot_baserupiah` |
| --- | --- | --- | --- |
| Order dibuat | — | `12000` | _(kosong)_ |
| Override #1 → `13000` | `12000` | `13000` | `12000` ← **diisi** |
| Override #2 → `14000` | `13000` | `14000` | `12000` ← **tetap** |
| Override #3 → `15000` | `14000` | `15000` | `12000` ← **tetap** |

Guard di server: snapshot hanya ditulis jika `snapshoot_baserupiah` masih kosong **dan** `baseRupiah` yang lama berupa angka.

### 2. Revenue selalu dihitung ulang

Setiap override memanggil `calculateOrderRevenue()` (helper yang sama dengan flow create & edit order) memakai `baseRupiah` baru, lalu menyimpan `grossRevenue` & `netRevenue` yang baru. Jadi efek override langsung terlihat di angka **Revenue (IDR)** pada halaman detail.

### 3. Hanya admin

Endpoint memvalidasi session lewat `getServerSession` dan menolak jika `role !== "admin"`.

---

## 📁 File Structure

```
src/
├── app/
│   ├── api/admin/orders/
│   │   └── override-base-rupiah/
│   │       └── [id]/route.ts              # ✨ BARU — endpoint PATCH override
│   └── (admin)/dashboard/orders/[id]/detail/
│       └── page.tsx                       # 🔧 tombol + modal + tampilan Base Rupiah
├── components/orders/
│   └── override-base-rupiah-modal.tsx     # ✨ BARU — modal input override
├── lib/
│   ├── models/Order.ts                    # 🔧 field snapshoot_baserupiah
│   └── types/order.ts                     # 🔧 field snapshoot_baserupiah di OrderData
```

---

## 🗄️ Data Structure

Field baru pada model `Order` ([src/lib/models/Order.ts](../src/lib/models/Order.ts)):

```ts
snapshoot_baserupiah?: number; // Rate rupiah awal saat order dibuat, diisi sekali saat override pertama
```

Schema:

```ts
snapshoot_baserupiah: {
  type: Number,
  min: 0,
},
```

Field terkait yang sudah ada dan ikut ter-update saat override:

| Field | Keterangan |
| --- | --- |
| `baseRupiah` | Rate rupiah yang **berlaku saat ini** untuk order (diganti tiap override) |
| `snapshoot_baserupiah` | Rate rupiah **saat order dibuat** (diisi sekali) |
| `grossRevenue` | Revenue IDR sebelum diskon — dihitung ulang dari `baseRupiah` baru |
| `netRevenue` | Revenue IDR setelah semua diskon — dihitung ulang dari `baseRupiah` baru |

---

## 🔌 API Endpoint

### `PATCH /api/admin/orders/override-base-rupiah/[id]`

Override `baseRupiah` sebuah order.

**Auth:** wajib admin.

**Request body:**

```json
{ "baseRupiah": 13000 }
```

**Validasi:** `baseRupiah` harus angka `> 0`, jika tidak → `400`.

**Yang dilakukan server:**

1. Ambil order by `id` (404 jika tidak ada).
2. Hitung ulang `grossRevenue` & `netRevenue` via `calculateOrderRevenue()` memakai `baseRupiah` baru.
3. Jika `snapshoot_baserupiah` masih kosong & `baseRupiah` lama berupa angka → isi `snapshoot_baserupiah` dengan `baseRupiah` lama.
4. Set `baseRupiah` = nilai baru, simpan revenue baru, `order.save()`.

**Response sukses (200):**

```json
{
  "success": true,
  "data": { "_id": "...", "baseRupiah": 13000, "snapshoot_baserupiah": 12000, "grossRevenue": 0, "netRevenue": 0, "...": "..." },
  "message": "Base rupiah has been overridden successfully"
}
```

**Contoh (curl):**

```bash
curl -X PATCH "http://localhost:3000/api/admin/orders/override-base-rupiah/<ORDER_ID>" \
  -H "Content-Type: application/json" \
  --cookie "next-auth.session-token=<ADMIN_SESSION>" \
  -d '{ "baseRupiah": 13000 }'
```

> Endpoint sengaja dipisah dari `PUT /api/admin/orders/[id]` (yang mengelola item, stok, status) agar override rate tidak berisiko menyentuh field lain.

---

## 🖥️ Frontend

### Tombol

Di halaman detail order ([src/app/(admin)/dashboard/orders/[id]/detail/page.tsx](../src/app/(admin)/dashboard/orders/%5Bid%5D/detail/page.tsx)) ada tombol **Override Base Rupiah** (ikon `Coins`) dengan style sama seperti tombol **Upload Proof**.

### Blok info Base Rupiah

Di kartu ringkasan atas ditampilkan:

- **Base Rupiah** — `baseRupiah` yang berlaku saat ini _(rate berlaku saat ini)_.
- **Rupiah saat beli** — `snapshoot_baserupiah` (hanya muncul jika order pernah di-override).

### Modal ([override-base-rupiah-modal.tsx](../src/components/orders/override-base-rupiah-modal.tsx))

| Elemen | Isi |
| --- | --- |
| **Rupiah saat beli** | `snapshoot_baserupiah ?? baseRupiah` — nilai rupiah saat order dibuat |
| **Base rupiah sekarang** | `baseRupiah` — rate yang berlaku sekarang di order |
| **Input `Base Rupiah Baru`** | `type="number"`, **kosong tanpa default**, wajib diisi user |
| **Baris info** | "Nilai currency `{CODE}` saat ini di collection: Rp… / `{CODE}`" — hanya informasi, **tidak** mengisi input |

Nilai currency di baris info diambil dengan fetch ke `GET /api/admin/currencies` lalu dicocokkan dengan `currency` order (case-insensitive). Untuk `IDR` fallback = `1`.

Setelah save sukses → SweetAlert sukses, order di-refetch, modal tertutup.

---

## 🔄 Alur Lengkap

```
Admin buka detail order
        │
        ▼
Klik "Override Base Rupiah"
        │
        ▼
Modal tampil:
  • Rupiah saat beli   : Rp12.000 / SGD
  • Base rupiah sekarang: Rp12.000 / SGD
  • Info: currency SGD saat ini = Rp13.000 / SGD
  • Input kosong → admin ketik 13000
        │
        ▼
PATCH /api/admin/orders/override-base-rupiah/[id]  { baseRupiah: 13000 }
        │
        ▼
Server:
  • snapshoot_baserupiah kosong → isi 12000
  • baseRupiah = 13000
  • grossRevenue & netRevenue dihitung ulang (× 13000)
  • save
        │
        ▼
Order refetch → blok Base Rupiah:
  • Base Rupiah      : Rp13.000 / SGD
  • Rupiah saat beli : Rp12.000 / SGD
```

---

## ⚠️ Catatan & Limitasi

- **Restart dev server setelah menambah field.** Model Mongoose di-cache di `mongoose.models.Order` (lihat pola di [Order.ts](../src/lib/models/Order.ts) & [mongodb.ts](../src/lib/mongodb.ts)). Karena `strict: true` (default), field baru seperti `snapshoot_baserupiah` **tidak akan tersimpan** sampai proses Node fresh. Setelah menambah/mengubah schema, hentikan `next dev` lalu jalankan ulang. Di production (`build` + `start`) tidak masalah karena selalu proses baru.
- **Snapshot tidak bisa mundur.** `snapshoot_baserupiah` diisi sekali dan tidak pernah ditimpa. Untuk order yang sudah pernah di-override **sebelum** field ini ada, override pertama berikutnya akan menyimpan `baseRupiah` yang berlaku saat itu (bukan nilai asli yang sudah hilang).
- **Tidak mempengaruhi order lain.** Override bersifat per-order dan tidak menyentuh collection `currencies`. Mengubah rate global tetap lewat Dashboard > Currencies.
- **Revenue konsisten.** Perhitungan revenue memakai `calculateOrderRevenue()` yang sama dengan flow create & edit order, sehingga hasilnya konsisten di semua jalur.
