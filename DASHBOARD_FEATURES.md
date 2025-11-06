# Dashboard Features Documentation

## Overview

Dashboard admin yang telah diperbarui dengan fitur analitik dan statistik lengkap untuk monitoring toko online Pawship.

## Features

### 1. **Total Revenue with Date Filter**

- Menampilkan total pendapatan dari semua order dengan status: `paid`, `processing`, dan `shipped`
- Filter berdasarkan periode waktu:
  - **All Time**: Semua data sejak awal
  - **Today**: Data hari ini (00:00:00 hingga sekarang)
  - **This Week**: 7 hari terakhir
  - **This Month**: 30 hari terakhir
  - **This Year**: 365 hari terakhir
- Format: IDR (Indonesian Rupiah)
- Klik card untuk navigate ke halaman orders

### 2. **Orders Summary by Status**

Menampilkan jumlah order berdasarkan status:

- **Pending Confirmation** (Yellow)
  - Icon: Clock
  - Status order yang menunggu konfirmasi
- **Paid** (Blue)
  - Icon: CheckCircle
  - Status order yang sudah dibayar
- **Processing** (Orange)
  - Icon: CreditCard
  - Status order yang sedang diproses
- **Shipped** (Green)
  - Icon: Truck
  - Status order yang sudah dikirim

Setiap card dapat diklik untuk navigate ke halaman orders dengan filter status yang sesuai.

### 3. **Total Products**

- Menampilkan jumlah total produk dengan status `active`
- Klik card untuk navigate ke halaman products
- Icon: Package

### 4. **Quick Actions**

Panel dengan tombol akses cepat ke fitur-fitur penting:

- **Add Product**: Navigate ke halaman create product
- **View Orders**: Navigate ke halaman orders
- **Manage Stock**: Navigate ke halaman stock management
- **Categories**: Navigate ke halaman categories

## Technical Details

### API Endpoint

**GET** `/api/admin/dashboard/stats`

#### Query Parameters

- `filter`: string (optional)
  - Values: `all`, `today`, `week`, `month`, `year`
  - Default: `all`

#### Response Format

```typescript
{
  success: boolean;
  data: {
    totalProducts: number;
    totalRevenue: number;
    totalOrders: number;
    ordersByStatus: {
      pending_confirmation: number;
      paid: number;
      processing: number;
      shipped: number;
    }
  }
}
```

#### Authentication

- Requires admin session (NextAuth)
- Returns 401 if unauthorized

### Date Filter Logic

```typescript
switch (filter) {
  case "today":
    dateFilter = new Date(now.setHours(0, 0, 0, 0));
    break;
  case "week":
    dateFilter = new Date(now.setDate(now.getDate() - 7));
    break;
  case "month":
    dateFilter = new Date(now.setMonth(now.getMonth() - 1));
    break;
  case "year":
    dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
    break;
  default:
    dateFilter = undefined; // All time
}
```

### Revenue Calculation

Revenue dihitung hanya dari orders dengan status:

- `paid`
- `processing`
- `shipped`

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

### Database Models Used

#### Order Model

```typescript
{
  orderDate: Date;
  invoiceNumber: string;
  totalAmount: number;
  status: "pending confirmation" | "paid" | "processing" | "shipped";
  createdAt: Date;
}
```

#### Product Model

```typescript
{
  status: "active" | "inactive";
}
```

## UI Components

### Main Stats Cards

- **Revenue Card**: Green gradient (from-green-50 to-emerald-50)
- **Orders Card**: Blue gradient (from-blue-50 to-cyan-50)
- **Products Card**: Purple gradient (from-purple-50 to-pink-50)

### Status Cards

Each status card has unique color scheme:

- Pending: Yellow (bg-yellow-50, text-yellow-600, border-yellow-200)
- Paid: Blue (bg-blue-50, text-blue-600, border-blue-200)
- Processing: Orange (bg-orange-50, text-orange-600, border-orange-200)
- Shipped: Green (bg-green-50, text-green-600, border-green-200)

### Loading State

- Spinner animation dengan border-primary
- Text "Loading dashboard..."

### Responsive Design

- Mobile: 1 column
- Tablet (≥570px): 2 columns for stats
- Desktop (≥1024px):
  - 3 columns for main stats
  - 4 columns for status cards

## Navigation Routes

All cards are clickable and navigate to related pages:

| Card                 | Route                                           |
| -------------------- | ----------------------------------------------- |
| Total Revenue        | `/dashboard/orders`                             |
| Total Orders         | `/dashboard/orders`                             |
| Total Products       | `/dashboard/products`                           |
| Pending Confirmation | `/dashboard/orders?status=pending_confirmation` |
| Paid                 | `/dashboard/orders?status=paid`                 |
| Processing           | `/dashboard/orders?status=processing`           |
| Shipped              | `/dashboard/orders?status=shipped`              |

## Date Filter Dropdown

Located in the top-right corner of dashboard:

- Calendar icon with label
- Select component from shadcn/ui
- Width: 180px
- Options: All Time, Today, This Week, This Month, This Year

## Error Handling

```typescript
try {
  fetchDashboardStats();
} catch (error) {
  showErrorAlert("Error", error.message || "Failed to fetch dashboard stats");
}
```

Uses SweetAlert2 for error notifications.

## Performance Considerations

1. **Database Queries**
   - Single query untuk orders dengan projection minimal: `select("status totalAmount")`
   - Single query untuk products dengan countDocuments
   - No populate untuk performance
2. **Client-Side**
   - useEffect dengan dependency pada `dateFilter`
   - Loading state untuk UX
   - Error boundary dengan try-catch

3. **Caching**
   - Consider implementing Redis cache untuk stats (future enhancement)
   - Data refresh on filter change

## Future Enhancements

1. **Charts & Graphs**
   - Revenue trend chart (line chart)
   - Order status pie chart
   - Top products bar chart

2. **Export Features**
   - Export to CSV/Excel
   - PDF reports

3. **Real-time Updates**
   - WebSocket integration for live stats
   - Auto-refresh interval

4. **Advanced Filters**
   - Custom date range picker
   - Compare periods (e.g., this month vs last month)
   - Multiple status selection

5. **Additional Metrics**
   - Average order value
   - Conversion rate
   - Customer retention
   - Top selling products
   - Low stock alerts

## Files Modified/Created

### Created

1. `/src/app/api/admin/dashboard/stats/route.ts` - API endpoint untuk statistics
2. `/DASHBOARD_FEATURES.md` - Documentation

### Modified

1. `/src/app/(admin)/dashboard/page.tsx` - Complete dashboard UI rewrite

## Testing Checklist

- [ ] Test dengan filter All Time
- [ ] Test dengan filter Today
- [ ] Test dengan filter This Week
- [ ] Test dengan filter This Month
- [ ] Test dengan filter This Year
- [ ] Test klik Revenue card → navigate ke orders
- [ ] Test klik Orders card → navigate ke orders
- [ ] Test klik Products card → navigate ke products
- [ ] Test klik setiap status card → navigate dengan query param
- [ ] Test Quick Actions buttons
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test loading state
- [ ] Test error handling (disconnect database)
- [ ] Test dengan data kosong (no orders/products)
- [ ] Test dengan berbagai jumlah order
- [ ] Test authorization (non-admin user)

## Dependencies

- `next-auth`: Authentication
- `mongoose`: Database ORM
- `lucide-react`: Icons
- `@/components/ui/*`: shadcn/ui components
  - Card, CardContent, CardHeader, CardTitle, CardDescription
  - Select, SelectContent, SelectItem, SelectTrigger, SelectValue
  - Button
  - Badge
- `sweetalert2`: Error alerts
