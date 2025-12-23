# Product Seeder - Cloudinary Integration

## Overview

Product seeder telah dimodifikasi untuk otomatis mengupload semua gambar dan video dari Google Drive ke Cloudinary sebelum disimpan ke database.

## Perubahan yang Dilakukan

### 1. Dependencies Baru

- **axios**: Untuk download gambar dari Google Drive
- **cloudinary**: Untuk upload ke Cloudinary

Kedua package sudah terinstall di `package.json`.

### 2. Fungsi Helper Baru

#### `extractGoogleDriveFileId(url)`

Mengekstrak file ID dari berbagai format URL Google Drive:

- `https://drive.google.com/file/d/FILE_ID/view`
- `https://drive.google.com/open?id=FILE_ID`
- Dan format lainnya

#### `uploadImageToCloudinary(imageUrl, folder, resourceType)`

- Cek apakah URL sudah dari Cloudinary (skip jika ya)
- Download gambar dari Google Drive
- Convert ke base64
- Upload ke Cloudinary
- Return object: `{ url: cloudinaryUrl, publicId: cloudinaryPublicId }`
- Jika error, return URL original sebagai fallback

### 3. File yang Diupload

Seeder akan mengupload semua gambar/video ke Cloudinary dengan folder structure:

- **Product Images**: `pawship catalog/products/`
- **Size Product Images**: `pawship catalog/products/size/`
- **Variant Images**: `pawship catalog/products/variants/`
- **Product Videos**: `pawship catalog/products/videos/`

**Note:** Jika URL sudah dari Cloudinary, seeder akan skip upload dan langsung menyimpan dengan `publicId: "-"`

### 4. Proses Upload

Untuk setiap gambar:

1. Cek apakah URL sudah dari Cloudinary (skip jika ya)
2. Deteksi apakah URL dari Google Drive
3. Jika ya, download file dari Google Drive
4. Upload ke Cloudinary dengan folder sesuai tipe
5. Simpan Cloudinary URL dan Public ID ke database
6. Jika error, gunakan URL original sebagai fallback

## Environment Variables Required

Tambahkan ke file `.env` di root project:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Cara Mendapatkan Cloudinary Credentials

1. Sign up/login ke [cloudinary.com](https://cloudinary.com)
2. Di Dashboard, akan terlihat:
   - Cloud Name
   - API Key
   - API Secret
3. Copy dan paste ke file `.env`

## Cara Menjalankan Seeder

```bash
npm run seed
```

Atau:

```bash
node ./src/lib/seeders/productSeeder.js
```

## Log Output

Seeder akan menampilkan progress upload:

```
📤 Uploading size image 1 to Cloudinary...
📤 Uploading product image 1 to Cloudinary...
📤 Uploading product video 1 to Cloudinary...
📤 Uploading variant image to Cloudinary...
✓ Size Images: 5 images uploaded to Cloudinary
✓ Media: 8 items uploaded to Cloudinary (images + videos)
```

## Format URL Google Drive yang Didukung

- `https://drive.google.com/file/d/FILE_ID/view`
- `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
- `https://drive.google.com/open?id=FILE_ID`
- `https://drive.google.com/uc?id=FILE_ID`

## Error Handling

Jika upload ke Cloudinary gagal:

- Error akan di-log ke console
- URL original Google Drive akan tetap disimpan ke database
- Seeder akan tetap melanjutkan proses untuk gambar berikutnya

## Important Notes

1. **Pastikan file di Google Drive bersifat PUBLIC** agar bisa didownload
2. Upload ke Cloudinary membutuhkan waktu, seeder akan lebih lama dibanding sebelumnya
3. Jika ada banyak gambar, proses bisa memakan waktu beberapa menit
4. Pastikan koneksi internet stabil

## Troubleshooting

### Error: "Cannot read property 'secure_url' of undefined"

- Cek apakah environment variables sudah benar
- Cek apakah Cloudinary credentials valid

### Error: "Request failed with status code 403"

- File Google Drive tidak public
- Share file dengan setting "Anyone with the link can view"

### Upload lambat

- Normal jika ada banyak gambar
- Setiap gambar perlu didownload dari Google Drive kemudian diupload ke Cloudinary
- Consider membatasi jumlah gambar per product untuk testing

## Benefits

✅ **Performance**: Cloudinary CDN lebih cepat dari Google Drive
✅ **Reliability**: Tidak tergantung pada Google Drive sharing links
✅ **Control**: Bisa manage semua media dari Cloudinary dashboard
✅ **Transformation**: Bisa gunakan Cloudinary transformation untuk resize/optimize
✅ **Tracking**: Public ID tersimpan untuk referensi dan management
