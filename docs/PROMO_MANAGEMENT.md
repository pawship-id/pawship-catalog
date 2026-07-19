# 📢 Promo Management System — ⚠️ DEPRECATED

> **Dokumen ini sudah tidak berlaku.** Sistem promo lama (diskon persentase per-varian, collection `promos`) telah **diganti total** oleh Promotion Engine yang baru (breaking change).
>
> 👉 Lihat dokumentasi terbaru: **[PROMOTION_ENGINE.md](./PROMOTION_ENGINE.md)**

## Apa yang berubah?

Modul lama hanya mendukung diskon persentase per varian produk dan tampil otomatis di katalog. Modul baru adalah **promotion engine berbasis kode** dengan syarat (conditions), hadiah (rewards), tier, kuota, dan pencatatan pemakaian.

| Lama (dihapus)                        | Baru                                                      |
| ------------------------------------- | -------------------------------------------------------- |
| Model `Promo`, collection `promos`    | Model `Promotion` (`promotions`) + `PromotionUsage`      |
| `promoName`, `discountPercentage`     | `code`, `conditions[]`, `rewards[]`, `tiers[]`           |
| Diskon otomatis di katalog            | Diterapkan lewat **promotion code** saat checkout        |
| `/dashboard/promos`                   | `/dashboard/promotions`                                  |
| `/api/admin/promos`                   | `/api/admin/promotions` (+ `available`, `evaluate`)      |

Seluruh file modul lama (model, types, helper, context, route, UI) sudah dihapus. Tidak ada migrasi dari schema lama — sesuai desain breaking change.

Untuk detail lengkap (schema, engine, API, integrasi Admin Order, breaking changes), baca **[PROMOTION_ENGINE.md](./PROMOTION_ENGINE.md)**.
