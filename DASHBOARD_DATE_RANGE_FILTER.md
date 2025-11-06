# Dashboard Custom Date Range Filter - Documentation

## Overview

Fitur baru untuk filter order berdasarkan rentang tanggal kustom (dari tanggal X sampai tanggal Y) dengan menampilkan total pendapatan dari periode tersebut.

## Features

### 1. **Custom Date Range Picker**

Pengguna dapat memilih rentang tanggal secara bebas untuk melihat statistik dalam periode tertentu.

#### UI Components:

- **Quick Filter Dropdown**: Dropdown dengan pilihan preset (All Time, Today, This Week, This Month, This Year, Custom Range)
- **Date Range Picker**: Muncul ketika "Custom Range" dipilih, menampilkan 2 bulan kalender side-by-side
- **Clear Button**: Tombol X untuk clear custom date range dan kembali ke "All Time"
- **Summary Banner**: Card khusus yang muncul ketika custom date range aktif, menampilkan ringkasan pendapatan

### 2. **Revenue Summary by Date Range**

Menampilkan total pendapatan dan jumlah order dalam rentang tanggal yang dipilih.

#### Display Elements:

- **Date Range Info**: Menampilkan "from [date] to [date]" dalam format yang mudah dibaca
- **Total Revenue**: Angka besar dengan format currency IDR
- **Total Orders Count**: Jumlah order dalam periode tersebut
- **Visual Banner**: Card gradient berwarna biru-purple-pink untuk highlight

## User Flow

### Selecting Custom Date Range:

1. User membuka dashboard
2. User klik dropdown filter (default: "All Time")
3. User pilih "Custom Range"
4. Date range picker muncul dengan 2 kalender
5. User klik tanggal awal (from date)
6. User klik tanggal akhir (to date)
7. Kalender otomatis close dan data ter-refresh
8. Summary banner muncul dengan info pendapatan

### Clearing Custom Date Range:

1. User klik tombol X di sebelah date range picker
2. Custom range di-clear
3. Filter kembali ke "All Time"
4. Summary banner hilang
5. Data dashboard refresh dengan all time data

## Technical Implementation

### Frontend (Dashboard Page)

#### New State Management:

```typescript
const [dateFilter, setDateFilter] = useState("all");
// Values: "all" | "today" | "week" | "month" | "year" | "custom"

const [dateRange, setDateRange] = useState<{
  from: Date | undefined;
  to: Date | undefined;
}>({
  from: undefined,
  to: undefined,
});
```

#### API Call with Custom Range:

```typescript
let url = `/api/admin/dashboard/stats?filter=${dateFilter}`;

if (dateFilter === "custom" && dateRange.from && dateRange.to) {
  url += `&from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`;
}
```

#### Date Range Selection Handler:

```typescript
const handleDateRangeSelect = (range: {
  from: Date | undefined;
  to: Date | undefined;
}) => {
  setDateRange(range);
  if (range.from && range.to) {
    setDateFilter("custom");
  }
};
```

#### Clear Handler:

```typescript
const clearCustomDateRange = () => {
  setDateRange({ from: undefined, to: undefined });
  setDateFilter("all");
};
```

### Backend (API Endpoint)

#### Query Parameters:

- `filter`: string - Type of filter (all, today, week, month, year, custom)
- `from`: string (ISO date) - Start date for custom range (required if filter=custom)
- `to`: string (ISO date) - End date for custom range (required if filter=custom)

#### Date Filter Logic:

```typescript
if (filter === "custom" && fromParam && toParam) {
  // Custom date range
  dateFilter = {
    $gte: new Date(fromParam), // Greater than or equal to start date
    $lte: new Date(toParam), // Less than or equal to end date
  };
}
```

#### MongoDB Query:

```typescript
const orderQuery: any = {};
if (dateFilter) {
  orderQuery.createdAt = dateFilter;
}

const orders = await Order.find(orderQuery).select("status totalAmount");
```

## UI Components

### 1. Date Range Picker Popover

**Component**: `Calendar` from shadcn/ui
**Mode**: `range` - Allows selecting start and end dates
**Number of Months**: 2 - Shows 2 months side-by-side

```tsx
<Calendar
  initialFocus
  mode="range"
  defaultMonth={dateRange.from}
  selected={{ from: dateRange.from, to: dateRange.to }}
  onSelect={(range: any) =>
    handleDateRangeSelect(range || { from: undefined, to: undefined })
  }
  numberOfMonths={2}
/>
```

### 2. Custom Range Summary Banner

**Visibility**: Only shown when `dateFilter === "custom"` and both dates are selected

**Layout**:

- Gradient background (blue → purple → pink)
- Left side: Calendar icon + date range text
- Right side: Revenue amount + order count

```tsx
<Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-blue-200">
  {/* Calendar icon + Date range info */}
  {/* Revenue + Order count */}
</Card>
```

### 3. Date Range Display Button

**Component**: `Button` with `Popover`
**Width**: 300px (desktop), full width (mobile)
**Format**: "LLL dd, y - LLL dd, y" (e.g., "Jan 01, 2025 - Jan 31, 2025")

## Date Formatting

Using `date-fns` library for date formatting:

```typescript
import { format } from "date-fns";

// In date picker button
format(dateRange.from, "LLL dd, y"); // Jan 01, 2025

// In summary banner
format(dateRange.from, "MMMM dd, yyyy"); // January 01, 2025
```

## Responsive Design

### Mobile (< 640px):

- Filter controls stack vertically
- Date range picker full width
- Summary banner: content stacks vertically
- Calendar shows 1 month instead of 2 (optional enhancement)

### Tablet (640px - 1023px):

- Filter controls in a row
- Date range picker 300px width
- Summary banner: horizontal layout maintained

### Desktop (≥ 1024px):

- All controls in a row
- Full horizontal layout
- 2-month calendar view

## Validation & Edge Cases

### 1. **Incomplete Date Range**

- If only `from` is selected: Show single date, don't trigger API call
- If only `to` is selected: Don't trigger API call
- Both dates required for API call

### 2. **Date Order**

- Calendar component automatically handles date order
- `from` is always ≤ `to`
- No manual validation needed

### 3. **Future Dates**

- Calendar allows selecting future dates
- API will return 0 results for future dates (no orders exist)
- Consider adding `maxDate={new Date()}` to Calendar to prevent future selection

### 4. **Large Date Ranges**

- No limit on date range size
- Performance consideration: Very large ranges (e.g., multiple years) may slow down query
- Consider adding warning or pagination for very large ranges

## Error Handling

### API Error:

```typescript
try {
  fetchDashboardStats();
} catch (error) {
  showErrorAlert("Error", error.message || "Failed to fetch dashboard stats");
}
```

### Invalid Date Format:

- API validates date strings with `new Date()`
- Invalid dates result in `Invalid Date` error
- Frontend always sends ISO strings to prevent issues

## Performance Considerations

### 1. **Database Query Optimization**

- Index on `Order.createdAt` field recommended
- Query with date range uses indexed field
- Projection limits fields: `select("status totalAmount")`

### 2. **API Caching**

- Consider implementing Redis cache for frequently accessed date ranges
- Cache key: `dashboard:stats:${filter}:${from}:${to}`
- TTL: 5-10 minutes

### 3. **Frontend Optimization**

- useEffect with dependencies: `[dateFilter, dateRange]`
- Only refetch when filters change
- Loading state prevents multiple simultaneous requests

## Future Enhancements

### 1. **Date Range Presets**

Add more preset options:

- Yesterday
- Last 7 days
- Last 30 days
- Last 90 days
- This quarter
- Last quarter
- Year to date

### 2. **Date Range Comparison**

Compare two date ranges:

- Current period vs previous period
- Show percentage change
- Visual indicators (up/down arrows)

### 3. **Export Data**

Export filtered data:

- CSV export with date range
- PDF report
- Email scheduled reports

### 4. **Visual Charts**

Add charts for custom date range:

- Line chart: Revenue over time
- Bar chart: Orders by day
- Pie chart: Orders by status

### 5. **Date Range Shortcuts**

Quick select buttons:

- "Last 7 days"
- "Last 30 days"
- "This month"
- "Last month"

### 6. **Max Date Restriction**

Prevent future date selection:

```tsx
<Calendar
  maxDate={new Date()}
  // ... other props
/>
```

### 7. **Time Selection**

Add time picker for more precise filtering:

- Start time: 00:00:00
- End time: 23:59:59

## Testing Checklist

- [ ] Select custom range with both dates
- [ ] Select only start date (should not trigger API)
- [ ] Select only end date (should not trigger API)
- [ ] Clear custom range with X button
- [ ] Switch from custom to preset filter
- [ ] Switch from preset to custom filter
- [ ] Test with same start and end date
- [ ] Test with 1-day range
- [ ] Test with 1-month range
- [ ] Test with 1-year range
- [ ] Test with multiple years range
- [ ] Test with future dates
- [ ] Test on mobile device (responsive)
- [ ] Test on tablet device
- [ ] Test on desktop
- [ ] Test with no orders in date range
- [ ] Test with many orders in date range
- [ ] Test API error handling
- [ ] Test loading state
- [ ] Verify revenue calculation is correct
- [ ] Verify order count is correct
- [ ] Verify date format in summary banner
- [ ] Verify date format in picker button

## Files Modified/Created

### Created:

1. `/src/components/ui/calendar.tsx` - Calendar component from shadcn/ui
2. `/src/components/ui/popover.tsx` - Popover component from shadcn/ui
3. `/DASHBOARD_DATE_RANGE_FILTER.md` - This documentation

### Modified:

1. `/src/app/(admin)/dashboard/page.tsx` - Added custom date range picker UI
2. `/src/app/api/admin/dashboard/stats/route.ts` - Added custom date range API logic

## Dependencies

### New Dependencies:

- `react-day-picker` - Calendar component
- `@radix-ui/react-popover` - Popover primitive
- `date-fns` - Date formatting (already existed)

### Installation:

```bash
npm install @radix-ui/react-popover react-day-picker
```

## API Reference

### GET `/api/admin/dashboard/stats`

#### Query Parameters:

| Parameter | Type              | Required    | Description                                                                     |
| --------- | ----------------- | ----------- | ------------------------------------------------------------------------------- |
| filter    | string            | No          | Filter type: "all", "today", "week", "month", "year", "custom" (default: "all") |
| from      | string (ISO date) | Conditional | Start date (required if filter="custom")                                        |
| to        | string (ISO date) | Conditional | End date (required if filter="custom")                                          |

#### Example Requests:

**Preset Filter:**

```
GET /api/admin/dashboard/stats?filter=month
```

**Custom Range:**

```
GET /api/admin/dashboard/stats?filter=custom&from=2025-01-01T00:00:00.000Z&to=2025-01-31T23:59:59.999Z
```

#### Response:

```json
{
  "success": true,
  "data": {
    "totalProducts": 150,
    "totalRevenue": 50000000,
    "totalOrders": 75,
    "ordersByStatus": {
      "pending_confirmation": 5,
      "paid": 20,
      "processing": 15,
      "shipped": 35
    }
  }
}
```

## Revenue Calculation

Revenue dihitung dari order dengan status:

- `paid`
- `processing`
- `shipped`

Orders dengan status `pending_confirmation` tidak dihitung dalam revenue (belum confirmed).

```typescript
const totalRevenue = orders
  .filter(
    (order) =>
      order.status === "paid" ||
      order.status === "processing" ||
      order.status === "shipped"
  )
  .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
```

## Summary

Fitur custom date range filter memberikan fleksibilitas kepada admin untuk:

1. ✅ Memilih rentang tanggal secara bebas
2. ✅ Melihat pendapatan dalam periode tertentu
3. ✅ Membandingkan performa di berbagai periode
4. ✅ Menganalisis trend dengan date range yang spesifik
5. ✅ Export data untuk periode tertentu (future)

Fitur ini meningkatkan kemampuan analitik dashboard dan memberikan kontrol lebih kepada admin untuk monitoring performa toko.
