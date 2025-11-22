# 🎨 Banner Design Guide for Designers

## 🎯 Panduan ini untuk siapa?

Guide ini ditujukan untuk **Graphic Designer, Content Creator, atau Admin** yang akan membuat desain banner untuk website Pawship. Ikuti panduan ini untuk memastikan banner Anda tampil sempurna di semua device.

---

## 📐 Canvas Size & Specifications

### **Desktop Banner (Home Page)**

```
Canvas Size: 1920 × 1080 pixels
Aspect Ratio: 16:9 (Landscape)
Color Mode: RGB
Resolution: 72 DPI (web)
Format: JPG, PNG, atau WebP
Max File Size: 2MB (compress sebelum upload)
```

**Viewport Behavior:**

- Banner akan mengisi full screen height: `calc(100vh - 100px)`
- Image menggunakan `background-cover` → akan di-crop dari center
- Tepi gambar mungkin terpotong di beberapa layar

### **Mobile Banner (Home Page)**

```
Canvas Size: 720 × 1280 pixels
Aspect Ratio: 9:16 (Portrait)
Color Mode: RGB
Resolution: 72 DPI (web)
Format: JPG, PNG, atau WebP
Max File Size: 1MB (compress sebelum upload)
```

**Viewport Behavior:**

- Banner akan mengisi full screen height di mobile
- Image menggunakan `background-cover` → akan di-crop dari center
- Atas/bawah gambar mungkin terpotong di beberapa device

---

## 🛡️ Safe Zone (Area Aman untuk Konten)

Safe zone adalah area dimana konten penting (text, logo, produk) **DIJAMIN tidak akan terpotong** di semua device.

### **Desktop Safe Zone**

```
┌─────────────────────────────────────────────────────┐
│                    1920 × 1080px                    │
│  ┌────────────────────────────────────────────┐     │
│  │ [MARGIN: 64px dari semua sisi]             │ 64px│
│64│  ┌──────────────────────────────────────┐  │     │
│px│  │                                      │  │     │
│  │  │    SAFE ZONE: 1792 × 952px           │  │     │
│  │  │                                      │  │     │
│  │  │    Letakkan text & konten penting    │  │     │
│  │  │    di area ini!                      │  │     │
│  │  │                                      │  │     │
│  │  └──────────────────────────────────────┘  │     │
│  │                                        64px │     │
│  └────────────────────────────────────────────┘     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Desktop Safe Zone:**

- **Inner Area**: 1792px × 952px
- **Margin**: 64px dari top, bottom, left, right
- **Padding CSS**: `lg:p-16` (4rem = 64px)

### **Mobile Safe Zone**

```
┌─────────────────────┐
│   720 × 1280px      │
│  ┌───────────────┐  │ 32px
│  │ [MARGIN: 32px]│  │
│32│  ┌─────────┐  │  │
│px│  │         │  │  │
│  │  │ SAFE    │  │  │
│  │  │ ZONE:   │  │  │
│  │  │         │  │  │
│  │  │ 656 ×   │  │  │
│  │  │ 1216px  │  │  │
│  │  │         │  │  │
│  │  │ Letakkan│  │  │
│  │  │ konten  │  │  │
│  │  │ penting │  │  │
│  │  │ di sini │  │  │
│  │  │         │  │  │
│  │  └─────────┘  │  │
│  │          32px │  │
│  └───────────────┘  │
│                     │
└─────────────────────┘
```

**Mobile Safe Zone:**

- **Inner Area**: 656px × 1216px
- **Margin**: 32px dari top, bottom, left, right
- **Padding CSS**: `p-8` (2rem = 32px)

---

## 🎨 Design Layout Guidelines

### **Komposisi Desktop (Landscape 16:9)**

#### **Layout Option 1: Left-Aligned Content**

```
┌─────────────────────────────────────────┐
│ [64px margin]                           │
│  ┌─────────────┐                        │
│  │             │                        │
│  │  HEADING    │    [PRODUCT IMAGE]    │
│  │  SUBTEXT    │                        │
│  │             │                        │
│  │  [BUTTON]   │                        │
│  │             │                        │
│  └─────────────┘                        │
│                                         │
└─────────────────────────────────────────┘
```

**Cocok untuk:**

- Hero banner dengan produk di kanan
- Text-heavy content dengan visual support

#### **Layout Option 2: Center-Aligned Content**

```
┌─────────────────────────────────────────┐
│                                         │
│         ┌─────────────────┐             │
│         │                 │             │
│         │    HEADING      │             │
│         │    SUBTEXT      │             │
│         │                 │             │
│         │    [BUTTON]     │             │
│         │                 │             │
│         └─────────────────┘             │
│                                         │
└─────────────────────────────────────────┘
```

**Cocok untuk:**

- Announcement banner
- Promo banner dengan focus message
- Minimal distraction

#### **Layout Option 3: Split Content**

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────┐      ┌──────────┐         │
│  │         │      │          │         │
│  │ TEXT &  │      │ PRODUCT  │         │
│  │ BUTTON  │      │ IMAGE    │         │
│  │         │      │          │         │
│  └─────────┘      └──────────┘         │
│                                         │
└─────────────────────────────────────────┘
```

**Cocok untuk:**

- Product showcase
- Before/After comparison
- Dual message banner

### **Komposisi Mobile (Portrait 9:16)**

#### **Layout Option 1: Top Content**

```
┌─────────────┐
│ [32px]      │
│  ┌───────┐  │
│  │HEADING│  │
│  │SUBTEXT│  │
│  │       │  │
│  │[BUTTON│  │
│  │       │  │
│  └───────┘  │
│             │
│   [IMAGE    │
│   AREA]     │
│             │
│             │
└─────────────┘
```

#### **Layout Option 2: Center Focus**

```
┌─────────────┐
│             │
│   [IMAGE    │
│   AREA]     │
│             │
│  ┌───────┐  │
│  │HEADING│  │
│  │SUBTEXT│  │
│  │       │  │
│  │[BUTTON│  │
│  └───────┘  │
│             │
└─────────────┘
```

#### **Layout Option 3: Bottom CTA**

```
┌─────────────┐
│             │
│             │
│   [FULL     │
│   IMAGE     │
│   AREA]     │
│             │
│             │
│  ┌───────┐  │
│  │HEADING│  │
│  │[BUTTON│  │
│  └───────┘  │
└─────────────┘
```

---

## 📝 Typography Guidelines

### **Desktop Typography**

#### **Main Heading**

- **Font Size**: 48-72px
- **Font Weight**: Bold (700)
- **Line Height**: 1.2 (tight)
- **Max Width**: 60% of canvas width (~1152px)
- **Character Limit**: 50-60 characters
- **Recommended Fonts**: Poppins, Montserrat, Inter (Bold)

#### **Subheading/Description**

- **Font Size**: 18-24px
- **Font Weight**: Regular (400) or Medium (500)
- **Line Height**: 1.5
- **Max Width**: 50% of canvas width (~960px)
- **Character Limit**: 100-120 characters
- **Recommended Fonts**: Inter, Open Sans, Lato

#### **Small Text/Caption**

- **Font Size**: 14-16px
- **Font Weight**: Regular (400)
- **Line Height**: 1.4
- **Use for**: Disclaimers, small notes

### **Mobile Typography**

#### **Main Heading**

- **Font Size**: 28-36px
- **Font Weight**: Bold (700)
- **Line Height**: 1.2
- **Max Width**: 80% of canvas width (~576px)
- **Character Limit**: 30-40 characters

#### **Subheading/Description**

- **Font Size**: 14-16px
- **Font Weight**: Regular (400)
- **Line Height**: 1.4
- **Max Width**: 85% of canvas width (~612px)
- **Character Limit**: 60-80 characters

#### **Small Text/Caption**

- **Font Size**: 12-14px
- **Font Weight**: Regular (400)
- **Line Height**: 1.3

---

## 🎨 Color & Contrast Guidelines

### **Text Readability**

✅ **GOOD Contrast Ratios:**

- White (#FFFFFF) on Dark (#000000 - #333333) → Contrast ratio 21:1
- Dark (#000000) on Light (#FFFFFF - #F5F5F5) → Contrast ratio 21:1
- White on Brand Orange (#FF6B35) → Contrast ratio 3.5:1 ⚠️ (use with caution)

❌ **BAD Contrast Ratios:**

- Light gray (#CCCCCC) on White (#FFFFFF) → Contrast ratio 1.6:1
- Dark gray (#555555) on Black (#000000) → Contrast ratio 2.5:1
- Yellow (#FFFF00) on White (#FFFFFF) → Contrast ratio 1.1:1

**Minimum Standard:**

- **Normal text**: Contrast ratio minimum **4.5:1**
- **Large text** (≥24px): Contrast ratio minimum **3:1**
- **Test tool**: WebAIM Contrast Checker (https://webaim.org/resources/contrastchecker/)

### **Text Shadow for Readability**

Jika background image memiliki kontras rendah, tambahkan text shadow:

```css
/* Soft shadow */
text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

/* Strong shadow untuk visibility lebih baik */
text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);

/* Outline effect */
text-shadow:
  -1px -1px 0 #000,
  1px -1px 0 #000,
  -1px 1px 0 #000,
  1px 1px 0 #000;
```

### **Background Overlay**

Jika text sulit dibaca di atas foto, tambahkan overlay:

```
Dark overlay:
- Color: #000000
- Opacity: 30-60%
- Positioned: Behind text only atau full image

Gradient overlay:
- From: rgba(0,0,0,0.8) (dark)
- To: rgba(0,0,0,0) (transparent)
- Direction: Top to bottom atau bottom to top
```

---

## 🔘 Button Design Guidelines

### **Button Specs**

Admin akan menambahkan button via CMS, tapi Anda perlu **reserve space** untuk button di desain.

#### **Desktop Button Area**

- **Size**: ~200px × 56px (width × height)
- **Padding around**: Minimum 24px spacing dari text di atasnya
- **Position**: Can be placed in 9 positions (3×3 grid: top/center/bottom × left/center/right)

#### **Mobile Button Area**

- **Size**: ~160px × 48px (width × height)
- **Padding around**: Minimum 16px spacing dari text di atasnya
- **Position**: Can be placed in 9 positions

### **Button Position Matrix**

```
Desktop Grid:
┌─────────────────────────────────┐
│ Top-Left   Top-Center  Top-Right│
│                                 │
│ Mid-Left   Mid-Center  Mid-Right│
│                                 │
│ Bot-Left   Bot-Center  Bot-Right│
└─────────────────────────────────┘
```

**⚠️ PENTING:**

- **JANGAN** desain button di gambar!
- **RESERVE SPACE** untuk button (buat area kosong atau dengan kontras baik)
- Admin akan menambahkan button via CMS dengan posisi yang dipilih
- Button background color bisa custom (default: #FF6B35)
- Button text selalu putih (#FFFFFF)

### **Best Practice untuk Button Area**

✅ **DO:**

- Buat area kosong/clean untuk button placement
- Pastikan background di area button punya kontras baik dengan putih
- Hindari pattern/detail kompleks di area button
- Test dengan overlay button mockup

❌ **DON'T:**

- Letakkan button di atas text/gambar penting
- Gunakan background dengan warna terlalu terang di area button
- Buat area button terlalu sempit/cramped

---

## 🖼️ Image Guidelines

### **Background Image**

✅ **DO:**

- Gunakan high-resolution image (minimum 1920×1080 desktop, 720×1280 mobile)
- Compress dengan tools: TinyPNG, Squoosh, ImageOptim
- Target file size: <2MB desktop, <1MB mobile
- Test pada berbagai brightness/contrast monitor

❌ **DON'T:**

- Gunakan image dengan resolution rendah (akan blur/pixelated)
- Upload raw file dari kamera (terlalu besar)
- Gunakan image dengan watermark
- Gunakan stock photo dengan model yang terlalu obvious

### **Image Composition**

**Desktop (16:9 Landscape):**

- Main subject: Center atau rule of thirds
- Consider negative space untuk text & button
- Horizontal orientation

**Mobile (9:16 Portrait):**

- Main subject: Center vertical
- Top-heavy atau bottom-heavy composition
- Vertical orientation
- **JANGAN** crop desktop image - buat versi khusus mobile!

---

## 📊 Export Settings

### **Photoshop Export**

```
1. File → Export → Export As...
2. Format:
   - WebP (recommended, smallest size)
   - JPEG (fallback, quality 80-90%)
   - PNG (jika perlu transparency)
3. Image Size:
   - Desktop: 1920 × 1080 px
   - Mobile: 720 × 1280 px
4. Resample: Bicubic Sharper (best for reduction)
5. Metadata: None (reduce file size)
```

### **Figma Export**

```
1. Select frame/artboard
2. Export settings:
   - Format: JPG atau PNG
   - Scale: 1x (actual size)
   - Quality: 80-90%
3. Use plugin:
   - "TinyImage Compressor" untuk compress otomatis
   - "Optimize Image" untuk WebP conversion
```

### **Online Compression Tools**

After export, compress dengan:

- **TinyPNG** (https://tinypng.com) - PNG & JPEG
- **Squoosh** (https://squoosh.app) - All formats including WebP
- **ImageOptim** (Mac) - Batch compression

**Target:**

- Desktop: 500-800KB (from 2MB max)
- Mobile: 300-500KB (from 1MB max)

---

## ✅ Pre-Upload Checklist

Sebelum submit banner ke admin untuk upload, pastikan:

- [ ] **Size correct**: Desktop 1920×1080px, Mobile 720×1280px
- [ ] **Safe zone**: Semua konten penting dalam safe zone (64px desktop, 32px mobile)
- [ ] **Text readable**: Contrast ratio minimum 4.5:1
- [ ] **Button space**: Area untuk button reserved dengan background kontras baik
- [ ] **File size**: Desktop <2MB, Mobile <1MB
- [ ] **Format**: JPG, PNG, atau WebP
- [ ] **Resolution**: 72 DPI
- [ ] **Color mode**: RGB (bukan CMYK)
- [ ] **Both versions**: Ada versi desktop DAN mobile
- [ ] **Compressed**: Sudah di-compress dengan tools
- [ ] **Tested**: Preview di berbagai ukuran layar (use browser dev tools)

---

## 🎯 Quick Reference Card

```
╔════════════════════════════════════════════════════╗
║           BANNER DESIGN QUICK REFERENCE            ║
╠════════════════════════════════════════════════════╣
║ DESKTOP (Home Page)                                ║
║ • Canvas: 1920 × 1080px (16:9)                    ║
║ • Safe Zone: 64px margin all sides                 ║
║ • Heading: 48-72px Bold                            ║
║ • Body: 18-24px Regular                            ║
║ • Max File: 2MB                                    ║
║                                                    ║
║ MOBILE (Home Page)                                 ║
║ • Canvas: 720 × 1280px (9:16)                     ║
║ • Safe Zone: 32px margin all sides                 ║
║ • Heading: 28-36px Bold                            ║
║ • Body: 14-16px Regular                            ║
║ • Max File: 1MB                                    ║
║                                                    ║
║ BUTTON AREA                                        ║
║ • Desktop: ~200×56px space                         ║
║ • Mobile: ~160×48px space                          ║
║ • Reserve clean area, don't design button!         ║
║                                                    ║
║ CONTRAST                                           ║
║ • Minimum ratio: 4.5:1 for normal text            ║
║ • Minimum ratio: 3:1 for large text               ║
║ • Use shadow if needed for readability             ║
╚════════════════════════════════════════════════════╝
```

---

## 💡 Tips & Tricks

### **Composition Tips**

1. **Rule of Thirds**: Letakkan elemen penting di intersection grid 3×3
2. **Visual Hierarchy**: Heading > Subtext > Button (size & weight)
3. **White Space**: Jangan cramped, beri breathing room
4. **Direction**: Guide mata user dari heading → subtext → button
5. **Balance**: Distribute visual weight merata

### **Common Mistakes to Avoid**

❌ **Mistake 1**: Text terlalu dekat dengan tepi
✅ **Fix**: Gunakan safe zone 64px desktop, 32px mobile

❌ **Mistake 2**: Too much text
✅ **Fix**: Keep it short & impactful (50-60 char heading max)

❌ **Mistake 3**: Low contrast text
✅ **Fix**: Add shadow, overlay, atau pilih warna kontras tinggi

❌ **Mistake 4**: Button designed in image
✅ **Fix**: Reserve space, biarkan admin tambahkan via CMS

❌ **Mistake 5**: Desktop image di-crop untuk mobile
✅ **Fix**: Buat 2 versi terpisah dengan composition optimal

### **Testing Your Design**

1. **Desktop Test**:
   - Open in browser full screen (1920×1080)
   - Check di laptop 1366×768 (will crop slightly)
   - Check di 4K monitor (will scale up)

2. **Mobile Test**:
   - Use browser DevTools responsive mode
   - Test di iPhone (375×667 to 428×926)
   - Test di Android (360×640 to 412×915)

3. **Contrast Test**:
   - Use WebAIM Contrast Checker
   - View design in grayscale (check readability)
   - Test pada brightness berbeda

---

## 📞 Need Help?

Jika ada pertanyaan atau butuh bantuan:

1. Review `BANNER_GUIDE.md` untuk technical specifications
2. Check existing banners sebagai reference
3. Hubungi tech team untuk preview/testing

**Happy Designing! 🎨**
