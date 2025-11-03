# Banner Management Module

Module lengkap untuk mengelola banner di semua halaman public Pawship Catalog.

## Available Pages

Banner tersedia untuk 8 halaman public:

1. **Home** - Carousel dengan multiple banners
2. **Our Collection** - Single banner
3. **Reseller Program** - Single banner
4. **Reseller Whitelabeling** - Single banner
5. **About Us** - Single banner
6. **Contact Us** - Single banner
7. **Stores** - Single banner
8. **Payment** - Single banner

## Fitur Utama

### 1. Multiple Banner Support

- **Home Page**: Mendukung multiple banners dengan carousel (auto-slide 5s)
- **Halaman Lainnya**: Single banner (display first active banner only)

### 2. Responsive Image dengan Ukuran Berbeda

**Home Page Banner (Carousel):**

- Desktop: **1920x600px** (Height: 600px)
- Mobile: **768x400px** (Height: 400px)

**Other Pages Banner (Single):**

- Desktop: **1920x400px** (Height: 400px)
- Mobile: **768x300px** (Height: 300px)

📖 **Lihat detail lengkap**: `BANNER_SIZE_GUIDE.md`

**Notes:**

- Desktop image **required**
- Mobile image **optional** (fallback to desktop if not provided)
- Format: JPEG, PNG, WebP
- Max file size: 5MB (desktop), 3MB (mobile)

### 3. Customization

- Button dengan custom text, URL, color, dan position (left/center/right)
- Text color customization
- Overlay color dengan opacity
- Text position (left/center/right)

### 4. Management Features

- Drag & drop untuk reorder banner (per page)
- Active/Inactive toggle
- Soft delete (data tidak hilang permanent)
- Live preview saat create/edit

## File Structure

```
src/
├── lib/
│   └── models/
│       └── Banner.ts                                    # Mongoose schema
│
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   └── banners/
│   │   │       ├── route.ts                            # GET, POST, PATCH
│   │   │       └── [id]/
│   │   │           └── route.ts                        # GET, PUT, DELETE by ID
│   │   │
│   │   └── public/
│   │       └── banners/
│   │           └── route.ts                            # Public GET endpoint
│   │
│   └── (admin)/
│       └── dashboard/
│           └── banners/
│               ├── page.tsx                            # List page
│               ├── create/
│               │   └── page.tsx                        # Create page
│               └── edit/
│                   └── [id]/
│                       └── page.tsx                    # Edit page
│
└── components/
    ├── admin/
    │   └── banners/
    │       ├── form-banner.tsx                         # Form untuk create/edit
    │       └── table-banner.tsx                        # Table dengan drag & drop
    │
    ├── landing-page/
    │   └── home-banner-carousel.tsx                    # Carousel untuk Home
    │
    └── common/
        └── single-banner.tsx                           # Single banner untuk halaman lain
```

## Database Schema

```typescript
{
  title: string;                      // Required
  description?: string;               // Optional
  page: 'home' | 'our-collection' | 'reseller-program' | 'reseller-whitelabeling'
        | 'about-us' | 'contact-us' | 'stores' | 'payment';

  desktopImageUrl: string;            // Required
  desktopImagePublicId: string;
  mobileImageUrl?: string;            // Optional
  mobileImagePublicId?: string;

  button: {
    text?: string;
    url?: string;
    color?: string;                   // Hex color (default: #FF6B35)
    position?: 'left' | 'center' | 'right';
  };

  style: {
    textColor?: string;               // Hex color (default: #FFFFFF)
    overlayColor?: string;            // Hex color (optional)
    textPosition?: 'left' | 'center' | 'right';
  };

  order: number;                      // For sorting
  isActive: boolean;                  // Active/Inactive toggle

  // Soft delete fields (mongoose-delete plugin)
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}
```

## API Endpoints

### Admin Endpoints (Auth Required)

#### 1. GET /api/admin/banners

Fetch all banners dengan optional filter

```typescript
Query params:
- page?: 'home' | 'our-collection' | 'reseller-program' | 'reseller-whitelabeling'
         | 'about-us' | 'contact-us' | 'stores' | 'payment'
- isActive?: 'true' | 'false'

Response: {
  success: true,
  data: Banner[]
}
```

#### 2. POST /api/admin/banners

Create banner baru dengan FormData

```typescript
Body (FormData):
- title: string
- description?: string
- page: string
- desktopImage: File (required)
- mobileImage?: File (optional)
- buttonText?: string
- buttonUrl?: string
- buttonColor?: string
- buttonPosition?: string
- textColor?: string
- overlayColor?: string
- textPosition?: string
- order: string
- isActive: string

Response: {
  success: true,
  data: Banner,
  message: "Banner created successfully"
}
```

#### 3. PATCH /api/admin/banners

Update banner order (for drag & drop)

```typescript
Body: {
  banners: [
    { _id: string, order: number },
    ...
  ]
}

Response: {
  success: true,
  message: "Banner order updated successfully"
}
```

#### 4. GET /api/admin/banners/:id

Get single banner by ID

```typescript
Response: {
  success: true,
  data: Banner
}
```

#### 5. PUT /api/admin/banners/:id

Update banner dengan FormData

```typescript
Body (FormData):
- Same as POST
- isNewDesktopImage: 'true' | 'false'
- isNewMobileImage: 'true' | 'false'
- removeMobileImage: 'true' | 'false'

Response: {
  success: true,
  data: Banner,
  message: "Banner updated successfully"
}
```

#### 6. DELETE /api/admin/banners/:id

Soft delete banner

```typescript
Response: {
  success: true,
  message: "Banner deleted successfully"
}
```

### Public Endpoint (No Auth)

#### GET /api/public/banners

Fetch active banners for public pages

```typescript
Query params:
- page: 'home' | 'our-collection' | 'reseller-program' | 'reseller-whitelabeling'
        | 'about-us' | 'contact-us' | 'stores' | 'payment' (required)

Response: {
  success: true,
  data: Banner[]
}

Note: Only returns banners where isActive = true
Sorted by: order ASC, createdAt DESC
```

## Usage Guide

### 1. Admin - Create Banner

1. Navigate ke `/dashboard/banners`
2. Click "Add Banner" button
3. Fill form:
   - Title (required)
   - Description (optional)
   - Select page
   - Upload desktop image (required)
   - Upload mobile image (optional)
   - Configure button (optional)
   - Configure style (optional)
   - Set active status
4. Toggle "Show Preview" untuk melihat hasil
5. Switch antara Desktop/Mobile preview
6. Click "Create Banner"

### 2. Admin - Edit Banner

1. Navigate ke `/dashboard/banners`
2. Click edit icon pada banner yang ingin diedit
3. Update field yang diinginkan
4. Upload gambar baru jika perlu
5. Click "Update Banner"

### 3. Admin - Reorder Banner

1. Navigate ke `/dashboard/banners`
2. Select page yang ingin diatur (Home, Catalog, Collection, Other)
3. Drag and drop banner menggunakan grip icon (☰)
4. Order akan otomatis tersimpan

### 4. Admin - Toggle Active/Inactive

1. Navigate ke `/dashboard/banners`
2. Toggle switch pada kolom "Active"
3. Banner inactive tidak akan muncul di public pages

### 5. Admin - Delete Banner

1. Navigate ke `/dashboard/banners`
2. Click delete icon (🗑️)
3. Confirm deletion
4. Banner akan di-soft delete (bisa di-restore dari database jika perlu)

## Frontend Integration

### Home Page with Carousel

```tsx
import HomeBannerCarousel from "@/components/landing-page/home-banner-carousel";

export default function HomePage() {
  return (
    <div>
      <HomeBannerCarousel page="home" />
      {/* Rest of your content */}
    </div>
  );
}
```

### Other Pages with Single Banner

```tsx
import SingleBanner from "@/components/common/single-banner";

export default function CatalogPage() {
  return (
    <div>
      <SingleBanner page="catalog" />
      {/* Rest of your content */}
    </div>
  );
}
```

## Component Props

### HomeBannerCarousel

```typescript
interface HomeBannerCarouselProps {
  page?: string; // default: "home"
}
```

Features:

- Auto slide every 5 seconds
- Navigation arrows (left/right)
- Dot indicators
- Responsive image (mobile/desktop)
- Smooth transitions

### SingleBanner

```typescript
interface SingleBannerProps {
  page: string; // required: "catalog" | "collection" | "other"
}
```

Features:

- Display first active banner only
- Responsive image (mobile/desktop)
- Same styling as carousel

## Image Guidelines

### Desktop Image

- **Recommended Size**: 1920x600px
- **Aspect Ratio**: 16:5
- **Format**: JPEG, PNG, WebP
- **Max File Size**: 5MB

### Mobile Image

- **Recommended Size**: 768x600px
- **Aspect Ratio**: 1.28:1
- **Format**: JPEG, PNG, WebP
- **Max File Size**: 3MB

### Tips

- Use high-quality images
- Optimize images sebelum upload (compress)
- Test di berbagai screen sizes
- Pastikan text readable dengan background image

## Styling Guidelines

### Button

- Default color: `#FF6B35` (Pawship orange)
- Position: left/center/right
- Text color: white (fixed)

### Text

- Default color: `#FFFFFF` (white)
- Position: left/center/right
- Bisa disesuaikan untuk contrast dengan background

### Overlay

- Optional colored overlay dengan opacity 50%
- Helps with text readability
- Recommended untuk images dengan background yang ramai

## Technical Notes

### Cloudinary Integration

- Images di-upload ke folder: `pawship-catalog/banners`
- Public ID format: `banner-{timestamp}-{random}`
- Old images otomatis di-delete saat replace

### Soft Delete

- Menggunakan `mongoose-delete` plugin
- Deleted banners tidak muncul di query default
- Bisa di-restore dengan update `deleted: false`

### Performance

- Images di-lazy load
- Cache strategy: `no-store` untuk admin, cache untuk public
- Responsive images untuk bandwidth optimization

### Dependencies

- `@dnd-kit/core` - Drag and drop core
- `@dnd-kit/sortable` - Sortable functionality
- `@dnd-kit/utilities` - Utilities
- `cloudinary` - Image storage
- `mongoose-delete` - Soft delete plugin

## Troubleshooting

### Banner tidak muncul di public page

- Check `isActive` = true
- Check page filter sesuai
- Check apakah ada error di network tab
- Verify banner order

### Drag & drop tidak work

- Pastikan package `@dnd-kit/*` terinstall
- Check browser console untuk errors
- Try reload page

### Image tidak ter-upload

- Check file size < 5MB
- Check format (jpeg/jpg/png/webp)
- Check Cloudinary credentials
- Check network connection

### Preview tidak muncul

- Check FileReader compatibility
- Check browser console
- Try different browser

## Future Enhancements

Possible improvements:

- [ ] Schedule banner (start/end date)
- [ ] A/B testing support
- [ ] Click tracking & analytics
- [ ] Video banner support
- [ ] Animation options
- [ ] Multi-language support
- [ ] Banner templates
- [ ] Restore deleted banners UI

---

Created: 2024
Module: Banner Management
Version: 1.0.0
