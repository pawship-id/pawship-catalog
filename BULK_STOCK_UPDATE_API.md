# 📦 Bulk Stock Update API Documentation

Fitur untuk melakukan update stock produk secara massal (bulk) melalui file CSV upload.

## 🎯 Features

- ✅ Upload CSV file dengan format `sku,stock`
- ✅ Validasi file CSV (tipe, ukuran, format)
- ✅ Bulk update stock menggunakan `bulkWrite()` untuk performa optimal
- ✅ Automatic logging ke collection `BackInStockLog`
- ✅ Skip invalid SKU dan return list SKU yang di-skip
- ✅ Validasi stock tidak boleh negatif
- ✅ Authentication & authorization (admin only)
- ✅ Download template CSV
- ✅ View stock update history dengan filtering

## 📁 File Structure

```
src/
├── app/api/admin/stock/
│   ├── bulk-update/
│   │   └── route.ts          # POST endpoint untuk bulk update
│   ├── logs/
│   │   └── route.ts          # GET endpoint untuk history logs
│   └── template/
│       └── route.ts          # GET endpoint untuk download template
├── lib/
│   ├── models/
│   │   └── BackInStockLog.ts # Mongoose model untuk logging
│   └── helpers/
│       └── csv-parser.ts     # Helper untuk parse & validate CSV
└── public/templates/
    └── stock-update-template.csv # Template CSV example
```

## 🚀 API Endpoints

### 1. Bulk Update Stock

**POST** `/api/admin/stock/bulk-update`

Upload CSV file untuk update stock secara massal.

**Request:**

```typescript
FormData {
  file: File (CSV)
}
```

**CSV Format:**

```csv
sku,stock
SKU-COLLAR-001,150
SKU-COLLAR-002,200
SKU-HARNESS-001,75
```

**Response Success:**

```json
{
  "success": true,
  "updatedCount": 8,
  "skippedCount": 2,
  "skipped": ["SKU-INVALID-001", "SKU-NOTFOUND-002"],
  "totalProcessed": 10,
  "message": "Successfully updated 8 variants. 2 SKUs were skipped."
}
```

**Response Error:**

```json
{
  "success": false,
  "message": "Failed to parse CSV file",
  "errors": [
    "Row 3: Stock must be a valid number",
    "Row 5: SKU is required and must be a string"
  ]
}
```

**Validations:**

- ✅ File harus tipe CSV
- ✅ Max file size: 5MB
- ✅ SKU harus string dan tidak kosong
- ✅ Stock harus number dan tidak boleh negatif
- ✅ Admin authentication required

---

### 2. Download Template CSV

**GET** `/api/admin/stock/template`

Download template CSV untuk bulk update.

**Response:**

```csv
sku,stock
SKU-EXAMPLE-001,100
SKU-EXAMPLE-002,200
SKU-EXAMPLE-003,150
```

**Headers:**

```
Content-Type: text/csv
Content-Disposition: attachment; filename=stock-update-template.csv
```

---

### 3. Get Stock Update Logs

**GET** `/api/admin/stock/logs`

Retrieve history log stock updates dengan filtering dan pagination.

**Query Parameters:**

- `page` (number, default: 1) - Halaman pagination
- `limit` (number, default: 50) - Jumlah data per halaman
- `sku` (string, optional) - Filter by SKU (case-insensitive)
- `startDate` (ISO date, optional) - Filter dari tanggal
- `endDate` (ISO date, optional) - Filter sampai tanggal

**Example Request:**

```
GET /api/admin/stock/logs?page=1&limit=20&sku=COLLAR&startDate=2025-01-01
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "productId": {
        "_id": "...",
        "name": "Premium Dog Collar",
        "slug": "premium-dog-collar"
      },
      "variantId": {
        "_id": "...",
        "name": "Red - Size M",
        "sku": "SKU-COLLAR-001"
      },
      "sku": "SKU-COLLAR-001",
      "oldStock": 50,
      "newStock": 150,
      "updatedBy": "admin@example.com",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "message": "Stock logs fetched successfully"
}
```

---

## 📊 Database Schema

### BackInStockLog Collection

```typescript
{
  _id: ObjectId,
  productId: ObjectId,        // Reference to Product
  variantId: ObjectId,        // Reference to ProductVariant
  sku: string,               // SKU produk variant
  oldStock: number,          // Stock sebelum update
  newStock: number,          // Stock setelah update
  updatedBy: string,         // Email admin yang update
  updatedAt: Date,           // Timestamp update
  createdAt: Date,           // Auto timestamp
  updatedAt: Date            // Auto timestamp
}
```

**Indexes:**

- `productId` (single)
- `variantId` (single)
- `sku` (single)
- `updatedAt` (single)
- `{ productId: 1, updatedAt: -1 }` (compound)
- `{ variantId: 1, updatedAt: -1 }` (compound)

---

## 🔧 How It Works

### Flow Diagram

```
1. Admin upload CSV file
   ↓
2. Validate file (type, size)
   ↓
3. Parse CSV menggunakan PapaParse
   ↓
4. Validate setiap row (sku, stock)
   ↓
5. Loop setiap row:
   - Find ProductVariant by SKU
   - If not found → add to skipped list
   - If found → prepare bulk operation
   ↓
6. Execute bulkWrite() untuk update stock
   ↓
7. Insert logs ke BackInStockLog collection
   ↓
8. Return success dengan updatedCount & skipped list
```

### Code Flow

**1. Authentication**

```typescript
const session = await getServerSession(authOptions);
if (!session || session.user.role !== "admin") {
  return 401 Unauthorized
}
```

**2. File Validation**

```typescript
validateCSVFile(file);
// Check: type, size, empty
```

**3. CSV Parsing**

```typescript
parseCSVFile(file);
// Parse dengan PapaParse
// Validate: sku (string), stock (number >= 0)
```

**4. Data Processing**

```typescript
for (const row of csvData) {
  const variant = await ProductVariant.findOne({ sku });

  if (!variant) {
    skipped.push(sku);
    continue;
  }

  bulkOperations.push({
    updateOne: {
      filter: { _id: variant._id },
      update: { $set: { stock } },
    },
  });

  logsToInsert.push({
    /* log data */
  });
}
```

**5. Bulk Update**

```typescript
await ProductVariant.bulkWrite(bulkOperations);
await BackInStockLog.insertMany(logsToInsert);
```

---

## 📝 Usage Example

### Frontend Implementation (Example)

```typescript
// Upload CSV
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/stock/bulk-update", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (result.success) {
    console.log(`Updated: ${result.updatedCount}`);
    console.log(`Skipped: ${result.skipped.join(", ")}`);
  }
};

// Download template
const downloadTemplate = () => {
  window.open("/api/admin/stock/template", "_blank");
};

// Get logs
const getLogs = async (page = 1, sku?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: "20",
  });

  if (sku) params.append("sku", sku);

  const response = await fetch(`/api/admin/stock/logs?${params}`);
  const result = await response.json();

  return result.data;
};
```

---

## ⚠️ Error Handling

**Common Errors:**

| Error Code | Message                             | Solution                          |
| ---------- | ----------------------------------- | --------------------------------- |
| 401        | Unauthorized                        | User harus login sebagai admin    |
| 400        | No file uploaded                    | Pastikan field name "file" terisi |
| 400        | Invalid file type                   | Upload file dengan extension .csv |
| 400        | File size exceeds 5MB               | Compress atau split CSV file      |
| 400        | CSV file is empty                   | Pastikan CSV memiliki data        |
| 400        | Row X: Stock must be a valid number | Fix data di row yang error        |
| 400        | Row X: Stock cannot be negative     | Stock harus >= 0                  |
| 500        | Failed to update stock              | Check server logs                 |

---

## 🎓 Best Practices

1. **CSV Format:**
   - Gunakan UTF-8 encoding
   - Header harus persis: `sku,stock`
   - Jangan ada spasi di header
   - SKU case-sensitive (sesuaikan dengan database)

2. **Performance:**
   - Limit CSV max 1000 rows per upload
   - Untuk data lebih besar, split ke beberapa file
   - `bulkWrite()` jauh lebih cepat dari loop `save()`

3. **Logging:**
   - Semua update tercatat di `BackInStockLog`
   - Gunakan untuk audit trail
   - Filter by date untuk monthly report

4. **Testing:**
   - Test dengan template CSV terlebih dahulu
   - Check skipped list sebelum re-upload
   - Verify stock di database setelah update

---

## 🔍 Monitoring & Debugging

**Check logs:**

```typescript
// Get recent updates
GET /api/admin/stock/logs?page=1&limit=50

// Find specific SKU
GET /api/admin/stock/logs?sku=COLLAR-001

// Date range
GET /api/admin/stock/logs?startDate=2025-01-01&endDate=2025-01-31
```

**Database queries:**

```javascript
// MongoDB Shell - Check logs
db.back_in_stock_logs.find().sort({ updatedAt: -1 }).limit(10);

// Find by admin
db.back_in_stock_logs.find({ updatedBy: "admin@example.com" });

// Aggregate total updated by date
db.back_in_stock_logs.aggregate([
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
      count: { $sum: 1 },
    },
  },
]);
```

---

## 📦 Dependencies

```json
{
  "papaparse": "^5.4.1",
  "@types/papaparse": "^5.3.7",
  "mongoose": "^8.x.x",
  "next-auth": "^4.x.x"
}
```

Install:

```bash
npm install papaparse @types/papaparse
```

---

## 🚦 Future Improvements

- [ ] Export logs to CSV
- [ ] Email notification setelah bulk update
- [ ] Dry-run mode (preview without update)
- [ ] Rollback feature (undo last update)
- [ ] Support Excel format (.xlsx)
- [ ] Real-time progress bar dengan WebSocket
- [ ] Batch processing untuk file besar (chunk upload)

---

## 📞 Support

Jika ada issue atau pertanyaan:

1. Check error message di response
2. Validate CSV format dengan template
3. Check server logs untuk detail error
4. Contact backend team

---

**Created by:** Salwa Munir  
**Date:** January 2025  
**Version:** 1.0.0
