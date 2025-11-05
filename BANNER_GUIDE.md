# 📸 Banner Management Guide

## 🎯 Overview

Banner system yang digunakan untuk menampilkan gambar promosi di berbagai halaman website. Banner ini mendukung gambar terpisah untuk desktop dan mobile, serta dapat menambahkan button CTA (Call-to-Action).

---

## 📐 Image Specifications

### **Home Page Banner**

⚠️ **PENTING**: Home page menggunakan full viewport height `calc(100vh - 100px)` dengan `bg-cover`, gambar akan di-crop dari center untuk mengisi layar.

| Device      | Recommended Size  | Aspect Ratio | Notes                                    |
| ----------- | ----------------- | ------------ | ---------------------------------------- |
| **Desktop** | **1920 x 1080px** | **16:9**     | Full HD - Aman untuk semua layar desktop |
| **Tablet**  | 1024 x 768px      | 4:3          | iPad dan tablet landscape                |
| **Mobile**  | **720 x 1280px**  | **9:16**     | Portrait - Aman untuk semua smartphone   |

**Max File Size**: 2MB (Desktop), 1MB (Mobile)

**⚠️ Kenapa ukuran ini?**

- Desktop viewport height bervariasi: 600px-1080px
- Mobile portrait height: 700-900px
- Dengan `bg-cover`, gambar akan di-crop dari center
- Ukuran yang disarankan memastikan konten penting tidak terpotong

### **Other Pages Banner**

Other pages menggunakan fixed height `h-[60vh]` (60% viewport height).

| Device      | Recommended Size | Aspect Ratio | Notes                          |
| ----------- | ---------------- | ------------ | ------------------------------ |
| **Desktop** | **1920 x 650px** | **~3:1**     | 60vh ≈ 648px pada 1080p screen |
| **Tablet**  | 1024 x 460px     | ~2.2:1       | 60vh ≈ 460px pada tablet       |
| **Mobile**  | **768 x 400px**  | **1.92:1**   | 60vh ≈ 400-450px pada mobile   |

**Max File Size**: 2MB (Desktop), 1MB (Mobile)

---

## 📝 Banner Fields

### **Required Fields**

1. **Desktop Image** ✅ **Required**
   - Primary image yang akan ditampilkan
   - Jika mobile image tidak ada, desktop image akan digunakan untuk mobile
   - Format: JPG, PNG, WebP
   - Ukuran file maksimal: 2MB

2. **Page** ✅ **Required** (Default: Home)
   - Halaman dimana banner akan ditampilkan
   - Options: Home, Our Collection, Reseller Program, Reseller Whitelabeling, About Us, Contact Us, Stores, Payment

3. **Order** (Default: 0)
   - Urutan tampilan banner (angka kecil = tampil lebih dulu)
   - Gunakan angka 0, 10, 20, dst untuk memudahkan reorder

4. **Active Status** (Default: ✅ Active)
   - Toggle untuk menampilkan/menyembunyikan banner

### **Optional Fields**

5. **Mobile Image** (Optional)
   - Image khusus untuk tampilan mobile
   - Jika tidak diisi, akan menggunakan desktop image
   - Format: JPG, PNG, WebP
   - Ukuran file maksimal: 1MB

6. **Button CTA** (Optional)
   - Tombol call-to-action yang dapat diklik
   - Jika button ditambahkan, **Desktop Position wajib diisi**
   - Mobile position optional (jika tidak diisi akan fallback ke desktop position)

---

## 🎨 Design Guidelines

### **Safe Zone for Text in Image**

Karena button dapat ditambahkan di berbagai posisi, pastikan text/konten penting di dalam gambar berada di safe zone:

#### **Desktop Safe Zones**

```
┌─────────────────────────────────────┐
│ [40px padding all sides]            │
│  ┌──────────────────────────────┐   │
│  │                              │   │
│  │     SAFE ZONE FOR TEXT       │   │
│  │                              │   │
│  │     (Avoid button areas)     │   │
│  │                              │   │
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

#### **Mobile Safe Zones**

```
┌──────────────────┐
│ [24px padding]   │
│  ┌────────────┐  │
│  │            │  │
│  │ SAFE ZONE  │  │
│  │            │  │
│  │  FOR TEXT  │  │
│  │            │  │
│  └────────────┘  │
│                  │
└──────────────────┘
```

### **Text Styling in Image**

Jika Anda menambahkan text langsung di image (menggunakan Photoshop/Figma), gunakan panduan berikut:

#### **Heading Text (Desktop ≥1024px)**

- Font Size: 48px - 72px
- Font Weight: Bold (700)
- Line Height: 1.2
- Max Width: 60% of image width
- Safe Zone: Jaga jarak minimal 64px dari tepi
- Recommended Position: Left or Center, Top or Center vertically

#### **Heading Text (Tablet 768px - 1023px)**

- Font Size: 36px - 48px
- Font Weight: Bold (700)
- Line Height: 1.2
- Max Width: 70% of image width
- Safe Zone: Jaga jarak minimal 48px dari tepi
- Recommended Position: Center or Left, Top

#### **Heading Text (Mobile <768px)**

- Font Size: 28px - 36px
- Font Weight: Bold (700)
- Line Height: 1.2
- Max Width: 80% of image width
- Safe Zone: Jaga jarak minimal 32px dari tepi
- Recommended Position: Center, Top or Center vertically

#### **Body Text (Desktop ≥1024px)**

- Font Size: 18px - 24px
- Font Weight: Regular (400) or Medium (500)
- Line Height: 1.5
- Max Width: 50% of image width
- Safe Zone: Jaga jarak minimal 64px dari tepi

#### **Body Text (Tablet 768px - 1023px)**

- Font Size: 16px - 20px
- Font Weight: Regular (400) or Medium (500)
- Line Height: 1.4
- Max Width: 65% of image width
- Safe Zone: Jaga jarak minimal 48px dari tepi

#### **Body Text (Mobile <768px)**

- Font Size: 14px - 16px
- Font Weight: Regular (400)
- Line Height: 1.4
- Max Width: 85% of image width
- Safe Zone: Jaga jarak minimal 32px dari tepi

### **Color Contrast**

✅ **Good Contrast Examples:**

- White text on dark background (#FFFFFF on #000000 or dark image)
- Dark text on light background (#000000 on #FFFFFF or light image)
- Text with shadow or outline for better readability

❌ **Poor Contrast Examples:**

- Light gray on white
- Dark gray on black
- Mid-tone colors without sufficient contrast

**Recommended:** Use online contrast checker (WebAIM Contrast Checker) untuk memastikan kontras minimal 4.5:1

---

## 🔘 Button Configuration

### **Button Fields**

1. **Text** ✅ **Required**
   - Label yang ditampilkan di button
   - Max length: 30 characters
   - Contoh: "Shop Now", "Learn More", "Get Started"

2. **URL** ✅ **Required**
   - Link tujuan saat button diklik
   - Format: `/relative-path` atau `https://external-link.com`
   - Contoh: `/catalog`, `/about-us`

3. **Color** (Default: #FF6B35 - Orange)
   - Warna background button
   - Gunakan hex color code
   - Pastikan kontras dengan text di dalam button (text button selalu putih)

4. **Desktop Position** ✅ **Required if button exists**
   - **Horizontal:** left, center, right
   - **Vertical:** top, center, bottom
   - Tentukan posisi berdasarkan komposisi gambar

5. **Mobile Position** (Optional)
   - Same options sebagai desktop
   - Jika tidak diisi, akan menggunakan desktop position

### **Button Position Examples**

#### **Position Matrix**

| Position      | Horizontal | Vertical | Use Case                          |
| ------------- | ---------- | -------- | --------------------------------- |
| Top Left      | left       | top      | Untuk hero dengan gambar di kanan |
| Top Center    | center     | top      | CTA di header banner              |
| Top Right     | right      | top      | Secondary action                  |
| Center Left   | left       | center   | Hero dengan text di kiri          |
| Center        | center     | center   | Focus utama, minimal distraction  |
| Center Right  | right      | center   | Hero dengan text di kanan         |
| Bottom Left   | left       | bottom   | Standard CTA position             |
| Bottom Center | center     | bottom   | Popular untuk home banners        |
| Bottom Right  | right      | bottom   | Secondary action                  |

---

## 📱 Responsive Behavior

### **Desktop → Tablet (768px - 1024px)**

- Desktop image akan di-scale down proporsional
- Button tetap di posisi yang sama (menggunakan flexbox alignment)
- Text di image mungkin terlihat lebih besar relatif terhadap viewport

### **Tablet → Mobile (< 768px)**

- Akan switch ke mobile image (jika ada)
- Jika mobile image tidak ada, desktop image akan di-crop/cover
- Button menggunakan mobile position (jika ada), jika tidak ada gunakan desktop position
- Padding berkurang untuk maximize content area

---

## ✅ Best Practices

### **DO's ✅**

1. ✅ **WAJIB gunakan ukuran yang direkomendasikan**:
   - Desktop: **1920 x 1080px** (16:9) untuk home page
   - Mobile: **720 x 1280px** (9:16) untuk home page portrait
2. ✅ **Letakkan konten penting di CENTER** karena `bg-cover` akan crop dari tepi
3. ✅ **Test preview di berbagai ukuran layar** sebelum publish
4. **Gunakan format WebP** untuk ukuran file lebih kecil dengan kualitas tetap tinggi
5. **Compress images** sebelum upload (gunakan TinyPNG atau Squoosh)
6. **Upload mobile image** untuk hasil optimal di mobile devices (WAJIB)
7. **Posisikan button di area aman** (gunakan safe zone dengan padding)
8. **Gunakan button text yang jelas** dan action-oriented
9. **Set order secara konsisten** (0, 10, 20) untuk memudahkan reorder
10. **Test button contrast** pastikan text button terbaca jelas

### **DON'Ts ❌**

1. ❌ **JANGAN gunakan ukuran lama (1920x600px)** - Akan terpotong banyak di layar tinggi!
2. ❌ **JANGAN letakkan konten penting di tepi** - Karena `bg-cover` akan crop dari tepi
3. ❌ **JANGAN skip mobile image** - Desktop image akan ter-crop buruk di mobile portrait
4. **Jangan gunakan image dengan resolusi rendah** (<1920px untuk desktop, <720px mobile)
5. **Jangan gunakan terlalu banyak text di image mobile**
6. **Jangan posisikan button di atas text penting di image**
7. **Jangan gunakan button text terlalu panjang** (>15 karakter)
8. **Jangan upload file terlalu besar** (>2MB desktop, >1MB mobile)
9. **Jangan gunakan warna button yang sama dengan background image**
10. **Jangan lupa set isActive = false** untuk banner yang belum siap dipublish

---

## 🎬 Workflow Example

### **Creating New Home Banner**

1. **Prepare Images**
   - Desktop: **1920 x 1080px** (16:9), optimized to ~800KB
   - Mobile: **720 x 1280px** (9:16), optimized to ~500KB
   - **Konten penting di CENTER** karena tepi akan terpotong dengan `bg-cover`
   - Text di image dengan safe zone padding (64px desktop, 32px mobile)
   - Background kontras baik untuk button placement

2. **Upload Images**
   - Upload desktop image (required)
   - Upload mobile image (recommended)

3. **Configure Button** (Optional)
   - Text: "Shop Now"
   - URL: `/catalog`
   - Color: #FF6B35
   - Desktop Position: center horizontal, bottom vertical
   - Mobile Position: center horizontal, bottom vertical

4. **Set Metadata**
   - Page: Home
   - Order: 0 (atau sesuai urutan yang diinginkan)
   - Active: ✅

5. **Publish**
   - Set Active = true
   - Save banner
