# 📊 Stock Management - Admin Panel Documentation

## Overview

Halaman **Stock Management** di admin panel untuk melakukan bulk update stock produk via Excel upload dan melihat history perubahan stock.

**Important:** Stock values in the uploaded file will **REPLACE** existing stock, not add to it. This is for setting absolute inventory counts.

---

## 🌐 URL Access

```
/dashboard/stock
```

**Authentication Required:** Yes (Admin only)

---

## 📋 Features

### 1. Bulk Upload Stock

- ✅ Upload Excel file untuk set/replace stock
- ✅ Stock values replace current stock (not addition)
- ✅ Can set stock to 0 (out of stock)
- ✅ Drag & drop file support
- ✅ File validation (type, size)
- ✅ Real-time upload progress
- ✅ Detailed upload result
- ✅ SKU skip handling

### 2. Stock Update Logs

- ✅ View all stock update history
- ✅ Search by SKU
- ✅ Pagination (20 items per page)
- ✅ Show old stock, new stock, and difference
- ✅ Color-coded stock changes (green = increase, red = decrease)
- ✅ Display admin who made the update
- ✅ Timestamp for each update

### 3. CSV Template Download

- ✅ One-click download template
- ✅ Pre-formatted with correct headers
- ✅ Example data included

---

## 🎨 UI Components

### Main Page Structure

```
┌─────────────────────────────────────────────────────┐
│  Stock Management             [Download Template]    │
│  Bulk update product stock via CSV upload            │
├─────────────────────────────────────────────────────┤
│  ℹ️ Info Alert: How it works                         │
├─────────────────────────────────────────────────────┤
│  [Bulk Upload] [Update Logs]  ← Tabs                │
├─────────────────────────────────────────────────────┤
│  Tab Content:                                        │
│  - Bulk Upload: Upload form + Guidelines            │
│  - Update Logs: Table with search & pagination      │
└─────────────────────────────────────────────────────┘
```

---

## 📤 Bulk Upload Tab

### Components

#### 1. Upload Card

```typescript
<BulkUploadStock />
```

**Features:**

- File input (drag & drop or click)
- File validation (CSV only, max 5MB)
- Preview selected file (name, size)
- Remove file button
- Upload button with loading state
- Upload progress indicator
- Result summary (updated count, skipped count)
- List of skipped SKUs

**File Validation:**

```typescript
// ✅ Valid
filename.csv (< 5MB)

// ❌ Invalid
filename.txt         → "Please select a CSV file"
large-file.csv (> 5MB) → "Maximum file size is 5MB"
```

#### 2. Guidelines Card

Displays comprehensive guidelines for CSV format:

**📋 Required Format**

```csv
sku,stock
SKU-COLLAR-001,150
SKU-HARNESS-002,200
```

**✅ Requirements:**

- Header row must be exactly: `sku,stock`
- SKU must match database (case-sensitive)
- Stock must be valid number (≥ 0)
- CSV format (.csv extension)
- Max file size: 5MB
- UTF-8 encoding

**⚠️ Important Notes:**

- SKUs not found will be skipped
- Negative stock not allowed
- All updates are logged
- Changes are immediate

**🎯 Best Practices:**

- Download template first
- Test with small batch (5-10 rows)
- Verify SKUs before upload
- Keep backup of CSV file
- Check logs after upload

---

## 📊 Update Logs Tab

### Components

#### 1. Stock Logs Table

```typescript
<StockLogsTable />
```

**Features:**

- Search by SKU (case-insensitive)
- Real-time search
- Clear search button
- Refresh button
- Pagination controls
- Responsive table layout

**Table Columns:**
| Column | Description | Example |
|--------|-------------|---------|
| SKU | Product SKU (Badge) | `SKU-COLLAR-001` |
| Product | Product name (truncated) | `Premium Dog Collar` |
| Variant | Variant name (truncated) | `Red - Size M` |
| Old Stock | Stock before update (Badge) | `50` |
| New Stock | Stock after update (Badge) | `150` |
| Change | Stock difference (colored) | `+100` (green) |
| Updated By | Admin email/name | `admin@pawship.com` |
| Date | Update timestamp | `Jan 15, 2025 10:30:00` |

**Stock Change Colors:**

- 🟢 Green: Stock increased (`+100`)
- 🔴 Red: Stock decreased (`-50`)
- ⚫ Gray: No change (`0`)

**Pagination:**

- Previous/Next buttons
- Page numbers (smart display)
- Show first, last, current, and adjacent pages
- Hide middle pages with "..." if many pages
- Disable buttons when at start/end

**Example Pagination:**

```
[< Previous] [1] [2] [3] ... [10] [Next >]
             ↑ current page
```

---

## 🔄 User Flow

### Flow 1: Bulk Upload Stock

```
1. Admin navigates to /dashboard/stock
   ↓
2. Click "Bulk Upload" tab (default)
   ↓
3. Download template (optional but recommended)
   ↓
4. Fill CSV with SKU and stock data
   ↓
5. Click "Select File" or drag & drop CSV
   ↓
6. File is validated (type, size)
   ↓
7. Click "Upload & Update Stock" button
   ↓
8. Confirmation dialog appears
   ↓
9. Admin confirms upload
   ↓
10. Progress indicator shows
    ↓
11. API processes CSV:
    - Parse CSV
    - Validate each row
    - Find matching variants
    - Bulk update stock
    - Create logs
    ↓
12. Result displayed:
    - ✅ Updated count
    - ⚠️ Skipped count
    - 📋 List of skipped SKUs
    ↓
13. Success alert shown
    ↓
14. File input cleared
    ↓
15. Admin can switch to "Update Logs" tab to verify
```

### Flow 2: View Stock Logs

```
1. Admin clicks "Update Logs" tab
   ↓
2. Table loads with recent 20 logs
   ↓
3. Admin can:
   a) Search by SKU
   b) Navigate pages
   c) Refresh data
   ↓
4. Search by SKU:
   - Type SKU in search box
   - Press Enter or click Search
   - Table filters to matching logs
   - Click Clear to reset
   ↓
5. Navigate pages:
   - Click page number
   - Or Previous/Next buttons
   - Table updates with new page data
```

---

## 🎯 Component Breakdown

### 1. Main Page (`/dashboard/stock/page.tsx`)

**State Management:**

```typescript
const [activeTab, setActiveTab] = useState("upload");
```

**Key Functions:**

```typescript
handleDownloadTemplate() {
  window.open("/api/admin/stock/template", "_blank")
}
```

**Components Used:**

- `<BulkUploadStock />` - Upload form
- `<StockLogsTable />` - Logs table
- `<Tabs />` - Tab navigation
- `<Alert />` - Info message
- `<Card />` - Guidelines

---

### 2. Bulk Upload Component

**File:** `/components/admin/stock/bulk-upload-stock.tsx`

**State Management:**

```typescript
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [uploading, setUploading] = useState(false);
const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
```

**Key Functions:**

#### `handleFileSelect(event)`

```typescript
// Validate file type (must be .csv)
// Validate file size (max 5MB)
// Set selected file to state
```

#### `handleRemoveFile()`

```typescript
// Clear selected file
// Clear upload result
// Reset file input
```

#### `handleUpload()`

```typescript
// Show confirmation dialog
// Create FormData with file
// POST to /api/admin/stock/bulk-update
// Handle response:
// - Success: Show result, clear file
// - Error: Show error message
// Update uploading state
```

**Validation Logic:**

```typescript
// File type
if (!file.name.endsWith(".csv")) {
  showErrorAlert("Invalid File", "Please select a CSV file");
  return;
}

// File size
if (file.size > 5 * 1024 * 1024) {
  showErrorAlert("File Too Large", "Maximum file size is 5MB");
  return;
}
```

**Upload Result Display:**

```typescript
interface UploadResult {
  success: boolean;
  updatedCount: number; // Berapa yang berhasil
  skippedCount: number; // Berapa yang di-skip
  skipped: string[]; // List SKU yang di-skip
  totalProcessed: number; // Total row yang diproses
  message: string; // Success message
}
```

---

### 3. Stock Logs Table Component

**File:** `/components/admin/stock/stock-logs-table.tsx`

**State Management:**

```typescript
const [logs, setLogs] = useState<StockLog[]>([])
const [loading, setLoading] = useState(true)
const [pagination, setPagination] = useState<Pagination>({...})
const [searchSKU, setSearchSKU] = useState("")
const [searchInput, setSearchInput] = useState("")
```

**Key Functions:**

#### `fetchLogs()`

```typescript
// Build query params (page, limit, sku)
// GET from /api/admin/stock/logs
// Update logs and pagination state
```

#### `handleSearch()`

```typescript
// Set searchSKU from searchInput
// Reset to page 1
// Trigger fetchLogs via useEffect
```

#### `handleClearSearch()`

```typescript
// Clear search input and SKU
// Reset to page 1
// Fetch all logs
```

#### `handlePageChange(newPage)`

```typescript
// Update pagination.page
// Trigger fetchLogs via useEffect
```

#### `getStockChangeColor(oldStock, newStock)`

```typescript
// Return color class based on change:
// - Green: newStock > oldStock
// - Red: newStock < oldStock
// - Gray: no change
```

#### `getStockDifference(oldStock, newStock)`

```typescript
// Calculate difference
// Format with + sign if positive
// Return as string (e.g., "+100", "-50", "0")
```

**Pagination Logic:**

```typescript
// Smart page number display
// Show: first, last, current, adjacent pages
// Hide middle pages with "..."

Example:
- If totalPages = 10, currentPage = 5:
  [1] ... [4] [5] [6] ... [10]

- If totalPages = 3, currentPage = 2:
  [1] [2] [3]
```

---

## 🎨 Styling & UI Details

### Colors & Badges

**Stock Badges:**

```tsx
<Badge variant="secondary">{log.oldStock}</Badge>  // Old stock
<Badge variant="default">{log.newStock}</Badge>    // New stock
```

**SKU Badge:**

```tsx
<Badge variant="outline">{log.sku}</Badge>
```

**Change Color:**

```tsx
// Increase (green)
className = "font-semibold text-green-600";

// Decrease (red)
className = "font-semibold text-red-600";

// No change (gray)
className = "font-semibold text-gray-600";
```

**Alert Variants:**

```tsx
// Success
<Alert variant="default">
  <CheckCircle className="h-4 w-4" />
</Alert>

// Error
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
</Alert>
```

### Icons Usage

| Icon               | Usage              | Component       |
| ------------------ | ------------------ | --------------- |
| `<Upload />`       | Bulk upload action | BulkUploadStock |
| `<Download />`     | Download template  | Main page       |
| `<History />`      | Update logs tab    | Main page       |
| `<FileText />`     | Guidelines         | Main page       |
| `<FileUp />`       | File upload area   | BulkUploadStock |
| `<Search />`       | Search input       | StockLogsTable  |
| `<RefreshCw />`    | Refresh button     | StockLogsTable  |
| `<Calendar />`     | Logs header        | StockLogsTable  |
| `<ChevronLeft />`  | Previous page      | StockLogsTable  |
| `<ChevronRight />` | Next page          | StockLogsTable  |
| `<CheckCircle />`  | Success indicator  | Various         |
| `<AlertCircle />`  | Warning/error      | Various         |
| `<X />`            | Remove file        | BulkUploadStock |

---

## 🔔 Alerts & Notifications

### SweetAlert2 Usage

```typescript
// Confirmation
const confirm = await showConfirmAlert(
  "Upload CSV",
  "Are you sure you want to upload this file?",
);

// Success
showSuccessAlert("Success!", "Stock updated successfully");

// Error
showErrorAlert("Error", "Failed to upload file");
```

### In-Page Alerts

```tsx
// Info Alert (top of page)
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>
    How it works: Upload CSV file...
  </AlertDescription>
</Alert>

// Upload Result Alert
<Alert variant="default">
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Upload Complete</AlertTitle>
  <AlertDescription>
    // Badges with counts
    // Skipped SKU list
  </AlertDescription>
</Alert>
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile: default */
/* Tablet: md (768px) */
/* Desktop: lg (1024px) */
```

### Responsive Features

**Search Bar:**

```tsx
// Mobile: Full width
// Desktop: Flex with buttons
<div className="flex gap-2">
  <div className="relative flex-1">...</div>
  <Button>Search</Button>
</div>
```

**Table:**

```tsx
// Scroll horizontal on mobile
<div className="border rounded-lg overflow-x-auto">
  <Table>...</Table>
</div>
```

**Cards:**

```tsx
// Stack on mobile
// Side-by-side on desktop
<div className="space-y-6">
  <Card>...</Card>
  <Card>...</Card>
</div>
```

---

## ⚡ Performance Considerations

### 1. Pagination

- Load only 20 items per page (configurable)
- Reduce initial load time
- Better user experience

### 2. Search Debouncing

- Could add debounce on search input
- Reduce API calls

### 3. Loading States

```tsx
{
  loading ? <LoadingTable text="Loading stock logs" /> : <Table>...</Table>;
}
```

### 4. Optimistic Updates

- Show upload progress immediately
- Don't wait for server response to show UI feedback

---

## 🐛 Error Handling

### Client-Side Validation

```typescript
// File type
if (!file.name.endsWith(".csv")) {
  showErrorAlert("Invalid File", "Please select a CSV file");
  return;
}

// File size
if (file.size > 5 * 1024 * 1024) {
  showErrorAlert("File Too Large", "Maximum file size is 5MB");
  return;
}

// No file selected
if (!selectedFile) {
  showErrorAlert("No File", "Please select a CSV file first");
  return;
}
```

### API Error Handling

```typescript
try {
  const response = await fetch("/api/admin/stock/bulk-update", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (result.success) {
    // Handle success
  } else {
    // Show errors from API
    if (result.errors && result.errors.length > 0) {
      const errorList = result.errors.join("\n");
      showErrorAlert("Upload Failed", errorList);
    }
  }
} catch (error: any) {
  showErrorAlert("Error", error.message || "Failed to upload file");
}
```

---

## 🧪 Testing Checklist

### Upload Functionality

- [ ] ✅ Can select CSV file via click
- [ ] ✅ Can drag & drop CSV file
- [ ] ❌ Cannot select non-CSV file
- [ ] ❌ Cannot select file > 5MB
- [ ] ✅ Can remove selected file
- [ ] ✅ Upload button disabled without file
- [ ] ✅ Confirmation dialog shows before upload
- [ ] ✅ Progress indicator displays during upload
- [ ] ✅ Success result shows updated count
- [ ] ✅ Skipped SKUs displayed correctly
- [ ] ✅ File cleared after successful upload

### Logs Functionality

- [ ] ✅ Logs load on page load
- [ ] ✅ Search by SKU works
- [ ] ✅ Clear search resets filter
- [ ] ✅ Refresh button reloads data
- [ ] ✅ Pagination works correctly
- [ ] ✅ Page numbers displayed properly
- [ ] ✅ Previous/Next buttons work
- [ ] ✅ Stock changes color-coded correctly
- [ ] ✅ Timestamps formatted correctly
- [ ] ✅ Empty state shows when no logs

### Template Download

- [ ] ✅ Download button works
- [ ] ✅ Template file downloads correctly
- [ ] ✅ Template has correct format

---

## 🚀 Future Enhancements

### Planned Features

1. **Export Logs to CSV**
   - Button to download logs as CSV
   - Filter by date range
   - Include all columns

2. **Real-time Updates**
   - WebSocket for live progress
   - Show "Processing X/Y rows"
   - Estimated time remaining

3. **Bulk Rollback**
   - Undo last upload
   - Restore previous stock values
   - Requires upload session ID

4. **Date Range Filter**
   - Date picker for logs
   - Filter by date range
   - Show stats for period

5. **Charts & Analytics**
   - Stock change trends
   - Most updated products
   - Update frequency graph

6. **Batch Operations**
   - Select multiple logs
   - Bulk actions (export, delete)

7. **Validation Preview**
   - Show CSV preview before upload
   - Highlight invalid rows
   - Allow row-by-row correction

---

## 📚 Related Documentation

- **API Documentation:** `/BULK_STOCK_UPDATE_API.md`
- **Code Explanation:** `/BULK_STOCK_UPDATE_EXPLANATION.md`
- **Testing Guide:** `/BULK_STOCK_UPDATE_TESTING.md`

---

**Last Updated:** January 2025  
**Version:** 1.0.0
