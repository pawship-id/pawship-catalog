# 🚀 Production Deploy — Currency & Revenue

Checklist untuk menerapkan fitur currency + revenue snapshot ke **produksi**. Semua langkah backfill sudah dijalankan di database development; produksi punya data order sendiri, jadi langkah-langkah ini **diulang dari awal di prod**.

Dokumentasi teknis fiturnya ada di [CURRENCY_MANAGEMENT.md](./CURRENCY_MANAGEMENT.md).

---

## ⚠️ Baca dulu sebelum mulai

- **Target database.** Dev dan prod ada di cluster yang sama, hanya beda `MONGODB_DATABASE_NAME`:
  - dev : `db_pawship_catalog_development`
  - prod: `db_pawship_catalog`
- **Selalu cek nama DB yang tercetak.** Setiap script backfill mencetak baris `✅ Connected (db: ...)` di awal. **Pastikan tertulis `db_pawship_catalog`** sebelum menjalankan `--apply`. Ini pengaman utama agar tidak salah database.
- **Dry run adalah default.** Semua backfill tidak menulis apa pun tanpa flag `--apply`. Jalankan tanpa flag dulu, baca outputnya, baru apply.
- **Idempotent.** Aman dijalankan berkali-kali. Run kedua dengan `--apply` menghasilkan 0 update.
- **Urutan wajib:** backfill revenue **sebelum** backfill money (money butuh `baseRupiah` yang distempel revenue).

---

## Langkah

### 0. Backup database prod

Wajib — backfill menulis ke data order asli.

```bash
mongodump --uri="<MONGODB_URI dari .env>" --db=db_pawship_catalog --out=./backup-$(date +%F)
```

Simpan hasilnya. Kalau ada yang salah, restore dengan `mongorestore`.

### 1. Deploy kode

Pastikan branch berisi fitur ini sudah ter-merge dan ter-deploy ke prod. Script backfill hidup di `src/lib/migrations/`, jadi environment tempat menjalankannya harus punya repo lengkap + `node_modules` + `.env` yang menunjuk prod.

### 2. Arahkan `.env` ke prod

Di `.env`, aktifkan baris prod dan matikan baris dev:

```
MONGODB_URI="...(prod)..."
MONGODB_DATABASE_NAME="db_pawship_catalog"
```

### 3. Seed currency

```bash
npm run seed:currency
```

Membuat baris IDR/USD/SGD/HKD (idempotent, tidak menimpa yang sudah ada).

> **Penting:** seeder mengisi rate lama sebagai nilai default (USD 16000, SGD 11000, HKD 2000). Setelah seeding, buka **Dashboard → Currencies** dan **set rate asli saat ini**. Rate inilah yang dipakai untuk order baru ke depan. Kalau currency yang dipakai order tidak terdaftar, pembuatan order akan gagal dengan pesan `Currency ... is not configured`.

### 4. Backfill revenue

Isi `baseRupiah`, `grossRevenue`, `netRevenue` untuk order lama.

```bash
# 4a. Dry run — WAJIB dibaca
npm run backfill:revenue
```

Cek output:

- **`Rate mismatch` harus 0.** Ini paling kritis. Script mengasumsikan order lama dulu dihitung dengan rate legacy (USD 16000, SGD 11000, HKD 2000). Kalau prod ternyata memakai rate lain, mismatch akan > 0 — **STOP, jangan apply**, lihat bagian [Kalau rate mismatch > 0](#kalau-rate-mismatch--0).
- **`Perubahan Total Revenue`** masuk akal (harusnya turun sedikit dari koreksi diskon ongkir, bukan naik besar).

```bash
# 4b. Kalau bersih, baru apply
npm run backfill:revenue -- --apply
```

### 5. Backfill money

Bulatkan `subTotal`, price map, dan `totalAmount` ke presisi currency, lalu hitung ulang gross/net dari `baseRupiah` yang barusan distempel. **Harus setelah langkah 4.**

```bash
# 5a. Dry run
npm run backfill:money

# 5b. Apply
npm run backfill:money -- --apply
```

### 6. Verifikasi

- Buka beberapa order di **Dashboard → Orders**, terutama yang punya diskon. Pastikan `totalAmount` dan revenue di halaman detail sudah pas dengan yang tersimpan.
- Cek **Total Revenue** di dashboard tidak melonjak aneh.
- Buat satu order percobaan (atau cek order baru pertama) untuk memastikan `baseRupiah`, `grossRevenue`, `netRevenue` terisi otomatis.

---

## Kalau rate mismatch > 0

Artinya asumsi rate legacy (`LEGACY_RATES` di `src/lib/migrations/backfillOrderRevenue.js`) tidak cocok dengan rate yang dulu benar-benar dipakai prod. Script tetap memproses order tersebut, tapi angkanya perlu dicek.

Jangan langsung `--apply`. Output dry run menampilkan daftar order yang mismatch beserta nilai tersimpan vs nilai yang diharapkan. Kirim daftar itu untuk ditinjau — kemungkinan `LEGACY_RATES` perlu disesuaikan dengan rate historis prod sebelum backfill dijalankan.

---

## Ringkasan perintah

```bash
# 0. backup
mongodump --uri="<prod>" --db=db_pawship_catalog --out=./backup-$(date +%F)

# 2. set .env -> db_pawship_catalog, lalu:
npm run seed:currency            # + set rate asli di dashboard

npm run backfill:revenue         # dry run, cek mismatch = 0
npm run backfill:revenue -- --apply

npm run backfill:money           # dry run
npm run backfill:money -- --apply
```

---

## Hasil di development (referensi)

Sebagai pembanding, hasil saat dijalankan di `db_pawship_catalog_development`:

| Langkah          | Hasil                                                        |
| ---------------- | ----------------------------------------------------------- |
| backfill:revenue | 59 order diupdate, 0 dilewati, **0 mismatch**, revenue −Rp27.792 |
| backfill:money   | 15 order dirapikan, 44 sudah bersih, 0 dilewati             |

Angka di prod akan berbeda (jumlah order beda), tapi pola yang diharapkan sama: **0 mismatch** dan perubahan revenue kecil.
