# 🏷️ Bulk Harga Multi-Currency (Variant Editor)

> **Tanggal update:** 18 Juli 2026

Dokumentasi untuk perubahan pada fitur **bulk harga** di tab **Variation & Pricing** halaman product **create** (`/dashboard/products/create`) **dan edit** (`/dashboard/products/[id]/edit`). Sebelumnya admin hanya menginput satu harga IDR lalu sistem meng-_convert_ otomatis ke semua currency. Sekarang admin menginput harga **per currency** secara manual.

> Kedua halaman (create & edit) memakai komponen yang sama (`FormProduct` → `VariantEditor`), jadi perubahan ini otomatis berlaku di keduanya.

Fitur ini berkaitan dengan [Currency Management System](./CURRENCY_MANAGEMENT.md) — daftar currency yang tampil di sini diambil dari collection `currencies`.

## 📋 Table of Contents

- [Overview](#-overview)
- [Perubahan Perilaku](#-perubahan-perilaku)
- [File yang Diubah](#-file-yang-diubah)
- [Sebelum vs Sesudah](#-sebelum-vs-sesudah)
- [Alur Lengkap](#-alur-lengkap)
- [Input Desimal & Pemisah Ribuan](#-input-desimal--pemisah-ribuan)
- [Catatan & Limitasi](#-catatan--limitasi)

---

## 🎯 Overview

Tab **Variation & Pricing** punya area "bulk apply": admin mengisi input, memilih (checkbox) beberapa baris variant, lalu klik **Apply** untuk mengisi stock/harga baris-baris tersebut sekaligus.

**Sebelumnya:** ada satu input `Enter IDR price`. Nilai IDR yang diketik disimpan apa adanya untuk IDR, dan untuk currency lain **dibagi otomatis** dengan `rate` (baseRupiah) masing-masing. Seluruh price map baris di-_replace_.

**Sekarang:** ditampilkan **satu input harga untuk tiap currency** di collection. Kalau ada 3 currency → 3 input, kalau 5 → 5 input. Tidak ada konversi otomatis lagi; tiap currency diinput manual. Saat Apply, harga hanya di-_merge_ (bukan replace), dan currency yang tidak diisi tidak diutak-atik.

---

## 🔁 Perubahan Perilaku

| Aspek | Sebelum | Sesudah |
| --- | --- | --- |
| Jumlah input harga | 1 (IDR saja) | 1 per currency (dinamis dari collection `currencies`) |
| Nilai currency non-IDR | Hasil konversi `IDR / rate`, dibulatkan 1 desimal | Diinput manual per currency |
| Saat Apply | `price` baris di-**replace** total | `price` baris di-**merge** (gabung dengan yang sudah ada) |
| Input kosong / `0` | — | **Dilewati** — tidak menimpa harga currency itu di form |
| Input desimal koma (`5,6`) & pemisah ribuan (`1.500.000`) | Tidak relevan | Diformat **live** saat mengetik + dinormalisasi saat Apply |
| Field `rate` / `baseRupiah` | Dipakai untuk konversi | Tidak dipakai untuk hitung harga (currency list tetap dari API) |

**Aturan "input 0 = tidak diisi":** hanya currency dengan nilai **> 0** yang ikut di-Apply. Currency yang dibiarkan kosong atau `0` tetap memakai harga yang sudah ada di baris (misalnya yang sudah diset lewat modal **Set Prices** per baris).

---

## 📂 File yang Diubah

Semua perubahan ada di satu file:

- `src/components/admin/products/varian-editor.tsx` (dipakai bersama oleh form **create** & **edit** via `FormProduct`)
  - `parsePriceInput()` — helper baru, normalisasi desimal (koma/titik) + pemisah ribuan sebelum `Number()` (dipakai saat Apply).
  - `currencyDecimals()` — helper baru, jumlah desimal per currency via `Intl` (client-safe).
  - `formatPriceInput()` — helper baru, format live input ke gaya ID (ribuan titik, desimal koma) saat mengetik.
  - State `defaultStockPrice` — `priceDefault: string` diganti `priceByCurrency: Record<string, string>`.
  - `handleApply()` — kumpulkan input > 0, merge ke `price` tiap baris terpilih.
  - JSX bulk input — input tunggal IDR diganti `currencyList.map(...)` (satu input per currency) + `inputMode="decimal"` + format live di `onChange`.

Tidak ada perubahan di API, model, maupun modal **Set Prices** per baris (`variant-price-modal.tsx`).

---

## 🆚 Sebelum vs Sesudah

### State bulk input

```ts
// SEBELUM — satu harga IDR
const [defaultStockPrice, setDefaultStockPrice] = useState({
  stockDefault: 0,
  priceDefault: "",
});

// SESUDAH — harga per currency
const [defaultStockPrice, setDefaultStockPrice] = useState<{
  stockDefault: number;
  priceByCurrency: Record<string, string>;
}>({
  stockDefault: 0,
  priceByCurrency: {},
});
```

### Logika Apply

```ts
// SEBELUM — convert IDR ke semua currency, lalu replace price map
if (defaultStockPrice.priceDefault) {
  let tempPrice: Record<string, number> = {};
  currencyList.forEach((el) => {
    if (el.currency === "IDR") {
      tempPrice[el.currency] = Number(defaultStockPrice.priceDefault);
    } else if (el.rate > 0) {
      let price = Number(defaultStockPrice.priceDefault) / el.rate;
      tempPrice[el.currency] = Number(price.toFixed(1));
    }
  });
  updateData.price = tempPrice; // replace
}

// SESUDAH — kumpulkan hanya input > 0, lalu merge
const priceEntries: Record<string, number> = {};
currencyList.forEach((el) => {
  const num = parsePriceInput(defaultStockPrice.priceByCurrency[el.currency]);
  if (Number.isFinite(num) && num > 0) {
    priceEntries[el.currency] = num;
  }
});
// ...
if (hasPriceInput) {
  updateData.price = {
    ...(item.price || {}), // pertahankan harga yang sudah ada
    ...priceEntries,        // timpa hanya currency yang diisi
  };
}
```

### UI input

```tsx
// SEBELUM — satu input IDR
<Input placeholder="Enter IDR price" value={defaultStockPrice.priceDefault} ... />

// SESUDAH — satu input per currency
{currencyList.map((el) => (
  <div key={el.currency}>
    <label>{el.currency}</label>
    <Input
      inputMode="decimal"
      placeholder={`Enter ${el.currency} price`}
      value={defaultStockPrice.priceByCurrency[el.currency] ?? ""}
      onChange={(e) =>
        setDefaultStockPrice((prev) => ({
          ...prev,
          priceByCurrency: {
            ...prev.priceByCurrency,
            // format live: batasi desimal per currency, titik ribuan hanya IDR
            [el.currency]: formatPriceInput(
              e.target.value,
              currencyDecimals(el.currency),
              el.currency === "IDR",
            ),
          },
        }))
      }
    />
  </div>
))}
```

---

## 🧭 Alur Lengkap

1. Editor fetch daftar currency dari `GET /api/admin/currencies` (IDR selalu ada, di-sort paling depan).
2. FE render satu input **Stock** + satu input harga untuk **tiap currency**.
3. Admin isi sebagian/semua input, lalu centang baris variant yang mau diubah.
4. Klik **Apply**:
   - Validasi: minimal salah satu dari stock atau harga (> 0) harus diisi, dan minimal satu baris terpilih.
   - Untuk tiap baris terpilih: set `stock` (jika diisi) dan merge harga currency yang diisi ke `price` baris.
   - Currency yang kosong/`0` **tidak** disentuh.
   - Reset input, uncheck baris.

---

## 🔢 Input Desimal & Pemisah Ribuan

Ada dua lapis: **format live saat mengetik** (`formatPriceInput`) dan **parsing saat Apply** (`parsePriceInput`).

### a) Format live saat mengetik (`formatPriceInput`)

Setiap kali admin mengetik, nilainya langsung diformat: **koma untuk desimal**, jumlah desimal dibatasi sesuai currency (`currencyDecimals()` via `Intl`: IDR/JPY → 0, USD/SGD/HKD → 2). **Pemisah ribuan (titik) hanya untuk rupiah** — currency lain tampil tanpa titik (parameter `groupThousands`, hanya `true` untuk `IDR`).

| Currency | Ketik | Tampil |
| --- | --- | --- |
| IDR (0 desimal, pakai titik) | `1500000` | `1.500.000` |
| IDR | `1500000,50` | `1.500.000` (koma diabaikan) |
| USD (2 desimal, tanpa titik) | `1234567` | `1234567` |
| USD | `1234,5` | `1234,5` |
| USD | `12,505` | `12,50` (dipotong 2 desimal) |

```ts
function currencyDecimals(currency: string): number {
  try {
    const fmt = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: String(currency || "").toUpperCase(),
    });
    return fmt.resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

function formatPriceInput(
  raw: string,
  maxDecimals: number,
  groupThousands: boolean, // true hanya untuk IDR
): string {
  const cleaned = String(raw ?? "").replace(/[^\d,]/g, "");
  if (cleaned === "") return "";
  const commaIdx = cleaned.indexOf(",");
  const intDigits = (
    commaIdx === -1 ? cleaned : cleaned.slice(0, commaIdx)
  ).replace(/,/g, "");
  const decDigits =
    commaIdx === -1 ? null : cleaned.slice(commaIdx + 1).replace(/,/g, "");
  const normalizedInt = intDigits.replace(/^0+(?=\d)/, "");
  const groupedInt =
    normalizedInt === "" || !groupThousands
      ? normalizedInt
      : normalizedInt.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (maxDecimals <= 0 || decDigits === null) return groupedInt;
  return `${groupedInt},${decDigits.slice(0, maxDecimals)}`;
}
```

Nilai yang disimpan di state **sudah dalam bentuk terformat** (mis. `"1.500.000"`), dan itu yang tampil di input.

### b) Parsing saat Apply (`parsePriceInput`)

Saat Apply, string terformat dinormalisasi jadi angka. Karena JS hanya mengerti titik desimal, `parsePriceInput()` menentukan mana pemisah ribuan & desimal, lalu memanggil `Number()`. Selain menerima output `formatPriceInput`, ia juga tahan terhadap format US (`1,500,000.50`) dan angka polos (`15000`).

**Aturan penentuan pemisah:**

| Kondisi input | Interpretasi | Contoh |
| --- | --- | --- |
| Ada `.` dan `,` | Pemisah yang **muncul paling akhir** = desimal, sisanya ribuan | `1.500.000,50` → `1500000.5` |
| Satu jenis, muncul >1x | Semua = pemisah ribuan | `1.000.000` → `1000000` |
| Satu jenis, muncul 1x, 3 digit di belakang (angka depan bukan 0) | Pemisah ribuan | `150.000` → `150000` |
| Satu jenis, muncul 1x, selain di atas | Pemisah desimal | `5,6` → `5.6`, `0.50` → `0.5` |

```ts
function parsePriceInput(raw: string | undefined): number {
  if (raw === undefined || raw === null) return NaN;
  let s = String(raw).trim().replace(/\s/g, "");
  if (s === "") return NaN;

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");

  if (hasComma && hasDot) {
    const decimalSep = s.lastIndexOf(",") > s.lastIndexOf(".") ? "," : ".";
    const thousandSep = decimalSep === "," ? "." : ",";
    s = s.split(thousandSep).join("").replace(decimalSep, ".");
  } else if (hasComma || hasDot) {
    const sep = hasComma ? "," : ".";
    const parts = s.split(sep);
    const isThousand =
      parts.length > 2 ||
      (parts[1]?.length === 3 && parts[0] !== "" && parts[0] !== "0");
    s = isThousand ? parts.join("") : parts.join(".");
  }

  return Number(s);
}
```

Nilai tetap disimpan apa adanya di state (jadi tampil sesuai yang diketik); normalisasi hanya terjadi saat parsing di `handleApply`.

---

## ⚠️ Catatan & Limitasi

- **Berlaku di create & edit.** Komponen `VariantEditor` dipakai bersama oleh `FormProduct` untuk mode `create` maupun `edit`, jadi fitur ini tampil sama di kedua halaman. Di mode edit, harga currency yang tidak diisi tetap memakai nilai lama dari produk (karena logic-nya merge, bukan replace).
- **Ambiguitas pemisah tunggal (fallback parsing).** `formatPriceInput` sudah memaksa gaya ID (ribuan titik, desimal koma) saat mengetik, jadi input normal tidak ambigu. Tapi bila ada nilai dari sumber lain yang diparse `parsePriceInput`, penentuan ribuan vs desimal untuk satu pemisah tunggal memakai heuristik "3 digit di belakang = ribuan" — jadi `1.500` dibaca `1500` (bukan `1.5`).
- **Posisi kursor saat format live.** Karena input diformat ulang setiap ketikan (controlled input), mengetik/menghapus di **tengah** angka bisa memindahkan kursor ke akhir. Untuk alur ketik-lalu-lanjut biasa (menambah digit di belakang) tidak terasa. Ini trade-off umum formatting live tanpa manajemen kursor.
- **Tidak ada konversi otomatis lagi.** Field `rate` / `baseRupiah` tidak dipakai untuk menghitung harga di alur bulk ini — hanya dipakai untuk tahu currency apa saja yang ada dan urutan (IDR dulu). Tiap currency harus diisi manual bila ingin diubah.
- **Modal Set Prices per baris tidak berubah** — tetap bisa dipakai untuk mengatur harga tiap currency pada satu baris.
