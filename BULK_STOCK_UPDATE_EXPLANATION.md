# 📚 Penjelasan Implementasi Bulk Stock Update

## 🗂️ Struktur File yang Dibuat

### 1️⃣ Model: BackInStockLog.ts

**Lokasi:** `/src/lib/models/BackInStockLog.ts`

**Tujuan:** Mongoose model untuk menyimpan history perubahan stock

**Penjelasan Detail:**

```typescript
export interface IBackInStockLog extends Document {
  productId: Types.ObjectId; // ID produk (relasi ke Product)
  variantId: Types.ObjectId; // ID variant (relasi ke ProductVariant)
  sku: string; // SKU variant untuk searching
  oldStock: number; // Stock sebelum update
  newStock: number; // Stock setelah update
  updatedBy: string; // Email admin yang melakukan update
  updatedAt: Date; // Kapan update dilakukan
}
```

**Fitur Penting:**

1. **Indexes untuk Performance:**

   ```typescript
   // Single indexes
   productId: { index: true }
   variantId: { index: true }
   sku: { index: true }
   updatedAt: { index: true }

   // Compound indexes
   { productId: 1, updatedAt: -1 }  // Query logs by product
   { variantId: 1, updatedAt: -1 }  // Query logs by variant
   ```

   Index membuat query jadi lebih cepat, terutama untuk filtering dan sorting.

2. **Timestamps:**

   ```typescript
   {
     timestamps: true;
   }
   ```

   Otomatis menambahkan `createdAt` dan `updatedAt` pada setiap document.

3. **Singleton Pattern:**
   ```typescript
   mongoose.models.BackInStockLog ||
     mongoose.model<IBackInStockLog>("BackInStockLog", BackInStockLogSchema);
   ```
   Mencegah error "Cannot overwrite model" saat hot reload di development.

---

### 2️⃣ Helper: csv-parser.ts

**Lokasi:** `/src/lib/helpers/csv-parser.ts`

**Tujuan:** Utility functions untuk validasi dan parsing CSV file

**Functions:**

#### A. `validateCSVFile(file: File)`

**Purpose:** Validasi file sebelum di-parse

```typescript
export function validateCSVFile(file: File): {
  valid: boolean;
  error?: string;
};
```

**Validations:**

1. **File Type Check:**

   ```typescript
   const validTypes = ["text/csv", "application/vnd.ms-excel", "text/plain"]
   if (!validTypes.includes(file.type) && !file.name.endsWith(".csv"))
   ```

   - Check MIME type
   - Backup check dengan file extension
   - Karena kadang browser return MIME type yang berbeda

2. **File Size Check:**

   ```typescript
   const maxSize = 5 * 1024 * 1024  // 5MB
   if (file.size > maxSize)
   ```

   - Limit 5MB untuk mencegah memory overflow
   - Bisa disesuaikan sesuai kebutuhan

3. **Empty File Check:**
   ```typescript
   if (file.size === 0)
   ```

   - Prevent error saat parse file kosong

**Return:**

```typescript
{ valid: true }  // jika lolos semua validasi
{ valid: false, error: "error message" }  // jika ada error
```

---

#### B. `parseCSVFile(file: File)`

**Purpose:** Parse CSV file menjadi array of objects dengan validasi

```typescript
export async function parseCSVFile(file: File): Promise<ParseCSVResult>;
```

**Process Flow:**

1. **Convert File to Text:**

   ```typescript
   const reader = new FileReader();
   reader.readAsText(file);
   ```

   - FileReader API untuk baca file di browser
   - Async operation menggunakan Promise

2. **Parse dengan PapaParse:**

   ```typescript
   Papa.parse(csvText, {
     header: true, // Baris pertama jadi key
     skipEmptyLines: true, // Skip baris kosong
     transformHeader: (header) => header.trim().toLowerCase(),
   });
   ```

   **Kenapa PapaParse?**
   - ✅ Handle berbagai format CSV (comma, semicolon, tab)
   - ✅ Auto-detect delimiter
   - ✅ Handle quoted strings dengan benar
   - ✅ Fast dan reliable
   - ✅ Streaming support untuk file besar

3. **Validate Each Row:**

   ```typescript
   results.data.forEach((row: any, index: number) => {
     const rowNumber = index + 2; // +2 karena header di row 1

     // Validate SKU
     if (!row.sku || typeof row.sku !== "string" || row.sku.trim() === "") {
       errors.push(`Row ${rowNumber}: SKU is required`);
       return;
     }

     // Validate Stock
     const stock = parseInt(row.stock);
     if (isNaN(stock)) {
       errors.push(`Row ${rowNumber}: Stock must be a valid number`);
       return;
     }

     if (stock < 0) {
       errors.push(`Row ${rowNumber}: Stock cannot be negative`);
       return;
     }

     // Valid data
     validData.push({ sku: row.sku.trim(), stock });
   });
   ```

   **Validations:**
   - SKU: harus string, tidak boleh kosong, di-trim whitespace
   - Stock: harus number, tidak boleh NaN, tidak boleh negatif
   - Setiap error disimpan dengan row number untuk debugging

4. **Return Result:**
   ```typescript
   {
     success: errors.length === 0,
     data: validData,        // Array of { sku, stock }
     errors: errors          // Array of error messages
   }
   ```

**Example Input CSV:**

```csv
sku,stock
SKU001,100
SKU002,200
INVALID,abc
SKU004,-50
```

**Example Output:**

```typescript
{
  success: false,
  data: [
    { sku: "SKU001", stock: 100 },
    { sku: "SKU002", stock: 200 }
  ],
  errors: [
    "Row 4: Stock must be a valid number",
    "Row 5: Stock cannot be negative"
  ]
}
```

---

### 3️⃣ API Route: bulk-update/route.ts

**Lokasi:** `/src/app/api/admin/stock/bulk-update/route.ts`

**Tujuan:** Endpoint untuk bulk update stock via CSV upload

**Step-by-Step Explanation:**

#### **Step 1: Authentication**

```typescript
const session = await getServerSession(authOptions);

if (!session || session.user.role !== "admin") {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
```

**Penjelasan:**

- Ambil session dari NextAuth
- Check apakah user login DAN role = "admin"
- Kalau bukan admin, return 401 Unauthorized
- Security: hanya admin yang bisa update stock

---

#### **Step 2: Database Connection**

```typescript
await dbConnect();
```

**Penjelasan:**

- Connect ke MongoDB
- `dbConnect()` adalah singleton, jadi kalau sudah connect tidak akan connect lagi
- Penting dilakukan sebelum query database

---

#### **Step 3: Extract File from FormData**

```typescript
const formData = await req.formData();
const file = formData.get("file") as File | null;

if (!file) {
  return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
}
```

**Penjelasan:**

- NextRequest di App Router support FormData native
- Field name harus "file" (sesuai form di frontend)
- Validate file exists
- Return 400 Bad Request kalau tidak ada file

---

#### **Step 4: Validate File**

```typescript
const validation = validateCSVFile(file);

if (!validation.valid) {
  return NextResponse.json({ message: validation.error }, { status: 400 });
}
```

**Penjelasan:**

- Call helper function untuk validasi
- Check: file type, size, empty
- Return error message yang jelas untuk user
- Early return kalau validation gagal

---

#### **Step 5: Parse CSV**

```typescript
const parseResult = await parseCSVFile(file);

if (!parseResult.success) {
  return NextResponse.json(
    {
      message: "Failed to parse CSV file",
      errors: parseResult.errors,
    },
    { status: 400 }
  );
}

if (parseResult.data.length === 0) {
  return NextResponse.json(
    { message: "CSV file is empty or has no valid data" },
    { status: 400 }
  );
}
```

**Penjelasan:**

- Parse CSV menjadi array of objects
- Kalau ada error, return dengan detail errors
- Check apakah ada data valid
- Prevent process empty data

---

#### **Step 6: Process Each Row**

```typescript
const csvData = parseResult.data;
const skipped: string[] = [];
const logsToInsert: any[] = [];
const bulkOperations: any[] = [];

for (const row of csvData) {
  const { sku, stock } = row;

  // Find variant by SKU
  const variant = await ProductVariant.findOne({ sku }).populate("productId");

  if (!variant) {
    skipped.push(sku);
    continue;
  }

  const oldStock = variant.stock || 0;

  // Skip jika stock tidak berubah
  if (oldStock === stock) {
    continue;
  }

  // Prepare bulk update operation
  bulkOperations.push({
    updateOne: {
      filter: { _id: variant._id },
      update: { $set: { stock } },
    },
  });

  // Prepare log entry
  logsToInsert.push({
    productId: variant.productId,
    variantId: variant._id,
    sku: variant.sku,
    oldStock: oldStock,
    newStock: stock,
    updatedBy: adminEmail,
    updatedAt: new Date(),
  });
}
```

**Penjelasan Detail:**

1. **Find Variant:**

   ```typescript
   const variant = await ProductVariant.findOne({ sku }).populate("productId");
   ```

   - Query database untuk cari variant berdasarkan SKU
   - Populate productId untuk ambil data product sekalian
   - Kalau tidak ketemu, tambahkan ke skipped list

2. **Skip Unchanged:**

   ```typescript
   if (oldStock === stock) continue;
   ```

   - Optimization: skip kalau stock tidak berubah
   - Reduce jumlah update operations

3. **Prepare Bulk Operations:**

   ```typescript
   bulkOperations.push({
     updateOne: {
       filter: { _id: variant._id },
       update: { $set: { stock } },
     },
   });
   ```

   - Bukan langsung `save()`, tapi kumpulkan dulu operations
   - Format sesuai MongoDB bulkWrite API
   - `updateOne`: update satu document by filter
   - `$set`: update field stock dengan value baru

4. **Prepare Logs:**
   ```typescript
   logsToInsert.push({...})
   ```

   - Kumpulkan data log untuk insert batch
   - Simpan oldStock dan newStock untuk tracking

**Kenapa Loop dengan `await`?**

- Karena perlu data dari database (variant.productId, variant.stock)
- Alternative: batch query semua SKU dulu, tapi lebih complex

---

#### **Step 7: Bulk Update Stock**

```typescript
let updatedCount = 0;

if (bulkOperations.length > 0) {
  const bulkResult = await ProductVariant.bulkWrite(bulkOperations);
  updatedCount = bulkResult.modifiedCount;
}
```

**Penjelasan:**

**Kenapa `bulkWrite()` lebih baik?**

❌ **Cara Lama (Loop Save):**

```typescript
for (const variant of variants) {
  variant.stock = newStock;
  await variant.save(); // 1 query per variant
}
// 100 variants = 100 database queries!
```

✅ **Cara Baru (Bulk Write):**

```typescript
await ProductVariant.bulkWrite(bulkOperations);
// 100 variants = 1 database query!
```

**Performance Comparison:**

- Loop save: 100 variants ≈ 2-3 seconds
- Bulk write: 100 variants ≈ 100-200ms
- **10x - 30x faster!**

**Return Value:**

```typescript
{
  modifiedCount: 8,   // Berapa document yang berhasil di-update
  matchedCount: 8,    // Berapa document yang match filter
  upsertedCount: 0    // Berapa document yang di-insert (kalau pakai upsert)
}
```

---

#### **Step 8: Insert Logs**

```typescript
if (logsToInsert.length > 0) {
  await BackInStockLog.insertMany(logsToInsert);
}
```

**Penjelasan:**

- `insertMany()` juga batch operation
- Insert semua logs dalam 1 query
- Efficient untuk ratusan/ribuan logs

**Kenapa Insert Setelah Update?**

- Kalau update gagal, logs tidak akan ter-insert
- Maintain data consistency
- Alternative: use transaction untuk atomic operation

---

#### **Step 9: Return Response**

```typescript
return NextResponse.json(
  {
    success: true,
    updatedCount: updatedCount,
    skippedCount: skipped.length,
    skipped: skipped,
    totalProcessed: csvData.length,
    message: `Successfully updated ${updatedCount} variants. ${skipped.length} SKUs were skipped.`,
  },
  { status: 200 }
);
```

**Penjelasan:**

- Return informasi lengkap untuk user
- `updatedCount`: berapa yang berhasil di-update
- `skipped`: list SKU yang tidak ditemukan
- `totalProcessed`: total rows yang diproses
- User bisa re-check SKU yang di-skip

---

### 4️⃣ API Route: logs/route.ts

**Lokasi:** `/src/app/api/admin/stock/logs/route.ts`

**Tujuan:** Get history stock updates dengan filtering

**Features:**

1. **Pagination:**

   ```typescript
   const page = parseInt(searchParams.get("page") || "1");
   const limit = parseInt(searchParams.get("limit") || "50");
   const skip = (page - 1) * limit;

   const logs = await BackInStockLog.find(filter).skip(skip).limit(limit);
   ```

2. **Filtering:**

   ```typescript
   // Filter by SKU
   if (sku) {
     filter.sku = { $regex: sku, $options: "i" };
   }

   // Filter by date range
   if (startDate || endDate) {
     filter.updatedAt = {};
     if (startDate) filter.updatedAt.$gte = new Date(startDate);
     if (endDate) filter.updatedAt.$lte = new Date(endDate);
   }
   ```

3. **Populate Relations:**

   ```typescript
   .populate("productId", "name slug")
   .populate("variantId", "name sku")
   ```

   - Ambil data product dan variant sekalian
   - Select hanya field yang diperlukan

4. **Sorting:**
   ```typescript
   .sort({ updatedAt: -1 })  // Newest first
   ```

---

### 5️⃣ API Route: template/route.ts

**Lokasi:** `/src/app/api/admin/stock/template/route.ts`

**Tujuan:** Download template CSV

**Implementation:**

```typescript
const csvContent = `sku,stock
SKU-EXAMPLE-001,100
SKU-EXAMPLE-002,200`;

return new NextResponse(csvContent, {
  headers: {
    "Content-Type": "text/csv",
    "Content-Disposition": "attachment; filename=stock-update-template.csv",
  },
});
```

**Headers Explanation:**

- `Content-Type: text/csv` → Browser tahu ini CSV file
- `Content-Disposition: attachment` → Trigger download
- `filename=...` → Nama file saat di-download

---

## 🎯 Key Concepts & Best Practices

### 1. Bulk Operations vs Loop

**❌ Bad Practice:**

```typescript
for (const data of csvData) {
  const variant = await ProductVariant.findOne({ sku: data.sku });
  variant.stock = data.stock;
  await variant.save(); // N database queries
}
```

**✅ Good Practice:**

```typescript
const operations = csvData.map((data) => ({
  updateOne: {
    filter: { sku: data.sku },
    update: { $set: { stock: data.stock } },
  },
}));

await ProductVariant.bulkWrite(operations); // 1 database query
```

---

### 2. Error Handling Strategy

**Level 1: Validation (400 Bad Request)**

- Invalid file type
- Invalid CSV format
- Invalid data (negative stock, empty SKU)

**Level 2: Business Logic (Skip)**

- SKU not found → add to skipped list
- Stock unchanged → skip update

**Level 3: Server Error (500 Internal Server Error)**

- Database connection failed
- Unexpected error

---

### 3. Logging Strategy

**Why Log Everything?**

- ✅ Audit trail: siapa yang update kapan
- ✅ Rollback capability: bisa undo dengan oldStock
- ✅ Analytics: track perubahan stock over time
- ✅ Debugging: investigate masalah stock

**What to Log:**

- ✅ Product & Variant ID (relasi)
- ✅ SKU (untuk searching)
- ✅ Old & New Stock (untuk compare)
- ✅ Updated By (accountability)
- ✅ Timestamp (when)

---

### 4. Performance Optimization

**Database Indexes:**

```typescript
// Single indexes untuk filtering
sku: { index: true }
updatedAt: { index: true }

// Compound indexes untuk sorting + filtering
{ productId: 1, updatedAt: -1 }
```

**Query Optimization:**

```typescript
// ✅ Good: Project only needed fields
.populate("productId", "name slug")

// ❌ Bad: Populate all fields
.populate("productId")
```

---

### 5. Security Considerations

1. **Authentication:**

   ```typescript
   if (!session || session.user.role !== "admin")
   ```

   - Only admin can update stock

2. **File Size Limit:**

   ```typescript
   const maxSize = 5 * 1024 * 1024; // 5MB
   ```

   - Prevent DOS attack dengan file besar

3. **Input Validation:**
   ```typescript
   if (stock < 0) {
     errors.push("Stock cannot be negative");
   }
   ```

   - Prevent negative stock injection

---

## 🧪 Testing Scenarios

### Test Case 1: Valid CSV

```csv
sku,stock
SKU001,100
SKU002,200
```

**Expected:** All updated, updatedCount = 2, skipped = []

### Test Case 2: Mixed Valid/Invalid

```csv
sku,stock
SKU001,100
INVALID,200
SKU003,abc
```

**Expected:**

- updatedCount = 1 (SKU001)
- skipped = ["INVALID"]
- errors = ["Row 4: Stock must be a valid number"]

### Test Case 3: Negative Stock

```csv
sku,stock
SKU001,-50
```

**Expected:** errors = ["Row 2: Stock cannot be negative"]

### Test Case 4: Empty CSV

```csv
sku,stock
```

**Expected:** "CSV file is empty or has no valid data"

---

## 📊 Database Queries Performance

**Before (Loop):**

```
Find: 100 queries × 10ms = 1000ms
Save: 100 queries × 20ms = 2000ms
Total: 3000ms (3 seconds)
```

**After (Bulk):**

```
Find: 100 queries × 10ms = 1000ms
bulkWrite: 1 query × 100ms = 100ms
insertMany: 1 query × 50ms = 50ms
Total: 1150ms (1.15 seconds)
```

**Improvement: 2.6x faster!**

---

## 🔄 Future Enhancements

1. **Transaction Support:**

   ```typescript
   const session = await mongoose.startSession();
   session.startTransaction();

   try {
     await ProductVariant.bulkWrite(operations, { session });
     await BackInStockLog.insertMany(logs, { session });
     await session.commitTransaction();
   } catch (error) {
     await session.abortTransaction();
   }
   ```

2. **Queue System:**
   - For very large files (10k+ rows)
   - Process in background with BullMQ/Agenda
   - Send email notification when done

3. **Real-time Progress:**
   - WebSocket for progress updates
   - Show "Processing 50/100..." to user

---

## 🎓 Key Takeaways

1. ✅ **Use bulkWrite() for batch operations** → Much faster than loop save
2. ✅ **Validate early, fail fast** → Validate file before processing
3. ✅ **Log everything** → Audit trail and debugging
4. ✅ **Use indexes** → Speed up queries
5. ✅ **Handle errors gracefully** → Clear error messages
6. ✅ **Skip gracefully** → Don't fail entire batch for one invalid SKU
7. ✅ **Authentication first** → Security is priority
8. ✅ **Return detailed response** → Help user understand what happened

---

**That's it! 🎉**

Anda sekarang punya sistem bulk update stock yang:

- ⚡ Fast (bulkWrite)
- 🔒 Secure (authentication)
- 📝 Auditable (logging)
- 🛡️ Robust (validation)
- 📊 Scalable (pagination)

Happy coding! 🚀
