# 🎟️ Promotion Engine

Dokumentasi untuk modul Promotion di Pawship Catalog setelah **redesign total (breaking change)**. Modul promo lama yang hanya mendukung diskon persentase per-produk diganti dengan **promotion engine** yang fleksibel: berbasis kode promo, mendukung banyak syarat (conditions), banyak hadiah (rewards), tier bertingkat, batas kuota, dan pencatatan pemakaian.

## 📋 Table of Contents

- [Overview](#-overview)
- [Konsep Utama](#-konsep-utama)
- [Features](#-features)
- [File Structure](#-file-structure)
- [Data Structure](#️-data-structure)
- [Enum](#-enum)
- [Conditions](#-conditions)
- [Rewards](#-rewards)
- [Tiers](#-tiers)
- [Customer Rules & Limits](#-customer-rules--limits)
- [Promotion Engine](#-promotion-engine)
- [Validasi](#-validasi)
- [API Endpoints](#-api-endpoints)
- [Frontend — Manajemen Promotion](#️-frontend--manajemen-promotion)
- [Integrasi Admin Order](#-integrasi-admin-order)
- [Integrasi Cart Customer (Publik)](#-integrasi-cart-customer-publik)
- [Re-evaluasi Server saat Submit (Otoritatif)](#-re-evaluasi-server-saat-submit-otoritatif)
- [Perubahan Storefront](#-perubahan-storefront)
- [Breaking Changes](#️-breaking-changes)
- [Catatan & Limitasi](#-catatan--limitasi)
- [Verifikasi](#-verifikasi)

---

## 🎯 Overview

Modul lama (`Promo`, collection `promos`) hanya menyimpan diskon persentase per varian produk dan otomatis tampil di katalog. Schema-nya sudah tidak memenuhi kebutuhan bisnis.

```
Schema LAMA (dihapus)          Engine BARU
─────────────────────          ───────────────────────────────────
promoName                      name, code (unik, uppercase)
startDate / endDate            startAt / endAt, status, trigger, priority
products[].variants[]          appliesTo { scope, ids }
discountPercentage             conditions[], rewards[], tiers[]
                               customerRules, limits
                               (+ collection promotion_usages untuk audit/kuota)
```

Sistem baru punya tiga bagian:

1. **Promotion** — dokumen promo dengan syarat & hadiah yang generik dan mudah dikembangkan.
2. **Promotion Engine** — helper murni yang **hanya mengevaluasi** promo terhadap cart (tidak pernah mengubah cart).
3. **Promotion Usage** — collection terpisah untuk mencatat pemakaian promo (kuota, limit per customer, laporan).

> Ini **breaking change**. Collection `promos` lama beserta seluruh file lamanya (model, types, helper, context, route, UI) dihapus. Tidak ada migrasi dari schema lama.

---

## 💡 Konsep Utama

- **Semua promo memakai Promotion Code** (contoh: `WELCOME10`, `RAMADHAN25`, `BUY2GET1`, `FREESHIP20`). Customer maupun Admin Order memasukkan code saat checkout.
- **`trigger`** disiapkan untuk dua mode: `CODE` (aktif sekarang) dan `AUTOMATIC` (disiapkan untuk masa depan). Saat ini semua promo memakai `CODE`.
- **Engine hanya evaluasi.** Engine menerima cart + customer, lalu mengembalikan hasil evaluasi (valid/tidak, besar diskon, free gift). Engine **tidak** mengubah cart. Keputusan menerapkan hasilnya ada di pemanggil (halaman order).
- **Generik, tidak hardcode.** Conditions dan rewards disimpan sebagai `{ type, config }`. Menambah jenis baru = menambah satu entri di registry validator + evaluator, tanpa mengubah schema.
- **Semua nilai uang per-currency.** Setiap field uang (minimum purchase, fixed discount, max discount, threshold tier) berupa **MoneyMap** `Record<currency, number>` — konsisten dengan harga varian & order (IDR/SGD/HKD/USD).

---

## ✨ Features

- ✅ Promo berbasis code unik (uppercase, dicek duplikat)
- ✅ `trigger` CODE / AUTOMATIC, `status` ACTIVE / INACTIVE, `priority`, `stackable`
- ✅ `appliesTo` generik: All / Products / Variants / Categories (Brands direservasi)
- ✅ `conditions[]` generik: minimum purchase, category spend, buy product, customer type, first purchase, new customer
- ✅ `rewards[]` generik: percentage discount, fixed discount, shipping discount, free shipping, free gift
- ✅ Reward percentage punya `maxDiscount` (opsional); free gift mendukung AUTO / CUSTOMER_SELECT / FIRST_AVAILABLE
- ✅ `tiers[]` — reward bertingkat berdasarkan spend (mis. 300k→10%, 500k→15%, 1jt→20%)
- ✅ `customerRules`: firstPurchaseOnly, newCustomerOnly, resellerOnly
- ✅ `limits`: maxDiscount, maxUsagePerCustomer, totalQuota
- ✅ Collection `promotion_usages` untuk audit, kuota, limit per customer, dan laporan
- ✅ Promotion Engine murni (tanpa akses DB) — mudah diuji & dipakai ulang
- ✅ Integrasi Admin Order: selector + kartu promo + status disabled beserta alasannya + apply
- ✅ Integrasi **Cart customer publik** (`/cart`): apply code + kartu promo lewat modal yang sama (endpoint publik)
- ✅ **Re-evaluasi otoritatif di server** saat submit order (public POST, admin POST/PUT) — angka diskon dari client tidak dipercaya, checkout ditolak (400) bila code tidak lagi valid
- ✅ `recordOrderPromotionUsages` idempotent (dijaga per `orderId`) — retry/submit ganda tidak menggandakan pemakaian
- ✅ Promo berlaku untuk B2C **dan** B2B (reseller); `stackable` mengatur kombinasi dengan diskon tier reseller

---

## 📁 File Structure

```
src/
├── app/
│   ├── (admin)/dashboard/promotions/
│   │   ├── page.tsx                       # List + search (code/name)
│   │   ├── create/page.tsx                # Form create
│   │   ├── [id]/edit/page.tsx             # Form edit
│   │   └── [id]/detail/page.tsx           # View detail
│   ├── api/admin/promotions/
│   │   ├── route.ts                       # GET (all), POST (create)
│   │   ├── [id]/route.ts                  # GET, PUT, PATCH (soft delete)
│   │   ├── available/route.ts             # POST — daftar promo utk order selector (+ evaluasi)
│   │   └── evaluate/route.ts              # POST — evaluasi 1 code (apply / input manual)
│   ├── api/public/promotions/             # Versi PUBLIK utk cart customer (proxy service yg sama)
│   │   ├── available/route.ts             # POST — daftar promo + evaluasi (read-only)
│   │   └── evaluate/route.ts              # POST — evaluasi 1 code
│   ├── api/public/orders/route.ts         # POST — checkout customer (re-evaluasi promo server-side)
│   ├── api/admin/orders/route.ts          # POST — create order admin (re-evaluasi promo server-side)
│   ├── api/admin/orders/[id]/route.ts     # PUT — edit order admin (re-evaluasi + rekonsiliasi usage)
│   └── (public)/cart/page.tsx             # Cart customer: Apply Promotion + ringkasan diskon
├── components/admin/
│   ├── promotions/
│   │   ├── table-promotion.tsx            # Tabel + status badge + pagination
│   │   ├── form-promotion.tsx             # Form create & edit (orkestrator)
│   │   ├── money-map-input.tsx            # Input uang per-currency (reusable)
│   │   ├── applies-to-selector.tsx        # Pemilih scope + item
│   │   ├── condition-builder.tsx          # Builder conditions dinamis
│   │   ├── reward-builder.tsx             # Builder rewards dinamis (dipakai form + tier)
│   │   ├── tier-builder.tsx               # Builder tier (threshold + rewards)
│   │   └── detail/detail-promotion.tsx    # Tampilan read-only lengkap
│   └── orders/
│       └── promotion-selector-modal.tsx   # Modal kartu promo (dipakai Admin Order & Cart publik via prop `availableEndpoint`)
├── lib/
│   ├── models/
│   │   ├── Promotion.ts                    # Mongoose model + IPromotion
│   │   └── PromotionUsage.ts               # Mongoose model audit/kuota
│   ├── types/promotion.ts                  # Enum, MoneyMap, Condition/Reward/Tier, tipe hasil engine
│   └── helpers/
│       ├── promotion-validation.ts         # Registry validator per-tipe (dipakai model + route)
│       ├── promotion-engine.ts             # Engine murni (evaluasi, tanpa DB)
│       └── promotion-service.ts            # Lapisan DB tipis: usage stats, order count, catat pemakaian
└── components/admin/sidebar.tsx            # Menu "Promotion" → /dashboard/promotions
```

> Model `Promotion` & `PromotionUsage` didaftarkan di `src/lib/mongodb.ts` agar ikut ter-load saat `dbConnect()` (penting untuk `ref`/`populate`).

---

## 🗄️ Data Structure

### Model `Promotion`

Collection: `promotions`. Memakai `{ timestamps: true }` + plugin `mongoose-delete`.

| Field           | Type          | Keterangan                                                          |
| --------------- | ------------- | ------------------------------------------------------------------- |
| `name`          | String        | Nama promo. Required, `trim`, maks 150                               |
| `code`          | String        | Kode promo. Required, **unik**, otomatis `uppercase`, `trim`        |
| `description`   | String        | Deskripsi opsional (tampil di detail)                               |
| `trigger`       | Enum          | `CODE` \| `AUTOMATIC`. Default `CODE`                               |
| `status`        | Enum          | `ACTIVE` \| `INACTIVE`. Default `ACTIVE`                            |
| `priority`      | Number        | Urutan prioritas. Default 0, min 0                                  |
| `stackable`     | Boolean       | Boleh digabung dengan diskon lain. Default `false`                 |
| `startAt`       | Date          | Mulai berlaku. Required                                            |
| `endAt`         | Date          | Berakhir. Required, harus > `startAt`                              |
| `appliesTo`     | Object        | `{ scope, ids }` — lihat [Enum](#-enum)                            |
| `conditions`    | Array         | Daftar syarat generik `{ type, config }`                          |
| `rewards`       | Array         | Daftar hadiah generik `{ type, config }`                          |
| `tiers`         | Array         | Reward bertingkat `{ threshold, rewards[] }`                       |
| `customerRules` | Object        | `{ firstPurchaseOnly, newCustomerOnly, resellerOnly }`            |
| `limits`        | Object        | `{ maxDiscount?, maxUsagePerCustomer?, totalQuota? }`            |
| `usedCount`     | Number        | Counter pemakaian (denormalisasi cepat). Default 0                 |
| `deleted`       | Boolean       | Soft delete flag                                                   |
| `createdAt`     | Date          | Timestamp                                                          |
| `updatedAt`     | Date          | Timestamp                                                          |

> **MoneyMap disimpan sebagai object biasa** (`{ IDR: 300000, USD: 20 }`), bukan Mongoose `Map` — konsisten dengan `Order.originalPrice`, dan engine bisa membaca `map[currency]` langsung.

**Index:** `code` unik; compound `{ status, trigger, startAt, endAt }` untuk query "promo tersedia".

### Model `PromotionUsage`

Collection: `promotion_usages`. Satu dokumen per (promo diterapkan ke order). **Daftar customer tidak disimpan di dokumen promo** — pemakaian dicatat di sini.

| Field           | Type     | Keterangan                                            |
| --------------- | -------- | ----------------------------------------------------- |
| `promotionId`   | ObjectId | Ref `Promotion`, indexed                              |
| `promotionCode` | String   | Snapshot kode                                         |
| `userId`        | String   | Customer, indexed                                     |
| `orderId`       | ObjectId | Ref `Order`, indexed                                  |
| `orderInvoice`  | String   | Snapshot nomor invoice                                |
| `currency`      | String   | Currency order                                        |
| `discountApplied` | MoneyMap | Snapshot total diskon, mis. `{ IDR: 30000 }`        |
| `rewardSnapshot`| Mixed    | Snapshot reward (mis. free gift)                      |
| `usedAt`        | Date     | Waktu pemakaian                                       |

- **Cek kuota total:** `count({ promotionId })` vs `limits.totalQuota`
- **Cek limit per customer:** `count({ promotionId, userId })` vs `limits.maxUsagePerCustomer`

### Field baru di Model `Order`

| Field               | Type   | Keterangan                                                                    |
| ------------------- | ------ | ----------------------------------------------------------------------------- |
| `appliedPromotions` | Array  | Snapshot promo yang diterapkan (code, name, breakdown diskon, free gift)      |
| `promotionDiscount` | Number | **Total benefit promo (produk + ongkir)** dalam currency order                |

Struktur satu entri `appliedPromotions[]`:

```ts
{
  promotionId, code, name, trigger,
  stackable,               // audit: apakah promo ini stackable saat diterapkan
  rewardsSummary,          // ringkasan benefit utk tampilan
  productDiscount,         // diskon sisi produk (currency order)
  shippingDiscount,        // diskon ongkir (currency order)
  freeGift,                // { productId, variantId, variantName, quantity } | null
  discountCurrency,        // currency saat promo diterapkan
}
```

---

## 🔤 Enum

Semua enum dideklarasikan sebagai tuple `as const` di `src/lib/types/promotion.ts` sehingga **satu sumber kebenaran** dipakai baik oleh validator Mongoose (`enum: [...]`) maupun tipe TypeScript.

| Enum               | Nilai                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `PromotionTrigger` | `CODE`, `AUTOMATIC`                                                                        |
| `PromotionStatus`  | `ACTIVE`, `INACTIVE`                                                                       |
| `AppliesToScope`   | `ALL`, `PRODUCTS`, `VARIANTS`, `CATEGORIES`, `BRANDS` *(BRANDS direservasi, belum aktif)* |
| `ConditionType`    | `MINIMUM_PURCHASE`, `CATEGORY_SPEND`, `BUY_PRODUCT`, `CUSTOMER_TYPE`, `FIRST_PURCHASE`, `NEW_CUSTOMER` |
| `RewardType`       | `PERCENTAGE_DISCOUNT`, `FIXED_DISCOUNT`, `SHIPPING_DISCOUNT`, `FREE_SHIPPING`, `FREE_GIFT` |
| `FreeGiftSelection`| `AUTO`, `CUSTOMER_SELECT`, `FIRST_AVAILABLE`                                               |
| `CustomerType`     | `RETAIL`, `RESELLER`                                                                       |

**Status turunan (dihitung, tidak disimpan):** di tabel list, status ditampilkan sebagai `Inactive` / `Upcoming` / `Expired` / `Active` berdasarkan kombinasi `status` + rentang tanggal.

**`appliesTo`:**

```ts
appliesTo: {
  scope: "ALL" | "PRODUCTS" | "VARIANTS" | "CATEGORIES" | "BRANDS",
  ids: string[],   // id product/variant/category sesuai scope; kosong untuk ALL
}
```

> **Brands direservasi.** Tidak ada model Brand di codebase, jadi scope `BRANDS` valid di schema tetapi belum bisa dipilih di UI. Desain generik ini membuat dukungan brand tinggal ditambahkan nanti tanpa mengubah schema.

---

## 🧩 Conditions

Semua syarat berbentuk `{ type, config }`. Sebuah promo bisa punya lebih dari satu condition — **semua harus terpenuhi**. Bentuk `config` divalidasi & dievaluasi lewat registry per-tipe.

| Type               | Config                                    | Arti                                                        |
| ------------------ | ----------------------------------------- | ---------------------------------------------------------- |
| `MINIMUM_PURCHASE` | `{ minPurchase: MoneyMap }`               | Subtotal cart ≥ minimum untuk currency order               |
| `CATEGORY_SPEND`   | `{ categoryId, categorySpend: MoneyMap }` | Total belanja pada 1 kategori ≥ nilai tertentu             |
| `BUY_PRODUCT`      | `{ productId? \| variantId?, quantity }`  | Beli minimal N unit produk/varian tertentu                 |
| `CUSTOMER_TYPE`    | `{ customerType }`                        | Hanya untuk `RETAIL` atau `RESELLER`                       |
| `FIRST_PURCHASE`   | `{}`                                      | Hanya untuk pembelian pertama (0 order sebelumnya)         |
| `NEW_CUSTOMER`     | `{}`                                      | Hanya untuk customer baru (0 order sebelumnya)             |

> `FIRST_PURCHASE` / `NEW_CUSTOMER` **diturunkan** dari jumlah order customer (`Order.countDocuments({ userId })`) — tidak ada field `isNewCustomer` di model User.

**Contoh** minimum purchase per currency:

```json
{ "type": "MINIMUM_PURCHASE", "config": { "minPurchase": { "IDR": 300000, "USD": 20 } } }
```

---

## 🎁 Rewards

Reward juga berbentuk `{ type, config }`. Sebuah promo bisa punya lebih dari satu reward. Jika `tiers` terisi, reward top-level **diabaikan** (dipakai reward tier yang lolos — lihat [Tiers](#-tiers)).

| Type                  | Config                                            | Arti                                                 |
| --------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| `PERCENTAGE_DISCOUNT` | `{ percentage, maxDiscount?: MoneyMap }`          | Diskon % dari subtotal item yang eligible, dibatasi `maxDiscount` |
| `FIXED_DISCOUNT`      | `{ amount: MoneyMap }`                            | Potongan nominal (tidak melebihi subtotal eligible)  |
| `SHIPPING_DISCOUNT`   | `{ amount: MoneyMap }`                            | Potongan ongkir (tidak melebihi ongkir)              |
| `FREE_SHIPPING`       | `{}`                                              | Ongkir gratis (diskon = seluruh ongkir)              |
| `FREE_GIFT`           | `{ selection, gifts[] }`                          | Hadiah barang                                        |

**`PERCENTAGE_DISCOUNT`** wajib punya `percentage` (0–100) dan boleh punya `maxDiscount` (MoneyMap) sebagai batas atas.

**`FREE_GIFT`** mendukung tiga mode pemilihan (`FreeGiftSelection`): `AUTO`, `CUSTOMER_SELECT`, `FIRST_AVAILABLE`, dan daftar `gifts`:

```json
{
  "type": "FREE_GIFT",
  "config": {
    "selection": "AUTO",
    "gifts": [{ "productId": "...", "variantId": "...", "variantName": "Size M", "quantity": 1 }]
  }
}
```

> **Cakupan diskon mengikuti `appliesTo`.** Percentage & fixed discount dihitung dari **subtotal item yang cocok dengan `appliesTo`** (eligible subtotal), bukan selalu seluruh cart. Untuk scope `ALL`, semua item ikut.

---

## 🪜 Tiers

Promo bisa punya beberapa tier tanpa membuat promo terpisah untuk tiap tingkat.

```ts
tiers: [
  { threshold: { IDR: 300000 },  rewards: [{ type: "PERCENTAGE_DISCOUNT", config: { percentage: 10 } }] },
  { threshold: { IDR: 500000 },  rewards: [{ type: "PERCENTAGE_DISCOUNT", config: { percentage: 15 } }] },
  { threshold: { IDR: 1000000 }, rewards: [{ type: "PERCENTAGE_DISCOUNT", config: { percentage: 20 } }] },
]
```

- Engine memilih **tier tertinggi yang lolos** berdasarkan subtotal cart untuk currency order.
- Jika `tiers` terisi, ia **menggantikan** `rewards` top-level.
- Jika tidak ada tier yang lolos, promo dianggap tidak valid dengan alasan minimum spend tier terendah.

Contoh: subtotal `Rp600.000` → tier `500k` yang aktif → diskon 15% = `Rp90.000`.

---

## 👥 Customer Rules & Limits

**`customerRules`** (semua default `false`):

| Rule                | Arti                                                              |
| ------------------- | ---------------------------------------------------------------- |
| `firstPurchaseOnly` | Hanya untuk pembelian pertama customer                           |
| `newCustomerOnly`   | Hanya untuk customer baru (0 order sebelumnya)                   |
| `resellerOnly`      | Hanya untuk customer reseller (`orderType` B2B)                 |

**`limits`** (semua opsional):

| Limit                 | Arti                                                          |
| --------------------- | ------------------------------------------------------------- |
| `maxDiscount`         | MoneyMap — batas atas total diskon produk per order           |
| `maxUsagePerCustomer` | Berapa kali satu customer boleh memakai promo ini             |
| `totalQuota`          | Total kuota pemakaian untuk semua customer                    |

---

## ⚙️ Promotion Engine

Engine ada di `src/lib/helpers/promotion-engine.ts`. **Fungsi murni, tanpa akses database** — pemanggil (route API) yang memuat promo + jumlah pemakaian, lalu menyerahkannya ke engine.

### Alur evaluasi

```
evaluatePromotion({ promotion, cart, customer, currency, now, usageStats })

1. Status ACTIVE?                         → tidak: { valid:false, reason:"not active" }
2. Dalam rentang startAt..endAt?          → tidak: "not started yet" / "expired"
3. Kuota belum habis?                     → habis: "Quota exhausted" / limit per customer
4. customerRules terpenuhi?               → tidak: "resellers only" / "first purchase only" ...
5. Item cocok dengan appliesTo?           → tidak ada: "No items ... qualify"
6. Semua conditions terpenuhi?            → tidak: alasan condition (mis. minimum purchase)
7. Hitung reward (tier menggantikan rewards bila ada)
8. Terapkan cap limits.maxDiscount, clamp diskon ongkir ke ongkir
→ { valid:true, promotion, discount, shippingDiscount, freeGift, appliedTier, messages }
```

### Bentuk hasil (sesuai brief)

**Berhasil:**

```json
{
  "valid": true,
  "promotion": { ... },
  "discount": 30000,
  "shippingDiscount": 0,
  "freeGift": null,
  "appliedTier": null,
  "messages": []
}
```

**Gagal:**

```json
{ "valid": false, "reason": "Minimum purchase Rp300.000" }
```

### Registry (kunci extensibility)

- `conditionEvaluators[type](config, ctx)` → `{ pass, reason? }`
- `rewardCalculators[type](config, ctx)` → `{ discount, shippingDiscount, freeGift }`

Menambah jenis promo baru = **menambah satu entri** di registry validator (`promotion-validation.ts`) + evaluator/calculator (`promotion-engine.ts`). Tidak perlu ubah schema, tidak ada `if/else` bertingkat.

### Lapisan service (`promotion-service.ts`)

Akses DB dipisah dari engine murni:

| Fungsi                          | Kegunaan                                                                 |
| ------------------------------- | ----------------------------------------------------------------------- |
| `getCustomerOrderCount(userId)` | Hitung order customer (untuk first purchase / new customer)              |
| `getUsageStats(promotionId, userId)` | `{ totalUsed, customerUsed }` dari `promotion_usages`              |
| `evaluatePromotionDoc(promo, input)` | Rakit stats + panggil engine                                       |
| `evaluateByCode(code, input)`   | Cari promo by code lalu evaluasi (jalur input manual)                    |
| `listAvailablePromotions(input)`| Promo untuk selector order + evaluasi tiap kartu                        |
| `resolveAppliedPromotions({ codes, cart, customer, currency, now? })` | **Re-evaluasi otoritatif** satu set code saat submit → `{ appliedPromotions, promotionDiscount, invalid[] }`. Validasi kombinasi stacking. Dipakai ketiga route order |
| `recordOrderPromotionUsages(order)` | Catat pemakaian + `$inc usedCount` saat order dibuat. **Idempotent** (skip code yg sudah tercatat utk `orderId`) |
| `clearOrderPromotionUsages(orderId)` | Hapus pemakaian order + `$dec usedCount` (tak pernah < 0)            |
| `syncOrderPromotionUsages(order)` | Rekonsiliasi = `clear` + `record` (jalur edit)                        |

---

## ✅ Validasi

Tidak ada library validasi (zod/yup) di project ini — sama seperti modul lain. Validasi bertingkat:

1. **Validator Mongoose** — `required`, `enum`, `min`, `unique`, `pre("save")` untuk `endAt > startAt`.
2. **`validatePromotionPayload()`** di `promotion-validation.ts` — dipakai handler POST/PUT, mengembalikan array pesan error yang rapi (400).
3. **Registry per-tipe** — `conditionConfigValidators` & `rewardConfigValidators` dipakai bersama oleh validator Mongoose subdoc **dan** handler route (satu sumber kebenaran).
4. **Validasi sisi client** — form memanggil `validatePromotionPayload()` sebelum submit.

Aturan wajib yang dijamin:

- `code` unik (index unik + cek duplikat di handler, seperti pola Currency)
- `endAt` > `startAt`
- percentage 0–100 (reward & tier reward)
- `priority` ≥ 0
- kuota / limit tidak boleh negatif
- MoneyMap tidak boleh negatif
- Promo wajib punya minimal satu reward **atau** satu tier

> Catatan: `endAt > startAt` dicek manual di handler POST **dan** PUT, karena `pre("save")` tidak jalan pada `findByIdAndUpdate`.

---

## 🚀 API Endpoints

Semua endpoint di bawah `/api/admin/promotions`. Response memakai amplop standar `{ success, data, message }`.

### 1. List Promotions

**GET** `/api/admin/promotions` — semua promo (kecuali soft deleted), urut `priority` lalu `createdAt`.

### 2. Create Promotion

**POST** `/api/admin/promotions`

```json
{
  "name": "New Year Sale",
  "code": "welcome10",
  "trigger": "CODE",
  "status": "ACTIVE",
  "priority": 1,
  "stackable": false,
  "startAt": "2026-01-01T00:00",
  "endAt": "2026-01-31T23:59",
  "appliesTo": { "scope": "ALL", "ids": [] },
  "conditions": [
    { "type": "MINIMUM_PURCHASE", "config": { "minPurchase": { "IDR": 300000 } } }
  ],
  "rewards": [
    { "type": "PERCENTAGE_DISCOUNT", "config": { "percentage": 10, "maxDiscount": { "IDR": 100000 } } }
  ],
  "tiers": [],
  "customerRules": { "firstPurchaseOnly": false, "newCustomerOnly": false, "resellerOnly": false },
  "limits": { "totalQuota": 100, "maxUsagePerCustomer": 1 }
}
```

- `code` otomatis di-uppercase → `WELCOME10`
- Ditolak (400) jika code sudah ada, tanggal tidak valid, percentage > 100, atau config tidak lengkap

**Response error (validasi):**

```json
{ "success": false, "message": ["End date must be after start date", "Reward #1: Percentage must be between 0 and 100"] }
```

### 3. Get / Update / Delete

- **GET** `/api/admin/promotions/:id` — ambil satu
- **PUT** `/api/admin/promotions/:id` — update (cek duplikat code kecuali diri sendiri, `runValidators`)
- **PATCH** `/api/admin/promotions/:id` — soft delete (`deleted: true`, `deletedAt`), pola sama dengan resource lain (`DeleteButton resource="promotions"`)

### 4. Available Promotions (untuk selector order)

**POST** `/api/admin/promotions/available`

```json
{ "cart": { "items": [...], "subtotal": 500000, "shippingCost": 20000 },
  "customer": { "userId": "...", "type": "RETAIL" },
  "currency": "IDR" }
```

Mengembalikan promo `ACTIVE` + `CODE` + dalam rentang tanggal, masing-masing dilengkapi `evaluation` (valid/tidak + alasan) sehingga UI bisa langsung menampilkan kartu enabled/disabled dalam satu request.

### 5. Evaluate (apply / input manual)

**POST** `/api/admin/promotions/evaluate`

```json
{ "code": "WELCOME10", "cart": {...}, "customer": {...}, "currency": "IDR" }
```

`data` berisi hasil engine (`{ valid, promotion, discount, shippingDiscount, freeGift, messages }` atau `{ valid:false, reason }`). Dipakai saat admin mengetik code manual atau menekan Apply.

### 6. Endpoint Publik (Cart Customer)

Cart storefront memakai endpoint di bawah `/api/public/promotions` — **proxy tipis** yang memanggil `listAvailablePromotions` / `evaluateByCode` yang sama. Evaluasi bersifat read-only (murni engine), jadi aman diekspos ke storefront.

- **POST** `/api/public/promotions/available` — sama seperti versi admin (daftar promo + `evaluation` per kartu).
- **POST** `/api/public/promotions/evaluate` — sama seperti versi admin (evaluasi 1 code).

Modal `promotion-selector-modal.tsx` menerima prop opsional **`availableEndpoint`** (default route admin); cart publik mengarahkannya ke `/api/public/promotions/available`.

---

## 🖥️ Frontend — Manajemen Promotion

| Halaman                              | Keterangan                                              |
| ------------------------------------ | ------------------------------------------------------- |
| `/dashboard/promotions`              | List, search by code/name, badge status, pagination 25  |
| `/dashboard/promotions/create`       | Form tambah promo                                       |
| `/dashboard/promotions/[id]/edit`    | Form edit promo                                         |
| `/dashboard/promotions/[id]/detail`  | View detail lengkap (read-only)                        |

Form (`form-promotion.tsx`) tersusun dari beberapa builder dinamis yang bisa dipakai ulang:

- **`applies-to-selector`** — pilih scope + item (multi-select produk/varian/kategori dengan search)
- **`condition-builder`** — tambah/hapus condition, input berubah sesuai tipe
- **`reward-builder`** — tambah/hapus reward (dipakai juga di dalam tier)
- **`tier-builder`** — threshold per-currency + reward per tier
- **`money-map-input`** — input nominal per-currency; daftar currency diambil dari `GET /api/admin/currencies` (bukan hardcode), IDR selalu ada

> Menambah `ConditionType`/`RewardType` baru cukup menambah satu entri enum + satu cabang di builder; sisanya (validasi, evaluasi, penyimpanan) ikut generik.

---

## 🛒 Integrasi Admin Order

Promo diterapkan dari halaman **Create Order** dan **Edit Order** lewat `promotion-selector-modal.tsx`.

### Selector & kartu promo

- Tombol **Apply Promotion** membuka modal berisi daftar promo dari `available` + input **code manual**.
- Tiap kartu menampilkan: **Nama, Code, Valid Until, badge (Voucher/Promotion), ringkasan benefit, ringkasan syarat**, dan tombol **View Details**.
- Promo yang tidak memenuhi syarat tetap tampil tapi **disabled beserta alasannya** (mis. `Minimum purchase Rp300.000`, `Promotion expired`, `Quota exhausted`, `This promotion is for resellers only`). Alasan diambil dari hasil engine.
- Search by code/name.

### Apply → update ringkasan order

Saat admin memilih promo (atau code manual valid):

1. Engine mengembalikan `discount`, `shippingDiscount`, `freeGift`.
2. Sebuah entri ditambahkan ke `appliedPromotions` (state), lengkap dengan breakdown & free gift.
3. **Aturan stacking:** promo `stackable=false` menggantikan semua promo lain; promo `stackable=true` hanya bisa berdampingan dengan promo stackable lain.
4. Ringkasan order menampilkan baris **Promotion discount** dan **Total** yang sudah dipotong.

### Bagaimana diskon promo tercatat di order

Keputusan desain penting agar tidak merusak invarian yang sudah ada:

- **`order.promotionDiscount` = total benefit promo (produk + ongkir)** dalam currency order.
- Nilai ini **dikurangkan dari net revenue** di `calculateOrderRevenue()`.
- `discountShipping` tetap murni manual (tidak dicampur), dan `totalAmount` tetap `Σ subTotal` — jadi diskon promo **tidak** didistribusikan ke tiap item.

```
Total tampil = Σ subTotal + shippingCost − discountShipping − promotionDiscount
netRevenue   = (totalAmount + shippingCost − discountShipping − promotionDiscount) × baseRupiah
```

`appliedPromotions[]` menyimpan rincian per-promo (productDiscount, shippingDiscount, freeGift) untuk audit, invoice, dan tampilan detail.

### Pencatatan pemakaian (kuota & audit)

- **Create order** (`POST /api/admin/orders`) → `recordOrderPromotionUsages()` membuat dokumen `promotion_usages` + `$inc usedCount` untuk tiap promo.
- **Edit order** (`PUT /api/admin/orders/:id`) → `syncOrderPromotionUsages()` merekonsiliasi (hapus pemakaian lama order itu + `usedCount -= n`, lalu catat ulang sesuai promo terkini).
- Applied promotions & free gift juga tampil di halaman **detail order** dan **invoice jsPDF**.

> Karena diskon promo bersifat per-currency, `appliedPromotions` di halaman **create** otomatis di-reset saat currency order diganti.

---

## 🛍️ Integrasi Cart Customer (Publik)

Customer kini bisa apply promo langsung di **`/cart`** (`src/app/(public)/cart/page.tsx`), memakai ulang `promotion-selector-modal.tsx` yang sama dengan Admin Order.

- Tombol **Apply Promotion** di Order Summary membuka modal (diarahkan ke endpoint publik `available` lewat prop `availableEndpoint`).
- Modal, kartu promo, ringkasan syarat/benefit, disabled+alasan, input code manual — semuanya identik dengan Admin Order.
- Aturan stacking sama: non-stackable menggantikan semua; stackable hanya berdampingan dengan stackable lain.
- Ringkasan cart menampilkan baris **Promotion discount** dan **Total** yang sudah dipotong (`total = Σ subTotal + shipping − promotionDiscount`).
- `appliedPromotions` + `promotionDiscount` ikut dikirim ke `POST /api/public/orders` saat checkout.

> **Guard stale-discount:** karena diskon per-currency dan bergantung isi cart, `appliedPromotions` otomatis di-reset saat qty diubah / item dihapus — mencegah diskon basi terbawa ke checkout. Server tetap re-evaluasi ulang (lihat bawah).

---

## 🔒 Re-evaluasi Server saat Submit (Otoritatif)

Sejak `/cart` publik bisa apply promo, order-submit menjadi **permukaan yang tidak tepercaya**. Karena itu **ketiga route order** kini menjalankan ulang engine di server dan **tidak mempercayai angka diskon dari client** — hanya **code** promo yang dibaca.

| Route | Perilaku |
| ----- | -------- |
| `POST /api/public/orders` | Re-evaluasi + `recordOrderPromotionUsages` (idempotent) |
| `POST /api/admin/orders` | Re-evaluasi + `recordOrderPromotionUsages` |
| `PUT /api/admin/orders/:id` | Re-evaluasi + rekonsiliasi usage (lihat catatan edit) |

### Alur di setiap route

```
1. normalizeOrderMoney → orderDetails, totalAmount (dibulatkan per-currency)
2. Bangun EvaluationCart dari orderDetails ternormalisasi + customer (type dari orderType)
3. codes = body.appliedPromotions[].code            // hanya CODE yg dibaca
4. resolveAppliedPromotions({ codes, cart, customer, currency })
   → { appliedPromotions (otoritatif), promotionDiscount (roundMoney), invalid[] }
5. invalid.length > 0 → HTTP 400 { success:false, message, invalidCodes }  // order TIDAK dibuat
6. Simpan appliedPromotions & promotionDiscount hasil SERVER (angka client diabaikan)
7. calculateOrderRevenue memakai promotionDiscount server → netRevenue
```

- **Reject on invalid:** bila ada code yang tidak lagi valid (expired / kuota habis / cart tak lagi memenuhi syarat) → **400** dengan daftar `invalidCodes`, order tidak dibuat, stok tidak berubah (public/admin create).
- **Validasi stacking di server:** kombinasi legal hanya *satu non-stackable* **atau** *banyak stackable*. Request yang mencoba menumpuk non-stackable ditolak.
- **Idempotency:** `recordOrderPromotionUsages` melewati promo yang sudah tercatat untuk `orderId` itu, jadi retry/submit-ganda tidak menggandakan `usedCount`.

### Catatan khusus jalur Edit (`PUT`)

Agar engine "melihat dunia tanpa order ini":

1. **Clear usage order ini dulu** — supaya promo berkuota-terbatas yang sudah dipakai order ini tidak dihitung melawan dirinya sendiri.
2. **`orderCount` dikecualikan diri** (`countDocuments({ userId, _id: { $ne: id } })`) — supaya rule first-purchase/new-customer tetap konsisten.
3. Bila re-evaluasi **invalid** → usage lama order **dipulihkan** (rollback) sebelum kembali 400.
4. Bila valid → order di-update lalu `recordOrderPromotionUsages` mencatat set terbaru.

---

## 🌐 Perubahan Storefront

Modul promo lama dulu menampilkan diskon otomatis di katalog (coret harga di kartu produk, badge diskon di detail, diskon B2C di cart). Karena promo sekarang **berbasis code saat checkout**, tampilan diskon otomatis itu dihapus:

- `src/components/product-card.tsx` — menampilkan **harga dasar** (min harga varian), tanpa coret otomatis.
- `src/components/product/product-pricing.tsx` — menampilkan harga dasar; diskon tier reseller (B2B) tetap jalan (jalur terpisah).
- `src/app/(public)/cart/page.tsx` — item memakai harga dasar (diskon tier reseller B2B tidak berubah). **Diskon promo kini diterapkan lewat code saat checkout** (lihat [Integrasi Cart Customer](#-integrasi-cart-customer-publik)), bukan otomatis per item.
- `PromoContext`, `promo-helper.ts`, dan mount `PromoProvider` di `providers.tsx` dihapus.

---

## ⚠️ Breaking Changes

1. **Collection & file promo lama dihapus.** `Promo` model, `types/promo.ts`, `promo-helper.ts`, `PromoContext`, route `/api/admin/promos` & `/api/promos/active`, UI `components/admin/promos/`, dan halaman `/dashboard/promos/` semuanya dihapus. Endpoint & halaman baru memakai path `promotions`.
2. **Sidebar** menu Promotion sekarang mengarah ke `/dashboard/promotions`.
3. **Diskon katalog otomatis dihilangkan.** Storefront menampilkan harga dasar; promo diterapkan lewat code saat checkout.
4. **Field baru di Order** (`appliedPromotions`, `promotionDiscount`) dan `calculateOrderRevenue()` sekarang menerima `promotionDiscount` (opsional, default 0) yang mengurangi net revenue.
5. **Tidak ada migrasi** dari schema lama — sesuai brief, schema lama dianggap deprecated.

---

## 📝 Catatan & Limitasi

### 1. ~~Input code di checkout customer (publik)~~ ✅ SELESAI (2026-07-20)

Cart publik `/cart` kini punya Apply Promotion (memakai ulang modal + endpoint publik). Lihat [Integrasi Cart Customer](#-integrasi-cart-customer-publik).

### 2. ~~Re-evaluasi sisi server saat submit~~ ✅ SELESAI (2026-07-21)

Ketiga route order kini re-evaluasi otoritatif di server (`resolveAppliedPromotions`) dan menolak checkout (400) bila code tidak valid. Lihat [Re-evaluasi Server saat Submit](#-re-evaluasi-server-saat-submit-otoritatif).

---

Beberapa hal sengaja **belum** dikerjakan dan menjadi follow-up:

### 3. Order-submit belum transaksional (sharp edge)

Route `PUT /api/admin/orders/:id` mengubah **stok sebelum** re-evaluasi promo, jadi edit yang ditolak karena promo invalid tetap sudah menyentuh stok (pola "mutate lalu validate" yang sudah ada). POST juga tidak transaksional. Follow-up: pindahkan validasi sebelum mutasi stok + bungkus dalam session/transaction MongoDB.

### 4. Trigger `AUTOMATIC` disiapkan, belum dipakai

Schema mendukung `AUTOMATIC`, tapi semua promo saat ini `CODE`. Promo otomatis di katalog memerlukan endpoint publik baru untuk menampilkannya.

### 5. Scope `BRANDS` direservasi

`BRANDS` valid di enum tetapi belum bisa dipilih karena belum ada model Brand. Desain `appliesTo` generik sehingga dukungan brand bisa ditambahkan tanpa mengubah schema.

---

## 🔬 Verifikasi

- ✅ **Type-check hijau** — `npx tsc --noEmit` bersih setelah penambahan endpoint publik + re-evaluasi server; tidak ada circular import.
- ✅ **Production build hijau** — `npm run build` sukses; seluruh route baru (`/dashboard/promotions/*`) ter-compile, route lama (`/dashboard/promos/*`) hilang, 0 error tipe di source.
- ✅ **Engine diuji unit** — 14/14 skenario lolos: minimum purchase (gagal & lolos + alasan), matematika persentase, cap `maxDiscount`, resolusi tier (600k→15%), `resellerOnly` (dua arah), free shipping, kuota habis, expired, filter `appliesTo`, dan derivasi first purchase.

Skenario yang perlu diuji manual di lingkungan dengan database (butuh MongoDB + session login + promo ter-seed):

**Admin Order & engine**

1. Seed satu promo lewat `POST /api/admin/promotions` (mis. `WELCOME10`, minimum purchase per currency, reward persentase + tier).
2. Di `dashboard/orders/create`, tambah item, buka selector — cek kartu aktif, kartu disabled + alasan, View Details, input code manual.
3. Apply promo valid → ringkasan/subtotal/diskon terupdate, `appliedPromotions` tercatat; apply promo invalid → error tampil.
4. Submit order → cek dokumen `promotion_usages` terbuat, `Promotion.usedCount` bertambah, dan `netRevenue` benar.
5. Uji B2B: promo `stackable` menambah di atas diskon tier reseller; non-stackable menggantikannya.

**Cart customer publik**

6. Di `/cart`, Apply Promotion → diskon & Total terupdate; ubah qty → `appliedPromotions` ter-reset.
7. Checkout dengan promo valid → order dibuat, `promotionDiscount`/`appliedPromotions` sesuai engine.

**Re-evaluasi server (otoritatif)**

8. **Tamper angka:** POST `/api/public/orders` dengan `promotionDiscount` digelembungkan tapi code valid → order tersimpan dengan angka **server**, bukan angka client.
9. **Code palsu/expired:** POST dengan code tak dikenal/expired → **400** + `invalidCodes`, order tidak dibuat.
10. **Kuota:** set promo `totalQuota: 1`, pakai sekali, checkout kedua dengan code itu → **400** "Quota exhausted".
11. **Edit order:** ubah promo lewat `PUT` → nilai otoritatif tersimpan & usage direkonsiliasi (`promotion_usages` + `usedCount` benar, tanpa duplikat saat simpan ulang).
