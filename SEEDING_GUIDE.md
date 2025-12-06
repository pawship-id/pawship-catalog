# Product Seeding Guide

## Overview

Script untuk import data produk dari file Excel ke database MongoDB.

## Prerequisites

1. File Excel: `Template Data - Bulk Product.xlsx` harus ada di root project
2. MongoDB connection sudah dikonfigurasi di `.env`
3. Category dan Tags sudah ada di database

## Excel File Structure

### Row 1: Currency Information

- Cell A1: "Currency"
- Cell B1: "SGD/IDR/USD/HKD" (or actual currency code)

### Row 2: Empty Row

### Row 3: Headers

- Product Name
- Category
- Product Description
- MOQ Reseller
- Tags
- Exclude Country
- Pre-Order
- Marketing Links
- Sizes Product Images 1-10
- Product Images 1-10
- Product Videos 1-10
- Variant Type
- Variant Name
- Variant SKU Code
- Variant Image
- Attributes
- Variant Stock
- Price IDR
- Price USD
- Price SGD
- Price HKD

### Row 4+: Product Data

## Column Details

### Product Information

- **Product Name**: Nama produk (required)
- **Category**: Nama kategori (case-insensitive, required)
- **Product Description**: Deskripsi produk (HTML supported)
- **MOQ Reseller**: Minimum Order Quantity (default: 1)
- **Tags**: Comma-separated tags (e.g., "tag1,tag2,tag3")
- **Exclude Country**: Comma-separated countries to exclude (e.g., "Indonesia,Singapore")
- **Pre-Order**: Lead time jika pre-order (empty = tidak pre-order)
- **Marketing Links**: Comma-separated URLs

### Product Media

- **Sizes Product Images 1-10**: URLs untuk size chart images
- **Product Images 1-10**: URLs untuk product images
- **Product Videos 1-10**: URLs untuk product videos

### Variant Information

- **Variant Type**: Comma-separated variant types (e.g., "Color,Size")
- **Variant Name**: Nama variant (e.g., "Red - Small")
- **Variant SKU Code**: SKU code
- **Variant Image**: URL untuk variant image (optional)
- **Attributes**: Comma-separated values sesuai urutan Variant Type (e.g., "Red,Small")
- **Variant Stock**: Jumlah stock

### Pricing

- **Price IDR**: Harga dalam IDR (required)
- **Price USD**: Harga dalam USD (auto-calculate jika kosong)
- **Price SGD**: Harga dalam SGD (auto-calculate jika kosong)
- **Price HKD**: Harga dalam HKD (auto-calculate jika kosong)

## Auto-Calculation Rules

### Currency Conversion

Jika Price USD/SGD/HKD kosong, akan dihitung otomatis dari IDR:

- USD = IDR × 0.000063
- SGD = IDR × 0.000085
- HKD = IDR × 0.00049

### Generated Fields

- **slug**: Auto-generated dari Product Name
- **codeRow**: Random 8-character code untuk variant
- **position**: Urutan variant (1, 2, 3, ...)

## Data Grouping

Jika ada multiple rows dengan Product Name yang sama, akan digabung menjadi 1 product dengan multiple variants.

## Running the Seeder

```bash
npm run seed
```

## Output Example

```
🌱 Starting product seeding...

📂 Reading Excel file from: /path/to/Template Data - Bulk Product.xlsx
📊 Found 10 rows to process

🏷️  Processing 3 unique products

📦 Processing: Cat Collar Premium
   ✓ Category: Accessories
   ✓ Tags: 2 found
   ✓ Exclusive: Singapore, Indonesia
   ✓ Pre-Order: 2-3 weeks
   ✓ Size Images: 2 images
   ✓ Media: 5 items (images + videos)
   ✓ Variant Types: Color, Size
   ✅ Product created with ID: 507f1f77bcf86cd799439011
   📋 Creating 3 variants...
      ✓ Variant 1: Red - Small (SKU: CC-RED-S)
      ✓ Variant 2: Red - Medium (SKU: CC-RED-M)
      ✓ Variant 3: Blue - Small (SKU: CC-BLU-S)
   ✅ Product "Cat Collar Premium" completed successfully!

==================================================
📊 SEEDING SUMMARY
==================================================
✅ Successfully processed: 3 products
❌ Errors: 0 products
==================================================

🎉 Seeding completed!
```

## Error Handling

Script akan:

- ✅ Skip rows tanpa Product Name
- ⚠️ Warning jika Tag tidak ditemukan (lanjut tanpa tag)
- ❌ Error jika Category tidak ditemukan
- 📊 Tampilkan summary di akhir

## Notes

1. **Case-Insensitive**: Category dan Tag matching tidak case-sensitive
2. **Trim Whitespace**: Semua data otomatis di-trim
3. **Empty Values**: Kolom kosong akan di-handle dengan nilai default
4. **Media URLs**: Bisa dari mana saja (tidak harus Cloudinary)
5. **Multiple Variants**: Satu product bisa punya banyak variants dengan baris terpisah

## Troubleshooting

### Error: "Category not found"

- Pastikan category sudah ada di database
- Check spelling category name di Excel

### Error: "ENOENT: no such file or directory"

- Pastikan file `Template Data - Bulk Product.xlsx` ada di root project

### Error: "MongoDB connection error"

- Check MONGODB_URI di .env
- Pastikan MongoDB server running

### Variant tidak sesuai

- Check urutan Attributes harus sesuai dengan Variant Type
- Contoh: Variant Type = "Color,Size" maka Attributes = "Red,Small"
