# 🧪 Contoh Kasus Uji Promotion (Input Promo + Order)

Dokumen ini berisi contoh data promo yang siap kamu input, beserta skenario order untuk mengetesnya end-to-end. Semua contoh memakai currency **IDR** (customer retail) supaya gampang.

## Daftar Isi

- [Cara Input Promo](#cara-input-promo)
- [Cara Order & Menerapkan Promo](#cara-order--menerapkan-promo)
- [Kumpulan Kasus Uji](#kumpulan-kasus-uji)
  - [Case 1 — WELCOME10 (persentase + minimum purchase + kuota)](#case-1--welcome10)
  - [Case 2 — FREESHIP (gratis ongkir)](#case-2--freeship)
  - [Case 3 — RAMADHAN25 (tier bertingkat)](#case-3--ramadhan25)
  - [Case 4 — RESELLER50 (khusus reseller + fixed discount)](#case-4--reseller50)
  - [Case 5 — NEWBIE15 (first purchase only)](#case-5--newbie15)
  - [Case 6 — GIFTPACK (free gift)](#case-6--giftpack)
- [Cara Verifikasi Hasil](#cara-verifikasi-hasil)

---

## Cara Input Promo

Ada **2 cara**:

### A. Lewat form (UI)

1. Buka **Dashboard → Promotion → Add Promotion** (`/dashboard/promotions/create`).
2. Isi per tab:
   - **Basic Info**: Name, Code, Trigger `CODE`, Status `ACTIVE`, Priority, Start at, End at.
   - **Applies To**: pilih Scope (default `All products`).
   - **Conditions**: tambah syarat (mis. Minimum purchase).
   - **Rewards**: tambah hadiah (mis. Percentage discount).
   - **Tiers**: isi kalau mau reward bertingkat.
   - **Rules & Limits**: reseller only, kuota, dsb.
3. Klik **Create Promotion**.

> Nominal uang diisi **per currency**. Untuk tes retail cukup isi kolom **IDR**.

### B. Lewat API (lebih cepat untuk seed banyak promo)

Endpoint `POST /api/admin/promotions` (tidak butuh login). Contoh:

```bash
curl -X POST http://localhost:3000/api/admin/promotions \
  -H "Content-Type: application/json" \
  -d @promo.json
```

Body JSON tiap case ada di bawah. Ganti tanggal bila perlu (pastikan **sekarang** ada di antara `startAt` dan `endAt`).

---

## Cara Order & Menerapkan Promo

1. Buka **Dashboard → Orders → Create Order** (`/dashboard/orders/create`).
2. **Select Customer** — pilih customer `retail` (untuk B2C) atau `reseller` (untuk B2B). Currency ikut otomatis.
3. **Add Product** — tambah 1–2 produk, atur quantity/harga sampai subtotal sesuai skenario.
4. (Opsional) isi **Shipping Cost** untuk tes promo ongkir.
5. Klik **Apply Promotion** di kartu Order Summary:
   - Muncul daftar kartu promo. Yang tidak memenuhi syarat tampil **disabled + alasannya**.
   - Bisa juga ketik **code manual** lalu **Apply code**.
6. Kalau valid → ringkasan (baris **Promotion discount** + **Total**) langsung ter-update.
7. Klik **Create Order** untuk menyimpan (usage & kuota tercatat).

---

## Kumpulan Kasus Uji

### Case 1 — WELCOME10

**Uji:** persentase diskon + syarat minimum belanja + batas maksimal diskon + kuota.

| Field            | Nilai                                        |
| ---------------- | -------------------------------------------- |
| Name             | Welcome Discount                             |
| Code             | WELCOME10                                    |
| Applies To       | All products                                 |
| Condition        | Minimum purchase = **IDR 300.000**           |
| Reward           | Percentage discount **10%**, max **IDR 100.000** |
| Limits           | Total quota 100, Max usage/customer 1        |

```json
{
  "name": "Welcome Discount",
  "code": "WELCOME10",
  "trigger": "CODE",
  "status": "ACTIVE",
  "priority": 1,
  "stackable": false,
  "startAt": "2026-07-01T00:00",
  "endAt": "2026-12-31T23:59",
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

**Skenario order (customer retail):**

| Subtotal    | Hasil apply WELCOME10                                             |
| ----------- | ---------------------------------------------------------------- |
| Rp250.000   | ❌ Disabled — "Minimum purchase Rp300.000"                        |
| Rp500.000   | ✅ Diskon **Rp50.000** (10%), Total = 450.000 + ongkir            |
| Rp2.000.000 | ✅ 10% = 200.000, tapi dibatasi **Rp100.000** (kena maxDiscount)  |

Setelah dipakai 1× oleh customer yang sama → apply lagi = ❌ "You have reached the usage limit".

---

### Case 2 — FREESHIP

**Uji:** gratis ongkir + syarat minimum.

| Field      | Nilai                              |
| ---------- | ---------------------------------- |
| Code       | FREESHIP20                         |
| Condition  | Minimum purchase = **IDR 200.000** |
| Reward     | Free shipping                      |

```json
{
  "name": "Free Shipping",
  "code": "FREESHIP20",
  "trigger": "CODE", "status": "ACTIVE", "priority": 0, "stackable": true,
  "startAt": "2026-07-01T00:00", "endAt": "2026-12-31T23:59",
  "appliesTo": { "scope": "ALL", "ids": [] },
  "conditions": [
    { "type": "MINIMUM_PURCHASE", "config": { "minPurchase": { "IDR": 200000 } } }
  ],
  "rewards": [ { "type": "FREE_SHIPPING", "config": {} } ],
  "tiers": [],
  "customerRules": { "firstPurchaseOnly": false, "newCustomerOnly": false, "resellerOnly": false },
  "limits": {}
}
```

**Skenario order:** subtotal Rp250.000, **Shipping Cost = Rp20.000** → apply FREESHIP20 → ongkir dipotong **Rp20.000** (Total = subtotal saja).

---

### Case 3 — RAMADHAN25

**Uji:** reward bertingkat (tier) — engine memilih tier tertinggi yang lolos.

| Threshold     | Reward |
| ------------- | ------ |
| IDR 300.000   | 10%    |
| IDR 500.000   | 15%    |
| IDR 1.000.000 | 20%    |

```json
{
  "name": "Ramadhan Sale",
  "code": "RAMADHAN25",
  "trigger": "CODE", "status": "ACTIVE", "priority": 2, "stackable": false,
  "startAt": "2026-07-01T00:00", "endAt": "2026-12-31T23:59",
  "appliesTo": { "scope": "ALL", "ids": [] },
  "conditions": [],
  "rewards": [],
  "tiers": [
    { "threshold": { "IDR": 300000 },  "rewards": [ { "type": "PERCENTAGE_DISCOUNT", "config": { "percentage": 10 } } ] },
    { "threshold": { "IDR": 500000 },  "rewards": [ { "type": "PERCENTAGE_DISCOUNT", "config": { "percentage": 15 } } ] },
    { "threshold": { "IDR": 1000000 }, "rewards": [ { "type": "PERCENTAGE_DISCOUNT", "config": { "percentage": 20 } } ] }
  ],
  "customerRules": { "firstPurchaseOnly": false, "newCustomerOnly": false, "resellerOnly": false },
  "limits": {}
}
```

**Skenario order:**

| Subtotal    | Tier aktif | Diskon                    |
| ----------- | ---------- | ------------------------- |
| Rp250.000   | —          | ❌ "Minimum purchase Rp300.000" |
| Rp400.000   | 10%        | Rp40.000                  |
| Rp600.000   | 15%        | **Rp90.000**              |
| Rp1.200.000 | 20%        | Rp240.000                 |

---

### Case 4 — RESELLER50

**Uji:** promo khusus reseller (B2B) + potongan nominal tetap.

| Field         | Nilai                       |
| ------------- | --------------------------- |
| Code          | RESELLER50                  |
| Customer Rule | **Reseller only** ✅          |
| Reward        | Fixed discount **IDR 50.000** |
| Stackable     | on (boleh gabung diskon tier reseller) |

```json
{
  "name": "Reseller Bonus",
  "code": "RESELLER50",
  "trigger": "CODE", "status": "ACTIVE", "priority": 1, "stackable": true,
  "startAt": "2026-07-01T00:00", "endAt": "2026-12-31T23:59",
  "appliesTo": { "scope": "ALL", "ids": [] },
  "conditions": [],
  "rewards": [ { "type": "FIXED_DISCOUNT", "config": { "amount": { "IDR": 50000 } } } ],
  "tiers": [],
  "customerRules": { "firstPurchaseOnly": false, "newCustomerOnly": false, "resellerOnly": true },
  "limits": {}
}
```

**Skenario order:**

- Customer **retail** → apply = ❌ "This promotion is for resellers only".
- Customer **reseller** → apply = ✅ diskon **Rp50.000**. Karena `stackable: true`, diskon ini menempel **di atas** diskon tier reseller yang sudah ada.

---

### Case 5 — NEWBIE15

**Uji:** hanya untuk pembelian pertama (diturunkan dari jumlah order customer).

```json
{
  "name": "New Customer",
  "code": "NEWBIE15",
  "trigger": "CODE", "status": "ACTIVE", "priority": 1, "stackable": false,
  "startAt": "2026-07-01T00:00", "endAt": "2026-12-31T23:59",
  "appliesTo": { "scope": "ALL", "ids": [] },
  "conditions": [],
  "rewards": [ { "type": "PERCENTAGE_DISCOUNT", "config": { "percentage": 15 } } ],
  "tiers": [],
  "customerRules": { "firstPurchaseOnly": true, "newCustomerOnly": false, "resellerOnly": false },
  "limits": {}
}
```

**Skenario order:**

- Customer yang **sudah pernah order** → ❌ "This promotion is for first purchase only".
- Customer **baru (0 order)** → ✅ diskon 15%.

---

### Case 6 — GIFTPACK

**Uji:** free gift (barang hadiah). ⚠️ Ganti `productId`/`variantId` dengan produk yang **benar-benar ada** di databasemu (paling gampang input lewat form: tab Rewards → Free gift → pilih produk & variant dari dropdown).

```json
{
  "name": "Gift Pack",
  "code": "GIFTPACK",
  "trigger": "CODE", "status": "ACTIVE", "priority": 1, "stackable": false,
  "startAt": "2026-07-01T00:00", "endAt": "2026-12-31T23:59",
  "appliesTo": { "scope": "ALL", "ids": [] },
  "conditions": [
    { "type": "MINIMUM_PURCHASE", "config": { "minPurchase": { "IDR": 500000 } } }
  ],
  "rewards": [
    { "type": "FREE_GIFT", "config": {
      "selection": "AUTO",
      "gifts": [ { "productId": "<ID_PRODUK>", "variantId": "<ID_VARIANT>", "variantName": "Size M", "quantity": 1 } ]
    } }
  ],
  "tiers": [],
  "customerRules": { "firstPurchaseOnly": false, "newCustomerOnly": false, "resellerOnly": false },
  "limits": {}
}
```

**Skenario order:** subtotal ≥ Rp500.000 → apply GIFTPACK → kartu promo & ringkasan menampilkan **Free gift: Size M × 1**. Diskon uang = 0 (hadiahnya barang).

---

## Cara Verifikasi Hasil

Setelah **Create Order** dengan promo yang valid:

1. **Order tersimpan** dengan `appliedPromotions` + `promotionDiscount`, dan `netRevenue` sudah dikurangi diskon.
2. **Usage tercatat** — cek collection `promotion_usages` (1 dokumen per promo per order).
3. **Kuota naik** — `usedCount` di dokumen promo bertambah 1. Kalau `totalQuota` habis → promo jadi disabled "Quota exhausted".
4. **Detail & invoice** — buka `/dashboard/orders/[id]/detail`; ada bagian **Promotions** + **Total** yang sudah dipotong, dan tombol invoice (PDF) menampilkan baris **Promotion Discount**.

Cek cepat lewat MongoDB shell:

```js
db.promotions.find({ code: "WELCOME10" }, { code: 1, usedCount: 1, "limits.totalQuota": 1 })
db.promotion_usages.find({ promotionCode: "WELCOME10" }).sort({ createdAt: -1 })
```

> Tips: kalau mau tes ulang kuota dari nol, hapus dokumen `promotion_usages` untuk code itu lalu reset `usedCount` ke 0.
