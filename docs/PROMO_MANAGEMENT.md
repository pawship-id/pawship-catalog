# 📢 Promo Management System

Dokumentasi lengkap untuk sistem manajemen promo di Pawship Catalog. Sistem ini memungkinkan admin untuk membuat, mengelola, dan menghapus promo dengan discount yang berbeda untuk setiap currency di level variant product.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Data Structure](#data-structure)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

---

## 🎯 Overview

Sistem promo management memungkinkan admin untuk:

- Membuat promo dengan periode waktu tertentu (start date - end date)
- Menambahkan multiple products ke dalam satu promo
- Mengatur discount percentage berbeda untuk setiap currency (IDR, USD, EUR) per variant
- Mengaktifkan/menonaktifkan variant tertentu dalam promo
- Soft delete promo (data tidak permanen terhapus)

### Key Highlight: Discount Per Currency

Setiap variant product bisa memiliki **discount percentage yang berbeda untuk setiap currency**. Ini memungkinkan strategi pricing yang fleksibel untuk pasar yang berbeda.

**Contoh:**

- IDR: 20% discount (untuk customer lokal Indonesia)
- USD: 15% discount (untuk international customers)
- EUR: 25% discount (special promotion untuk European market)

---

## ✨ Features

### 1. **Multi-Currency Discount System**

- Discount percentage independent per currency
- Auto-calculate discounted price berdasarkan discount %
- Manual input discounted price (auto-recalculate discount %)

### 2. **Flexible Product Selection**

- Modal untuk memilih products dari inventory
- Search & filter products
- Exclude products yang sudah dipilih
- Preview image & variant count

### 3. **Variant-Level Control**

- Toggle active/inactive per variant
- Individual discount setting per variant
- Remove variant from promo
- Display variant image & details

### 4. **Soft Delete**

- Data tidak permanen terhapus dari database
- Menggunakan mongoose-delete plugin
- Tracking deletedAt & deletedBy

### 5. **Validation**

- End date harus setelah start date
- Discount percentage 0-100% per currency
- Minimal 1 product dalam promo
- Minimal 1 active variant

---

## 📊 Data Structure

### Database Schema

#### Promo Model

```typescript
interface IPromo {
  _id: ObjectId;
  promoName: string; // Max 150 characters
  startDate: Date; // Promo start date
  endDate: Date; // Promo end date (must be > startDate)
  products: IPromoProduct[]; // Array of products in promo
  isActive: boolean; // Promo active status
  deleted: boolean; // Soft delete flag
  deletedAt: Date; // Soft delete timestamp
  deletedBy: ObjectId; // User who deleted
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-generated
}
```

#### Promo Product (Embedded)

```typescript
interface IPromoProduct {
  productId: ObjectId; // Reference to Product
  productName: string; // Product name (denormalized)
  variants: IPromoVariant[]; // Array of variants in promo
}
```

#### Promo Variant (Embedded)

```typescript
interface IPromoVariant {
  variantId: ObjectId; // Reference to ProductVariant
  variantName: string; // Variant name
  originalPrice: Record<string, number>; // { idr: 100000, usd: 10, eur: 9 }
  discountPercentage: Record<string, number>; // { idr: 20, usd: 15, eur: 25 }
  discountedPrice: Record<string, number>; // { idr: 80000, usd: 8.5, eur: 6.75 }
  isActive: boolean; // Variant active in promo
  image?: {
    imageUrl: string;
    imagePublicId: string;
  };
}
```

### TypeScript Types

Located in `/src/lib/types/promo.ts`:

```typescript
export interface PromoVariant {
  variantId: string;
  variantName: string;
  originalPrice: Record<string, number>;
  discountPercentage: Record<string, number>; // Per currency
  discountedPrice: Record<string, number>;
  isActive: boolean;
  image?: {
    imageUrl: string;
    imagePublicId: string;
  };
}

export interface PromoProduct {
  productId: string;
  productName: string;
  variants: PromoVariant[];
}

export interface PromoData {
  _id: string;
  promoName: string;
  startDate: string | Date;
  endDate: string | Date;
  products: PromoProduct[];
  isActive: boolean;
  deleted?: boolean;
  deletedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PromoForm {
  promoName: string;
  startDate: string;
  endDate: string;
  products: PromoProduct[];
  isActive: boolean;
}
```

---

## 🔌 API Endpoints

Base URL: `/api/admin/promos`

### 1. Get All Promos

**Endpoint:** `GET /api/admin/promos`

**Description:** Fetch all non-deleted promos, sorted by creation date (newest first)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "6580abc123def456",
      "promoName": "Black Friday Sale",
      "startDate": "2025-11-25T00:00:00.000Z",
      "endDate": "2025-11-30T23:59:59.999Z",
      "products": [...],
      "isActive": true,
      "createdAt": "2025-11-17T10:00:00.000Z",
      "updatedAt": "2025-11-17T10:00:00.000Z"
    }
  ],
  "message": "Promos fetched successfully"
}
```

### 2. Get Single Promo

**Endpoint:** `GET /api/admin/promos/:id`

**Description:** Fetch single promo by ID

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "6580abc123def456",
    "promoName": "Black Friday Sale",
    "startDate": "2025-11-25T00:00:00.000Z",
    "endDate": "2025-11-30T23:59:59.999Z",
    "products": [
      {
        "productId": "prod123",
        "productName": "Dog Collar Premium",
        "variants": [
          {
            "variantId": "var1",
            "variantName": "Small - Red",
            "originalPrice": {
              "idr": 100000,
              "usd": 10,
              "eur": 9
            },
            "discountPercentage": {
              "idr": 20,
              "usd": 15,
              "eur": 25
            },
            "discountedPrice": {
              "idr": 80000,
              "usd": 8.5,
              "eur": 6.75
            },
            "isActive": true,
            "image": {
              "imageUrl": "https://...",
              "imagePublicId": "cloudinary-id"
            }
          }
        ]
      }
    ],
    "isActive": true,
    "createdAt": "2025-11-17T10:00:00.000Z",
    "updatedAt": "2025-11-17T10:00:00.000Z"
  },
  "message": "Promo fetched successfully"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Promo not found"
}
```

### 3. Create Promo

**Endpoint:** `POST /api/admin/promos`

**Request Body:**

```json
{
  "promoName": "Black Friday Sale",
  "startDate": "2025-11-25",
  "endDate": "2025-11-30",
  "products": [
    {
      "productId": "prod123",
      "productName": "Dog Collar Premium",
      "variants": [
        {
          "variantId": "var1",
          "variantName": "Small - Red",
          "originalPrice": {
            "idr": 100000,
            "usd": 10,
            "eur": 9
          },
          "discountPercentage": {
            "idr": 20,
            "usd": 15,
            "eur": 25
          },
          "discountedPrice": {
            "idr": 80000,
            "usd": 8.5,
            "eur": 6.75
          },
          "isActive": true,
          "image": {
            "imageUrl": "https://...",
            "imagePublicId": "cloudinary-id"
          }
        }
      ]
    }
  ],
  "isActive": true
}
```

**Validation Rules:**

- `promoName`: Required, max 150 characters
- `startDate`: Required, valid date
- `endDate`: Required, must be after startDate
- `products`: Optional, array of products

**Response (201):**

```json
{
  "success": true,
  "data": { ...created promo... },
  "message": "Promo created successfully"
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "End date must be after start date"
}
```

### 4. Update Promo

**Endpoint:** `PUT /api/admin/promos/:id`

**Request Body:** (Same as Create, all fields optional)

**Response:**

```json
{
  "success": true,
  "data": { ...updated promo... },
  "message": "Promo updated successfully"
}
```

### 5. Delete Promo (Soft Delete)

**Endpoint:** `DELETE /api/admin/promos/:id`

**Description:** Soft delete promo (data still exists in DB with deleted flag)

**Response:**

```json
{
  "success": true,
  "message": "Promo deleted successfully"
}
```

---

## 🎨 Frontend Components

### Component Structure

```
src/components/admin/promos/
├── form-promo.tsx              # Main form component
├── product-selector-modal.tsx  # Modal to select products
└── variant-discount-item.tsx   # Variant discount management
```

### 1. FormPromo Component

**Location:** `/src/components/admin/promos/form-promo.tsx`

**Props:**

```typescript
interface FormPromoProps {
  initialData?: PromoData; // For edit mode
  isEdit?: boolean; // Edit or create mode
}
```

**Features:**

- Informasi Dasar section (promo name, dates, active toggle)
- Product selection with modal
- Variant management per product
- Form validation
- Submit handler with API integration

**Usage:**

```tsx
// Create mode
<FormPromo />

// Edit mode
<FormPromo initialData={promoData} isEdit={true} />
```

### 2. ProductSelectorModal Component

**Location:** `/src/components/admin/promos/product-selector-modal.tsx`

**Props:**

```typescript
interface ProductSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedProducts: ProductData[]) => void;
  excludeProductIds?: string[];
}
```

**Features:**

- Search products by name
- Checkbox selection
- Product preview (image, name, variant count)
- Exclude already selected products
- Confirmation button

### 3. VariantDiscountItem Component

**Location:** `/src/components/admin/promos/variant-discount-item.tsx`

**Props:**

```typescript
interface VariantDiscountItemProps {
  variant: PromoVariant;
  currencies: string[];
  onUpdate: (variant: PromoVariant) => void;
  onRemove?: () => void;
}
```

**Features:**

- Display variant image & name
- Active/inactive toggle
- **Per-currency pricing:**
  - Original price (read-only)
  - Discount percentage input (0-100%)
  - Discounted price input (auto-calculate)
- Remove variant button

**Layout:**

```
┌─────────────────────────────────────┐
│ [Image] Variant Name                │
│         Variant ID: xxx       Active│
├─────────────────────────────────────┤
│ IDR PRICING                         │
│ Original Price:   100,000           │
│ Discount (%):     [20___]%          │
│ Discounted Price: [80,000___]       │
├─────────────────────────────────────┤
│ USD PRICING                         │
│ Original Price:   10.00             │
│ Discount (%):     [15___]%          │
│ Discounted Price: [8.50___]         │
├─────────────────────────────────────┤
│ EUR PRICING                         │
│ Original Price:   9.00              │
│ Discount (%):     [25___]%          │
│ Discounted Price: [6.75___]         │
└─────────────────────────────────────┘
```

---

## 🚀 Usage Examples

### Example 1: Create Basic Promo

```typescript
// 1. Navigate to create page
router.push("/dashboard/promos/create");

// 2. Fill form
const promoData = {
  promoName: "Weekend Flash Sale",
  startDate: "2025-11-23",
  endDate: "2025-11-24",
  isActive: true,
};

// 3. Add products via modal
// Click "Tambah Produk" → Select products → Confirm

// 4. Set discounts per variant per currency
// For each variant, input discount % for IDR, USD, EUR

// 5. Submit form
```

### Example 2: Create Promo with Different Discounts

**Scenario:** Black Friday promo dengan discount berbeda per region

```javascript
const promo = {
  promoName: "Black Friday 2025",
  startDate: "2025-11-25",
  endDate: "2025-11-30",
  products: [
    {
      productId: "prod_collar_123",
      productName: "Premium Dog Collar",
      variants: [
        {
          variantId: "var_small_red",
          variantName: "Small - Red",
          originalPrice: {
            idr: 100000,
            usd: 10,
            eur: 9,
          },
          // Local market gets highest discount
          discountPercentage: {
            idr: 30, // 30% for Indonesia
            usd: 20, // 20% for US
            eur: 25, // 25% for Europe
          },
          discountedPrice: {
            idr: 70000, // Auto-calculated
            usd: 8, // Auto-calculated
            eur: 6.75, // Auto-calculated
          },
          isActive: true,
        },
        {
          variantId: "var_medium_blue",
          variantName: "Medium - Blue",
          originalPrice: {
            idr: 150000,
            usd: 15,
            eur: 13.5,
          },
          // Premium variant gets less discount
          discountPercentage: {
            idr: 20,
            usd: 15,
            eur: 18,
          },
          discountedPrice: {
            idr: 120000,
            usd: 12.75,
            eur: 11.07,
          },
          isActive: true,
        },
      ],
    },
  ],
  isActive: true,
};
```

### Example 3: Edit Existing Promo

```typescript
// 1. Navigate to edit page
router.push(`/dashboard/promos/${promoId}/edit`);

// 2. Form auto-loads with existing data

// 3. Modify as needed:
// - Change dates
// - Add/remove products
// - Adjust discount percentages
// - Toggle variant active status

// 4. Submit to update
```

### Example 4: Deactivate Variant in Promo

```typescript
// Scenario: One variant is out of stock, deactivate from promo

// 1. Open promo edit page
// 2. Find the variant
// 3. Toggle "Active" switch to OFF
// 4. Variant remains in promo but isActive = false
// 5. Save promo
```

---

## 💡 Best Practices

### 1. Discount Strategy

**Different Markets:**

```javascript
// Higher discount for local market
discountPercentage: {
  idr: 30,  // Local customers
  usd: 20,  // International
  eur: 25   // Europe special
}
```

**Uniform Discount:**

```javascript
// Same discount for all currencies
discountPercentage: {
  idr: 25,
  usd: 25,
  eur: 25
}
```

### 2. Date Management

- Always set clear start and end dates
- Consider timezone differences
- Set end date to 23:59:59 for full day coverage

```javascript
{
  startDate: "2025-11-25T00:00:00.000Z",
  endDate: "2025-11-30T23:59:59.999Z"
}
```

### 3. Variant Selection

- Only activate variants that have stock
- Use isActive toggle instead of removing variants
- Keep deactivated variants for historical data

### 4. Product Organization

- Group related products in same promo
- Use clear promo names (e.g., "Flash Sale November 2025")
- Don't overcomplicate with too many products

### 5. Testing

Before going live:

- Test all currency calculations
- Verify date ranges
- Check variant active status
- Test soft delete functionality

---

## 🔧 Technical Details

### Currency Support

Currently supports 3 currencies (configurable in `form-promo.tsx`):

```typescript
const CURRENCIES = ["idr", "usd", "eur"];
```

To add more currencies:

1. Update CURRENCIES array
2. Ensure product variants have prices for new currency
3. UI will automatically generate inputs for new currency

### Soft Delete Implementation

Uses `mongoose-delete` plugin:

```typescript
PromoSchema.plugin(softDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});
```

**Benefits:**

- Data recovery possible
- Audit trail
- References remain valid

**Query deleted promos:**

```javascript
Promo.findDeleted(); // Get deleted promos
Promo.restore({ _id: promoId }); // Restore promo
```

### Validation

**Model Level:**

- Discount percentage: 0-100 per currency
- End date > Start date (pre-save hook)

**Form Level:**

- Required fields check
- Date logic validation
- Minimum 1 product
- Minimum 1 active variant

---

## 📁 File Locations

```
Project Root
├── src/
│   ├── lib/
│   │   ├── models/
│   │   │   └── Promo.ts                    # Mongoose model
│   │   └── types/
│   │       └── promo.ts                    # TypeScript types
│   ├── app/
│   │   ├── api/admin/promos/
│   │   │   ├── route.ts                    # GET all, POST create
│   │   │   └── [id]/route.ts               # GET single, PUT, DELETE
│   │   └── (admin)/dashboard/promos/
│   │       ├── page.tsx                    # List page
│   │       ├── create/page.tsx             # Create page
│   │       └── [id]/edit/page.tsx          # Edit page
│   └── components/admin/promos/
│       ├── form-promo.tsx                  # Main form
│       ├── product-selector-modal.tsx      # Product selector
│       └── variant-discount-item.tsx       # Variant discount UI
└── docs/
    └── PROMO_MANAGEMENT.md                 # This file
```

---

## 🐛 Troubleshooting

### Issue: Discount not calculating correctly

**Solution:** Check that originalPrice has values for all currencies before setting discount.

### Issue: Cannot save promo with validation error

**Solution:** Ensure:

- End date is after start date
- All discount percentages are 0-100
- At least one variant is active

### Issue: Product not showing in modal

**Solution:** Check:

- Product has `deleted: false` or no deleted flag
- Product has variants with prices
- Product not already selected (excluded from list)

### Issue: Discounted price not updating

**Solution:** Verify:

- Discount percentage is valid number
- Original price exists for that currency
- Component state is updating correctly

---

## 🔄 Future Enhancements

Potential improvements:

1. **Promo Code System**
   - Add promo code field
   - Code validation on checkout

2. **Usage Limits**
   - Max usage per user
   - Total usage limit

3. **Customer Segmentation**
   - Target specific customer groups
   - Tier-based discounts

4. **Analytics Dashboard**
   - Track promo performance
   - Sales metrics
   - Conversion rates

5. **Scheduled Activation**
   - Auto-activate on start date
   - Auto-deactivate on end date

6. **Bulk Operations**
   - Bulk edit discounts
   - Apply same discount to multiple variants
   - Duplicate promo

---

## 📞 Support

For questions or issues:

- Check this documentation
- Review code comments in source files
- Contact development team

---

**Last Updated:** November 17, 2025
**Version:** 1.0.0
