# Contoh Integrasi Banner ke Halaman Public

## 1. Home Page - Replace Hero Section dengan Banner Carousel

File: `/src/app/(public)/page.tsx`

**Before:**

```tsx
import HeroSection from "@/components/landing-page/hero-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProduct />
      {/* ... */}
    </>
  );
}
```

**After:**

```tsx
import HomeBannerCarousel from "@/components/landing-page/home-banner-carousel";

export default function Home() {
  return (
    <>
      <HomeBannerCarousel page="home" />
      <FeaturedProduct />
      {/* ... */}
    </>
  );
}
```

---

## 2. Our Collection Page - Add Banner

File: `/src/app/(public)/catalog/page.tsx` or similar

**Add at the top:**

```tsx
import SingleBanner from "@/components/common/single-banner";

export default function OurCollectionPage() {
  return (
    <div>
      <SingleBanner page="our-collection" />

      {/* Existing collection content */}
      <div className="container mx-auto py-8">
        {/* Products, filters, etc */}
      </div>
    </div>
  );
}
```

---

## 3. Reseller Program Page - Add Banner

File: `/src/app/(public)/reseller/page.tsx`

```tsx
import SingleBanner from "@/components/common/single-banner";

export default function ResellerProgramPage() {
  return (
    <div>
      <SingleBanner page="reseller-program" />

      {/* Reseller program content */}
      <div className="container mx-auto py-12">
        {/* Program details, benefits, etc */}
      </div>
    </div>
  );
}
```

---

## 4. Reseller Whitelabeling Page - Add Banner

File: `/src/app/(public)/reseller/white-labeling/page.tsx`

```tsx
import SingleBanner from "@/components/common/single-banner";

export default function WhitelabelingPage() {
  return (
    <div>
      <SingleBanner page="reseller-whitelabeling" />

      <div className="container mx-auto py-12">
        {/* Whitelabeling details */}
      </div>
    </div>
  );
}
```

---

## 5. About Us Page - Add Banner

File: `/src/app/(public)/about-us/page.tsx`

```tsx
import SingleBanner from "@/components/common/single-banner";

export default function AboutUsPage() {
  return (
    <div>
      <SingleBanner page="about-us" />

      <div className="container mx-auto py-12">{/* About us content */}</div>
    </div>
  );
}
```

---

## 6. Contact Us Page - Add Banner

File: `/src/app/(public)/contact-us/page.tsx`

```tsx
import SingleBanner from "@/components/common/single-banner";

export default function ContactUsPage() {
  return (
    <div>
      <SingleBanner page="contact-us" />

      <div className="container mx-auto py-12">
        {/* Contact form, info, etc */}
      </div>
    </div>
  );
}
```

---

## 7. Stores Page - Add Banner

File: `/src/app/(public)/stores/page.tsx`

```tsx
import SingleBanner from "@/components/common/single-banner";

export default function StoresPage() {
  return (
    <div>
      <SingleBanner page="stores" />

      <div className="container mx-auto py-12">
        {/* Store locations, info, etc */}
      </div>
    </div>
  );
}
```

---

## 8. Payment Page - Add Banner

File: `/src/app/(public)/payments/page.tsx`

```tsx
import SingleBanner from "@/components/common/single-banner";

export default function PaymentPage() {
  return (
    <div>
      <SingleBanner page="payment" />

      <div className="container mx-auto py-12">
        {/* Payment methods, info, etc */}
      </div>
    </div>
  );
}
```

---

## 📋 Quick Reference

### Page Values & Routes

| Page Value               | Route                       | Banner Type         |
| ------------------------ | --------------------------- | ------------------- |
| `home`                   | `/`                         | Carousel (Multiple) |
| `our-collection`         | `/catalog` or `/collection` | Single              |
| `reseller-program`       | `/reseller`                 | Single              |
| `reseller-whitelabeling` | `/reseller/white-labeling`  | Single              |
| `about-us`               | `/about-us`                 | Single              |
| `contact-us`             | `/contact-us`               | Single              |
| `stores`                 | `/stores`                   | Single              |
| `payment`                | `/payments`                 | Single              |

### Banner Size by Type

| Banner Type     | Desktop Size | Mobile Size | Display Height |
| --------------- | ------------ | ----------- | -------------- |
| Home (Carousel) | 1920x600px   | 768x400px   | 600px / 400px  |
| Other Pages     | 1920x400px   | 768x300px   | 400px / 300px  |

📖 **Full size guide**: `BANNER_SIZE_GUIDE.md`

---

## Tips Integrasi

### 1. **Gradual Migration**

Tidak perlu replace semua sekaligus. Mulai dari Home page dulu, test, baru lanjut ke halaman lain.

### 2. **Keep Old Components (For Now)**

Jangan delete HeroSection atau banner lama dulu. Biarkan sampai yakin Banner Management berjalan dengan baik.

### 3. **Test Responsive**

Setiap kali add banner component, test di:

- Mobile (< 768px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

### 4. **Page Value Mapping**

- `home` → Home page (carousel with multiple banners)
- `our-collection` → Our Collection page
- `reseller-program` → Reseller Program page
- `reseller-whitelabeling` → Reseller Whitelabeling page
- `about-us` → About Us page
- `contact-us` → Contact Us page
- `stores` → Stores page
- `payment` → Payment page

### 5. **Fallback Handling**

Kedua component (HomeBannerCarousel & SingleBanner) sudah handle:

- Loading state dengan skeleton
- No banner state (return null, tidak tampil apapun)
- Error state dengan console.error

### 6. **Banner Priority**

Jika ada multiple banners di satu page:

- Home: Tampilkan semua dalam carousel
- Other pages: Hanya tampilkan banner pertama yang active

---

## Testing Checklist

Setelah integrasi, test:

- [ ] Banner muncul di page yang benar
- [ ] Responsive image work (mobile/desktop)
- [ ] Button link work correctly
- [ ] Text readable dengan background image
- [ ] Carousel auto-slide work (Home page)
- [ ] Navigation arrows work (Home page)
- [ ] Loading state tampil saat fetch
- [ ] No error di console
- [ ] Page tetap fast (good performance)
- [ ] Banner tidak shift layout (CLS)

---

## Performance Tips

### 1. **Lazy Load Images**

Kedua component sudah handle responsive images (mobile/desktop), tapi untuk further optimization:

```tsx
// Di component banner, tambahkan loading="lazy"
<img src={imageUrl} alt={banner.title} loading="lazy" />
```

### 2. **Preload Critical Banner**

Untuk Home page banner (above the fold), bisa preload:

```tsx
// Di layout.tsx atau page.tsx
export function generateMetadata() {
  return {
    // ... other metadata
    link: [
      {
        rel: "preload",
        as: "image",
        href: "/path-to-first-banner.jpg",
      },
    ],
  };
}
```

### 3. **Cache Public API**

Update public banner API untuk add caching:

```tsx
// In /api/public/banners/route.ts
export const revalidate = 60; // Cache for 60 seconds
```

---

## Migration Path

### Phase 1: Setup & Test (Week 1)

1. ✅ Create Banner model & API (DONE)
2. ✅ Create admin pages (DONE)
3. ✅ Create frontend components (DONE)
4. Create 2-3 test banners di admin panel
5. Test di local

### Phase 2: Home Page (Week 2)

1. Replace HeroSection dengan HomeBannerCarousel
2. Create 3-5 home banners
3. Test carousel functionality
4. Deploy to staging
5. Get feedback

### Phase 3: Other Pages (Week 3)

1. Add SingleBanner to Catalog page
2. Add SingleBanner to Collection pages (or use Collection model)
3. Create banners for each page
4. Test all pages
5. Deploy to staging

### Phase 4: Polish & Optimize (Week 4)

1. Fix any bugs found
2. Optimize images
3. Add analytics tracking (optional)
4. Deploy to production
5. Monitor performance

---

Ready to integrate! 🚀
