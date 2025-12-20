# Product Description Formatting Examples

Seeder sekarang otomatis memformat product description dari Excel menjadi HTML yang rapi untuk web.

## 📝 Format yang Didukung

### 1. Line Breaks / Enter

**Di Excel:**

```
Baris pertama
Baris kedua
Baris ketiga
```

**Hasil di Database:**

```html
Baris pertama<br />Baris kedua<br />Baris ketiga
```

**Tampilan di Web:**

```
Baris pertama
Baris kedua
Baris ketiga
```

---

### 2. Bullet List (Unordered)

**Di Excel (dengan -, \*, atau •):**

```
Features:
- Bahan berkualitas tinggi
- Tahan lama
- Mudah dibersihkan
```

**Hasil di Database:**

```html
Features:<br />
<ul>
  <li>Bahan berkualitas tinggi</li>
  <li>Tahan lama</li>
  <li>Mudah dibersihkan</li>
</ul>
```

**Tampilan di Web:**

```
Features:
• Bahan berkualitas tinggi
• Tahan lama
• Mudah dibersihkan
```

---

### 3. Numbered List (Ordered)

**Di Excel:**

```
Cara Penggunaan:
1. Pasang pada leher anjing
2. Sesuaikan ukuran
3. Pastikan tidak terlalu ketat
```

**Hasil di Database:**

```html
Cara Penggunaan:<br />
<ol>
  <li>Pasang pada leher anjing</li>
  <li>Sesuaikan ukuran</li>
  <li>Pastikan tidak terlalu ketat</li>
</ol>
```

**Tampilan di Web:**

```
Cara Penggunaan:
1. Pasang pada leher anjing
2. Sesuaikan ukuran
3. Pastikan tidak terlalu ketat
```

---

### 4. Mixed Format

**Di Excel:**

```
Premium Dog Collar

Material:
- Nylon berkualitas tinggi
- Hardware stainless steel

Cara Perawatan:
1. Cuci dengan air sabun
2. Keringkan dengan handuk
3. Simpan di tempat kering

Cocok untuk anjing ras kecil hingga sedang.
```

**Hasil di Database:**

```html
Premium Dog Collar<br /><br />Material:<br />
<ul>
  <li>Nylon berkualitas tinggi</li>
  <li>Hardware stainless steel</li>
</ul>
<br />Cara Perawatan:<br />
<ol>
  <li>Cuci dengan air sabun</li>
  <li>Keringkan dengan handuk</li>
  <li>Simpan di tempat kering</li>
</ol>
<br />Cocok untuk anjing ras kecil hingga sedang.
```

---

## 🎯 Tips Menulis di Excel

### ✅ DO:

1. **Gunakan Alt+Enter** di Excel untuk line break yang sebenarnya
2. **Gunakan tanda yang konsisten** untuk list (-, \*, atau • untuk bullet, 1. 2. 3. untuk numbered)
3. **Beri spasi** setelah tanda list (contoh: "- Item" bukan "-Item")
4. **Kelompokkan list items** secara berurutan tanpa baris kosong di antara

### ❌ DON'T:

1. Jangan pakai multiple spaces untuk indentasi
2. Jangan mix bullet types dalam satu list
3. Jangan gunakan line break yang tidak perlu

---

## 🔍 Contoh Nyata

### Contoh 1: Simple Description

**Excel Input:**

```
Harness premium untuk anjing dengan desain ergonomis.
Dilengkapi padding untuk kenyamanan maksimal.
Tersedia dalam berbagai ukuran.
```

**Output HTML:**

```html
Harness premium untuk anjing dengan desain ergonomis.<br />Dilengkapi padding
untuk kenyamanan maksimal.<br />Tersedia dalam berbagai ukuran.
```

---

### Contoh 2: Description dengan List

**Excel Input:**

```
Dog Food Premium - Chicken & Rice

Keunggulan:
- Real chicken sebagai protein utama
- Tanpa pengawet buatan
- Diperkaya vitamin dan mineral
- Mudah dicerna

Komposisi:
1. Chicken 40%
2. Rice 30%
3. Vegetables 20%
4. Vitamins & Minerals 10%

Cocok untuk anjing dewasa semua ras.
```

**Output HTML:**

```html
Dog Food Premium - Chicken & Rice<br /><br />Keunggulan:<br />
<ul>
  <li>Real chicken sebagai protein utama</li>
  <li>Tanpa pengawet buatan</li>
  <li>Diperkaya vitamin dan mineral</li>
  <li>Mudah dicerna</li>
</ul>
<br />Komposisi:<br />
<ol>
  <li>Chicken 40%</li>
  <li>Rice 30%</li>
  <li>Vegetables 20%</li>
  <li>Vitamins & Minerals 10%</li>
</ol>
<br />Cocok untuk anjing dewasa semua ras.
```

---

## 🚀 Cara Kerja di Seeder

1. Seeder membaca `Product Description` dari Excel
2. Deteksi line breaks (Enter key di Excel)
3. Deteksi list items:
   - Lines yang mulai dengan `- `, `* `, atau `• ` → Bullet list
   - Lines yang mulai dengan `1. `, `2. `, dll → Numbered list
4. Convert ke HTML tags yang sesuai:
   - Line breaks → `<br>`
   - Bullet items → `<ul><li>...</li></ul>`
   - Numbered items → `<ol><li>...</li></ol>`
5. Clean up multiple consecutive `<br>` tags
6. Simpan ke database

---

## 📊 Log Output

Saat seeder berjalan, akan ada log yang menunjukkan formatting:

```
✓ Description formatted (150 chars → 245 chars with HTML)
```

Ini menunjukkan:

- Original text: 150 karakter
- Setelah formatting dengan HTML tags: 245 karakter

---

## 💡 Tips untuk Frontend

Di component React/Next.js, render HTML description dengan `dangerouslySetInnerHTML`:

```tsx
<div
  className="product-description"
  dangerouslySetInnerHTML={{ __html: product.productDescription }}
/>
```

Atau gunakan library seperti `html-react-parser`:

```tsx
import parse from "html-react-parser";

<div className="product-description">{parse(product.productDescription)}</div>;
```

Jangan lupa tambahkan CSS untuk styling list:

```css
.product-description ul {
  list-style-type: disc;
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.product-description ol {
  list-style-type: decimal;
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.product-description li {
  margin-bottom: 0.25rem;
}
```

---

## ✅ Benefits

1. **User-Friendly**: Admin cukup format di Excel seperti biasa
2. **Clean HTML**: Output HTML yang valid dan clean
3. **Maintainable**: Easy to update description di Excel
4. **Professional**: Description tampil rapi di website
5. **SEO-Friendly**: Proper HTML structure untuk search engines
