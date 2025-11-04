# Banner Management V2 - Update Summary

## 🎯 Major Changes

### 1. **New Banner Model Structure**

Button dan Style sekarang terpisah untuk Desktop dan Mobile dengan coordinate positioning:

```typescript
{
  button?: {
    desktop: {
      text: string;
      url: string;
      color: string;
      position: {
        x: number;  // 0-100% from left
        y: number;  // 0-100% from top
      };
    };
    mobile?: {
      text: string;
      url: string;
      color: string;
      position: {
        x: number;
        y: number;
      };
    };
  };
  style: {
    desktop: {
      textColor: string;
      overlayColor?: string;
      textPosition: {
        x: number;  // 0-100% from left
        y: number;  // 0-100% from top
      };
    };
    mobile?: {
      textColor: string;
      overlayColor?: string;
      textPosition: {
        x: number;
        y: number;
      };
    };
  };
}
```

### 2. **Drag & Drop Positioning**

- ✅ Click pada text atau button di preview
- ✅ Click lagi di posisi yang diinginkan
- ✅ Posisi tersimpan sebagai coordinate (x, y) dalam percentage

### 3. **Desktop/Mobile Separation**

- **Desktop settings**: WAJIB diisi
- **Mobile settings**: OPTIONAL
  - Jika tidak diisi → fallback ke desktop settings
  - Bisa copy dari desktop dengan 1 click
  - Bisa clear mobile settings kapan saja

## 📝 Files Status

### ✅ Created/Updated:

1. `/src/lib/models/Banner.ts` - Model dengan structure baru
2. `/src/components/admin/banners/form-banner-v2.tsx` - Form baru dengan drag & drop

### ⚠️ Need Update:

1. `/src/app/api/admin/banners/route.ts` - POST endpoint
2. `/src/app/api/admin/banners/[id]/route.ts` - PUT endpoint
3. `/src/components/landing-page/home-banner-carousel.tsx` - Frontend display
4. `/src/components/common/single-banner.tsx` - Frontend display
5. `/src/app/(admin)/dashboard/banners/create/page.tsx` - Use FormBannerV2
6. `/src/app/(admin)/dashboard/banners/edit/[id]/page.tsx` - Use FormBannerV2

## 🔄 Migration Steps

### Step 1: Update API Routes

POST dan PUT endpoints perlu update untuk:

- Parse `button` dan `style` dari JSON string
- Support coordinate positioning
- Handle mobile settings yang optional

### Step 2: Update Frontend Components

Carousel dan Single Banner perlu:

- Read new button/style structure
- Calculate position dari coordinate (x, y)
- Use desktop settings jika mobile null

### Step 3: Update Admin Pages

Replace `FormBanner` dengan `FormBannerV2`:

```tsx
// Before
import FormBanner from "@/components/admin/banners/form-banner";

// After
import FormBannerV2 from "@/components/admin/banners/form-banner-v2";

<FormBannerV2 mode="create" />;
```

## 🎨 New Features

### 1. Interactive Preview with Drag & Drop

- Click text/button to select
- Click position to place
- Real-time coordinate display
- Visual feedback dengan border

### 2. Tabs for Desktop/Mobile Settings

- Clear separation
- Easy switching
- Copy desktop to mobile button
- Clear mobile settings button

### 3. Better UX

- Info banners dengan tips
- Position display (X%, Y%)
- Visual drag indicators
- Responsive preview

## 📊 Position Coordinate System

```
(0, 0) ┌─────────────────┐ (100, 0)
       │                 │
       │    (50, 50)     │  Center
       │        •        │
       │                 │
(0, 100)└─────────────────┘ (100, 100)
```

**Examples:**

- Center: `{ x: 50, y: 50 }`
- Top Left: `{ x: 20, y: 20 }`
- Bottom Right: `{ x: 80, y: 80 }`
- Bottom Center: `{ x: 50, y: 70 }`

## 🚀 Next Steps

1. **Update API routes** untuk support new structure
2. **Update frontend components** untuk display
3. **Replace old form** dengan v2
4. **Test thoroughly** di admin panel
5. **Migrate existing data** (optional)

## ⚠️ Breaking Changes

- Old banner data dengan `position: "left" | "center" | "right"` tidak compatible
- Need data migration or create new banners
- Frontend components need update to read new structure

## 💡 Benefits

✅ **Precise positioning**: Pixel-perfect control  
✅ **Mobile optimization**: Different layout per device  
✅ **Better UX**: Visual drag & drop  
✅ **Flexible**: Can position anywhere, not just left/center/right  
✅ **Optional mobile**: Fallback to desktop saves time

---

**Status**: In Progress  
**Next**: Update API routes untuk support new structure
