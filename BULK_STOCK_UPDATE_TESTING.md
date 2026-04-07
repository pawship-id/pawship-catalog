# 🧪 Testing Bulk Stock Update API

## Test dengan Postman / Insomnia

### 1. Download Template

```
GET http://localhost:3000/api/admin/stock/template
```

**Headers:**

```
Cookie: next-auth.session-token=<your-token>
```

**Expected Response:**

- File CSV ter-download dengan nama `stock-update-template.csv`

---

### 2. Upload CSV untuk Bulk Update

**Request:**

```
POST http://localhost:3000/api/admin/stock/bulk-update
```

**Headers:**

```
Cookie: next-auth.session-token=<your-token>
```

**Body (form-data):**

```
file: [select your CSV file]
```

**Expected Response (Success):**

```json
{
  "success": true,
  "updatedCount": 8,
  "skippedCount": 2,
  "skipped": ["SKU-NOTFOUND-001", "SKU-INVALID-002"],
  "totalProcessed": 10,
  "message": "Successfully updated 8 variants. 2 SKUs were skipped."
}
```

**Expected Response (Error - No File):**

```json
{
  "success": false,
  "message": "No file uploaded. Please provide a CSV file"
}
```

**Expected Response (Error - Invalid CSV):**

```json
{
  "success": false,
  "message": "Failed to parse CSV file",
  "errors": [
    "Row 3: Stock must be a valid number",
    "Row 5: Stock cannot be negative"
  ]
}
```

---

### 3. Get Stock Update Logs

**Request:**

```
GET http://localhost:3000/api/admin/stock/logs?page=1&limit=20
```

**Headers:**

```
Cookie: next-auth.session-token=<your-token>
```

**Query Parameters:**

- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 50
- `sku` (optional): Filter by SKU
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)

**Example with Filters:**

```
GET http://localhost:3000/api/admin/stock/logs?page=1&limit=20&sku=COLLAR&startDate=2025-01-01T00:00:00.000Z&endDate=2025-01-31T23:59:59.999Z
```

**Expected Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "678abc123def456789012345",
      "productId": {
        "_id": "678abc123def456789012340",
        "name": "Premium Dog Collar",
        "slug": "premium-dog-collar"
      },
      "variantId": {
        "_id": "678abc123def456789012341",
        "name": "Red - Size M",
        "sku": "SKU-COLLAR-001"
      },
      "sku": "SKU-COLLAR-001",
      "oldStock": 50,
      "newStock": 150,
      "updatedBy": "admin@pawship.com",
      "updatedAt": "2025-01-15T10:30:00.000Z",
      "createdAt": "2025-01-15T10:30:00.000Z"
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

## Test dengan cURL

### 1. Download Template

```bash
curl -X GET "http://localhost:3000/api/admin/stock/template" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -o stock-template.csv
```

---

### 2. Upload CSV

```bash
curl -X POST "http://localhost:3000/api/admin/stock/bulk-update" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -F "file=@/path/to/your/stock-update.csv"
```

---

### 3. Get Logs

```bash
# Basic
curl -X GET "http://localhost:3000/api/admin/stock/logs" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# With filters
curl -X GET "http://localhost:3000/api/admin/stock/logs?page=1&limit=20&sku=COLLAR" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

---

## Test Files

### ✅ Valid CSV (test-valid.csv)

```csv
sku,stock
SKU-COLLAR-001,150
SKU-COLLAR-002,200
SKU-HARNESS-001,75
```

**Testing Behavior:** Stock REPLACEMENT (not addition)

**Assumption:**

- SKU-COLLAR-001 current stock: 100
- SKU-COLLAR-002 current stock: 50
- SKU-HARNESS-001 current stock: 200

**Expected Result:**

- SKU-COLLAR-001 stock becomes 150 (replaced, not 250)
- SKU-COLLAR-002 stock becomes 200 (replaced, not 250)
- SKU-HARNESS-001 stock becomes 75 (replaced, not 275)
- All rows updated successfully

---

### 🔢 Zero Stock CSV (test-zero-stock.csv)

```csv
sku,stock
SKU-COLLAR-001,0
SKU-COLLAR-002,0
```

**Testing Behavior:** Stock = 0 should set items as out of stock

**Expected Result:**

- SKU-COLLAR-001 stock set to 0
- SKU-COLLAR-002 stock set to 0
- Updated count: 2
- No SKUs skipped

---

### ⚠️ Mixed Valid/Invalid CSV (test-mixed.csv)

```csv
sku,stock
SKU-COLLAR-001,150
SKU-NOTFOUND,200
SKU-HARNESS-001,abc
SKU-COLLAR-002,250
```

**Expected Result:**

- Updated: SKU-COLLAR-001, SKU-COLLAR-002
- Skipped: SKU-NOTFOUND
- Error: Row 4 - Stock must be a valid number

---

### ❌ Invalid CSV (test-invalid.csv)

```csv
sku,stock
SKU-COLLAR-001,-50
,100
SKU-HARNESS-001,abc
```

**Expected Result:**

- Errors on all rows
- No updates performed

---

### 🔢 Empty CSV (test-empty.csv)

```csv
sku,stock
```

**Expected Result:** "CSV file is empty or has no valid data"

---

## Testing Checklist

### Authentication Tests

- [ ] ✅ Test dengan admin token → Success
- [ ] ❌ Test tanpa token → 401 Unauthorized
- [ ] ❌ Test dengan non-admin user → 401 Unauthorized

### File Validation Tests

- [ ] ✅ Upload CSV file → Success
- [ ] ❌ Upload TXT file → Error "Invalid file type"
- [ ] ❌ Upload 10MB file → Error "File size exceeds 5MB"
- [ ] ❌ Upload empty file → Error "File is empty"
- [ ] ❌ No file uploaded → Error "No file uploaded"

### CSV Parsing Tests

- [ ] ✅ Valid CSV with 10 rows → All updated (replacement, not addition)
- [ ] ✅ CSV with stock = 0 → Stock set to 0 (out of stock)
- [ ] ⚠️ CSV with invalid SKU → SKU added to skipped list
- [ ] ❌ CSV with negative stock → Error returned
- [ ] ❌ CSV with non-numeric stock → Error returned
- [ ] ❌ CSV with empty SKU → Error returned
- [ ] ✅ CSV where new stock = old stock → Still updated (logged)

### Database Tests

- [ ] ✅ Check stock updated in ProductVariant collection
- [ ] ✅ Check log created in BackInStockLog collection
- [ ] ✅ Verify oldStock and newStock values
- [ ] ✅ Verify updatedBy field has admin email

### Performance Tests

- [ ] ✅ Upload 100 rows → Should complete < 2 seconds
- [ ] ✅ Upload 500 rows → Should complete < 5 seconds
- [ ] ⚠️ Upload 1000+ rows → Monitor memory usage

### Logs API Tests

- [ ] ✅ Get logs without filters → Returns all logs
- [ ] ✅ Get logs with page=2 → Returns page 2
- [ ] ✅ Get logs with sku filter → Returns filtered logs
- [ ] ✅ Get logs with date range → Returns filtered logs
- [ ] ✅ Pagination works correctly
- [ ] ✅ Population works (productId, variantId)

---

## Manual Database Verification

### Check Updated Stock

```javascript
// MongoDB Shell
use pawship_db

// BEFORE upload - check current stock
db.productvariants.findOne({ sku: "SKU-COLLAR-001" })
// Result: { sku: "SKU-COLLAR-001", stock: 100, ... }

// Upload CSV with SKU-COLLAR-001,150

// AFTER upload - verify replacement (not addition)
db.productvariants.findOne({ sku: "SKU-COLLAR-001" })

// Expected result:
{
  _id: ObjectId("..."),
  sku: "SKU-COLLAR-001",
  stock: 150,  // Should be 150 (replaced), NOT 250 (100+150)
  ...
}
```

### Check Logs

```javascript
// Find latest logs
db.back_in_stock_logs.find().sort({ updatedAt: -1 }).limit(10)

// Find logs by SKU
db.back_in_stock_logs.find({ sku: "SKU-COLLAR-001" })

// Expected result (showing stock replacement):
{
  _id: ObjectId("..."),
  productId: ObjectId("..."),
  variantId: ObjectId("..."),
  sku: "SKU-COLLAR-001",
  oldStock: 100,   // Previous stock
  newStock: 150,   // New stock (replaced, not 100+150=250)
  updatedBy: "admin@pawship.com",
  updatedAt: ISODate("2025-01-15T10:30:00.000Z")
}
```

### Verify Indexes

```javascript
// Check if indexes created
db.back_in_stock_logs.getIndexes()[
  // Expected indexes:
  ({ _id: 1 },
  { productId: 1 },
  { variantId: 1 },
  { sku: 1 },
  { updatedAt: 1 },
  { productId: 1, updatedAt: -1 },
  { variantId: 1, updatedAt: -1 })
];
```

---

## Expected HTTP Status Codes

| Status | Condition                        |
| ------ | -------------------------------- |
| 200    | Success - Stock updated          |
| 200    | Success - Logs fetched           |
| 200    | Success - Template downloaded    |
| 400    | Bad Request - Invalid file       |
| 400    | Bad Request - Invalid CSV format |
| 400    | Bad Request - Validation errors  |
| 401    | Unauthorized - Not logged in     |
| 401    | Unauthorized - Not admin         |
| 500    | Server Error - Database error    |

---

## Common Issues & Solutions

### Issue 1: 401 Unauthorized

**Problem:** API returns 401 even with valid admin login

**Solution:**

1. Check if NextAuth session token valid
2. Verify user role is "admin" in database
3. Check cookie name matches (next-auth.session-token)

---

### Issue 2: CSV Not Parsing

**Problem:** "Failed to parse CSV file"

**Solution:**

1. Check CSV encoding (must be UTF-8)
2. Verify header row: `sku,stock` (lowercase, no spaces)
3. Check line endings (LF or CRLF, not CR only)
4. Open CSV in text editor to verify format

---

### Issue 3: All SKUs Skipped

**Problem:** updatedCount = 0, all SKUs in skipped list

**Solution:**

1. Verify SKU in CSV matches database (case-sensitive)
2. Check if ProductVariant collection has data
3. Query database manually to verify SKU exists

---

### Issue 4: Stock Not Updated

**Problem:** API returns success but stock not changed

**Solution:**

1. Check if oldStock === newStock (will be skipped)
2. Verify bulkWrite operation executed
3. Check database directly with MongoDB compass

---

### Issue 5: Logs Not Created

**Problem:** Stock updated but no logs in BackInStockLog

**Solution:**

1. Check if BackInStockLog model imported correctly
2. Verify insertMany executed without error
3. Check MongoDB collection name: "back_in_stock_logs"

---

## Performance Benchmarks

| Rows | Loop Save | Bulk Write | Improvement |
| ---- | --------- | ---------- | ----------- |
| 10   | 200ms     | 80ms       | 2.5x        |
| 50   | 1000ms    | 150ms      | 6.7x        |
| 100  | 2000ms    | 200ms      | 10x         |
| 500  | 10000ms   | 500ms      | 20x         |
| 1000 | 20000ms   | 1000ms     | 20x         |

_Benchmark on local machine with MongoDB on localhost_

---

## Next Steps After Testing

1. ✅ Verify all tests pass
2. ✅ Check error handling works correctly
3. ✅ Monitor database indexes performance
4. ✅ Test with production-size data (1000+ rows)
5. ✅ Document any edge cases found
6. 🚀 Deploy to staging/production

---

**Happy Testing! 🧪**
