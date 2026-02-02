# Sales Module Frontend Implementation Plan

## Overview

This document outlines the complete implementation plan for the Sales module in the frontend, covering Sales Orders, Quotations, and Invoices management with full CRUD operations, status workflows, and reporting features.

## Backend API Analysis

### Existing Backend Endpoints

**Sales Orders:**

- `POST /sales/orders` - Create new sales order
- `GET /sales/orders` - List all orders (with status filter)
- `GET /sales/orders/:id` - Get order details
- `PUT /sales/orders/:id` - Update order
- `POST /sales/orders/:id/send-quote` - Send quotation
- `POST /sales/orders/:id/confirm` - Confirm order
- `POST /sales/orders/:id/cancel` - Cancel order
- `POST /sales/orders/:id/invoice` - Generate invoice from order

**Invoices:**

- `GET /sales/invoices` - List all invoices (with status filter)
- `GET /sales/invoices/:id` - Get invoice details
- `POST /sales/invoices/:id/post` - Post (finalize) invoice

**Reports:**

- `GET /sales/reports/analysis` - Sales analysis report (by customer/product/period)
- `GET /sales/reports/ar-aging` - Accounts Receivable aging report

### Backend Entities

**SalesOrder:**

```typescript
{
  id: string;
  tenantId: string;
  orderNumber: string;
  partnerId: string;
  partner?: Partner;
  orderDate: string;
  status: 'DRAFT' | 'SENT' | 'CONFIRMED' | 'INVOICED' | 'CANCELLED';
  totalAmount: number;
  lines: SalesOrderLine[];
  createdAt: string;
  updatedAt: string;
  version: number;
}
```

**SalesOrderLine:**

```typescript
{
  id: string;
  tenantId: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  subtotal: number; // quantity * unitPrice
  createdAt: string;
  updatedAt: string;
  version: number;
}
```

**Invoice:**

```typescript
{
  id: string;
  tenantId: string;
  number: string;
  partnerId: string;
  partner?: Partner;
  salesOrderId?: string;
  salesOrder?: SalesOrder;
  originalInvoiceId?: string; // For credit/debit notes
  type: 'INVOICE' | 'CREDIT_NOTE' | 'DEBIT_NOTE';
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED' | 'RETURNED';
  issuedAt?: string;
  dueDate?: string;

  // ETA eInvoicing fields
  etaUuid?: string;
  etaSignature?: string;
  etaSubmissionId?: string;

  // Amounts
  totalDiscountAmount: number;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;

  paymentTermId?: string;
  paymentTerm?: PaymentTerm;
  notes?: string;
  lines: InvoiceLine[];
  createdAt: string;
  updatedAt: string;
  version: number;
}
```

**InvoiceLine:**

```typescript
{
  id: string;
  tenantId: string;
  invoiceId: string;
  productId: string;
  product?: Product;
  description: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  subtotal: number;
  taxAmount: number;
  lineTotal: number;
  createdAt: string;
  updatedAt: string;
  version: number;
}
```

### Required Permissions

From `backend/src/modules/identity/constants/permissions.enum.ts`:

```typescript
SALES_ORDERS: {
  CREATE: 'create:sales_order',
  READ: 'read:sales_order',
  UPDATE: 'update:sales_order',
  CANCEL: 'cancel:sales_order',
}

INVOICES: {
  CREATE: 'create:invoice',
  READ: 'read:invoice',
  POST: 'post:invoice',
}
```

## Frontend Implementation Phases

### Phase 1: Type Definitions & API Client Setup

**Files to create/modify:**

1. **Add to `/frontend/src/types/api.types.ts`:**

```typescript
// ========== SALES MODULE (Addition) ==========

export const SalesOrderStatus = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  CONFIRMED: "CONFIRMED",
  INVOICED: "INVOICED",
  CANCELLED: "CANCELLED",
} as const;

export type SalesOrderStatus =
  (typeof SalesOrderStatus)[keyof typeof SalesOrderStatus];

export const InvoiceType = {
  INVOICE: "INVOICE",
  CREDIT_NOTE: "CREDIT_NOTE",
  DEBIT_NOTE: "DEBIT_NOTE",
} as const;

export type InvoiceType = (typeof InvoiceType)[keyof typeof InvoiceType];

export const InvoiceStatus = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
  RETURNED: "RETURNED",
} as const;

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export interface SalesOrder extends BaseEntity {
  orderNumber: string;
  partnerId: string;
  partner?: Partner;
  orderDate: string;
  status: SalesOrderStatus;
  totalAmount: number;
  lines: SalesOrderLine[];
}

export interface SalesOrderLine extends BaseEntity {
  orderId: string;
  order?: SalesOrder;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  subtotal: number;
}

export interface Invoice extends BaseEntity {
  number: string;
  partnerId: string;
  partner?: Partner;
  salesOrderId?: string;
  salesOrder?: SalesOrder;
  originalInvoiceId?: string;
  originalInvoice?: Invoice;
  type: InvoiceType;
  status: InvoiceStatus;
  issuedAt?: string;
  dueDate?: string;

  // ETA eInvoicing fields
  etaUuid?: string;
  etaSignature?: string;
  etaSubmissionId?: string;

  // Amounts
  totalDiscountAmount: number;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;

  paymentTermId?: string;
  paymentTerm?: PaymentTerm;
  notes?: string;
  lines: InvoiceLine[];
}

export interface InvoiceLine extends BaseEntity {
  invoiceId: string;
  invoice?: Invoice;
  productId: string;
  product?: Product;
  description: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  subtotal: number;
  taxAmount: number;
  lineTotal: number;
}

// DTOs
export interface CreateSalesOrderLineDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountRate?: number;
}

export interface CreateSalesOrderDto {
  partnerId: string;
  lines: CreateSalesOrderLineDto[];
}

export interface UpdateSalesOrderDto {
  partnerId?: string;
  orderDate?: string;
  lines?: CreateSalesOrderLineDto[];
}

export interface SalesAnalysisQueryDto {
  groupBy?: "CUSTOMER" | "PRODUCT" | "MONTH";
  startDate?: string;
  endDate?: string;
}

export interface SalesAnalysisEntry {
  id: string;
  name: string;
  orderCount: number;
  totalRevenue: number;
}

export interface ARAgingQueryDto {
  asOfDate?: string;
}

export interface ARAgingEntry {
  partnerId: string;
  partnerName: string;
  currentAmount: number;
  overdue1To30: number;
  overdue31To60: number;
  overdue61To90: number;
  overdue90Plus: number;
  totalDue: number;
}
```

### Phase 2: API Hooks & Query Keys

**Files to create:**

1. **`/frontend/src/lib/api/queries/useSales.ts`**

```typescript
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type {
  SalesOrder,
  SalesOrderStatus,
  Invoice,
  InvoiceStatus,
  SalesAnalysisQueryDto,
  SalesAnalysisEntry,
  ARAgingQueryDto,
  ARAgingEntry,
} from "@/types/api.types";

export const salesQueryKeys = {
  all: ["sales"] as const,
  orders: {
    all: () => [...salesQueryKeys.all, "orders"] as const,
    lists: () => [...salesQueryKeys.orders.all(), "list"] as const,
    list: (status?: SalesOrderStatus) =>
      [...salesQueryKeys.orders.lists(), { status }] as const,
    details: () => [...salesQueryKeys.orders.all(), "detail"] as const,
    detail: (id: string) => [...salesQueryKeys.orders.details(), id] as const,
  },
  invoices: {
    all: () => [...salesQueryKeys.all, "invoices"] as const,
    lists: () => [...salesQueryKeys.invoices.all(), "list"] as const,
    list: (status?: InvoiceStatus) =>
      [...salesQueryKeys.invoices.lists(), { status }] as const,
    details: () => [...salesQueryKeys.invoices.all(), "detail"] as const,
    detail: (id: string) => [...salesQueryKeys.invoices.details(), id] as const,
  },
  reports: {
    all: () => [...salesQueryKeys.all, "reports"] as const,
    analysis: (query?: SalesAnalysisQueryDto) =>
      [...salesQueryKeys.reports.all(), "analysis", query] as const,
    arAging: (query?: ARAgingQueryDto) =>
      [...salesQueryKeys.reports.all(), "ar-aging", query] as const,
  },
};

// Sales Orders
export const useListSalesOrders = (status?: SalesOrderStatus) => {
  return useQuery({
    queryKey: salesQueryKeys.orders.list(status),
    queryFn: () =>
      apiClient.get<SalesOrder[]>("/sales/orders", {
        params: { status },
      }),
  });
};

export const useGetSalesOrder = (id: string, enabled = true) => {
  return useQuery({
    queryKey: salesQueryKeys.orders.detail(id),
    queryFn: () => apiClient.get<SalesOrder>(`/sales/orders/${id}`),
    enabled: enabled && !!id,
  });
};

// Invoices
export const useListInvoices = (status?: InvoiceStatus) => {
  return useQuery({
    queryKey: salesQueryKeys.invoices.list(status),
    queryFn: () =>
      apiClient.get<Invoice[]>("/sales/invoices", {
        params: { status },
      }),
  });
};

export const useGetInvoice = (id: string, enabled = true) => {
  return useQuery({
    queryKey: salesQueryKeys.invoices.detail(id),
    queryFn: () => apiClient.get<Invoice>(`/sales/invoices/${id}`),
    enabled: enabled && !!id,
  });
};

// Reports
export const useSalesAnalysis = (query?: SalesAnalysisQueryDto) => {
  return useQuery({
    queryKey: salesQueryKeys.reports.analysis(query),
    queryFn: () =>
      apiClient.get<SalesAnalysisEntry[]>("/sales/reports/analysis", {
        params: query,
      }),
  });
};

export const useARAgingReport = (query?: ARAgingQueryDto) => {
  return useQuery({
    queryKey: salesQueryKeys.reports.arAging(query),
    queryFn: () =>
      apiClient.get<ARAgingEntry[]>("/sales/reports/ar-aging", {
        params: query,
      }),
  });
};
```

2. **`/frontend/src/lib/api/mutations/useSales.ts`**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { salesQueryKeys } from "@/lib/api/queries/useSales";
import type {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  SalesOrder,
  Invoice,
} from "@/types/api.types";

export const useCreateSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateSalesOrderDto) =>
      apiClient.post<SalesOrder>("/sales/orders", dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesQueryKeys.orders.all() });
    },
  });
};

export const useUpdateSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSalesOrderDto }) =>
      apiClient.put<SalesOrder>(`/sales/orders/${id}`, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesQueryKeys.orders.all() });
      queryClient.invalidateQueries({
        queryKey: salesQueryKeys.orders.detail(id),
      });
    },
  });
};

export const useSendQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<SalesOrder>(`/sales/orders/${id}/send-quote`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesQueryKeys.orders.all() });
      queryClient.invalidateQueries({
        queryKey: salesQueryKeys.orders.detail(id),
      });
    },
  });
};

export const useConfirmSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<SalesOrder>(`/sales/orders/${id}/confirm`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesQueryKeys.orders.all() });
      queryClient.invalidateQueries({
        queryKey: salesQueryKeys.orders.detail(id),
      });
    },
  });
};

export const useCancelSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<SalesOrder>(`/sales/orders/${id}/cancel`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesQueryKeys.orders.all() });
      queryClient.invalidateQueries({
        queryKey: salesQueryKeys.orders.detail(id),
      });
    },
  });
};

export const useCreateInvoiceFromOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) =>
      apiClient.post<Invoice>(`/sales/orders/${orderId}/invoice`),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: salesQueryKeys.orders.all() });
      queryClient.invalidateQueries({
        queryKey: salesQueryKeys.orders.detail(orderId),
      });
      queryClient.invalidateQueries({
        queryKey: salesQueryKeys.invoices.all(),
      });
    },
  });
};

export const usePostInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<Invoice>(`/sales/invoices/${id}/post`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: salesQueryKeys.invoices.all(),
      });
      queryClient.invalidateQueries({
        queryKey: salesQueryKeys.invoices.detail(id),
      });
    },
  });
};
```

3. **Update `/frontend/src/lib/api/queries/index.ts`:**

```typescript
export * from "./useSales";
```

### Phase 3: Feature Structure & Routes

**Folder structure:**

```
frontend/src/features/sales/
├── salesRoutes.ts
├── pages/
│   ├── index.ts
│   ├── SalesIndexPage.tsx
│   ├── SalesOrdersListPage.tsx
│   ├── SalesOrderDetailPage.tsx
│   ├── InvoicesListPage.tsx
│   ├── InvoiceDetailPage.tsx
│   └── SalesReportsPage.tsx
└── components/
    ├── SalesOrderForm.tsx
    ├── SalesOrderStatusBadge.tsx
    ├── InvoiceStatusBadge.tsx
    ├── SalesOrderLineItem.tsx
    ├── InvoiceLineItem.tsx
    └── SalesAnalysisChart.tsx
```

**Routes configuration (`/frontend/src/features/sales/salesRoutes.ts`):**

```typescript
import { lazy } from "react";
import type { RouteConfig } from "@/types/route.types";

const SalesIndexPage = lazy(() =>
  import("./pages/SalesIndexPage").then((m) => ({
    default: m.SalesIndexPage,
  })),
);

const SalesOrdersListPage = lazy(() =>
  import("./pages/SalesOrdersListPage").then((m) => ({
    default: m.SalesOrdersListPage,
  })),
);

const SalesOrderDetailPage = lazy(() =>
  import("./pages/SalesOrderDetailPage").then((m) => ({
    default: m.SalesOrderDetailPage,
  })),
);

const InvoicesListPage = lazy(() =>
  import("./pages/InvoicesListPage").then((m) => ({
    default: m.InvoicesListPage,
  })),
);

const InvoiceDetailPage = lazy(() =>
  import("./pages/InvoiceDetailPage").then((m) => ({
    default: m.InvoiceDetailPage,
  })),
);

const SalesReportsPage = lazy(() =>
  import("./pages/SalesReportsPage").then((m) => ({
    default: m.SalesReportsPage,
  })),
);

export const salesRoutes: RouteConfig[] = [
  {
    path: "/sales",
    component: SalesIndexPage,
    requiredPermissions: ["read:sales_order"],
  },
  {
    path: "/sales/orders",
    component: SalesOrdersListPage,
    requiredPermissions: ["read:sales_order"],
  },
  {
    path: "/sales/orders/:id",
    component: SalesOrderDetailPage,
    requiredPermissions: ["read:sales_order"],
  },
  {
    path: "/sales/invoices",
    component: InvoicesListPage,
    requiredPermissions: ["read:invoice"],
  },
  {
    path: "/sales/invoices/:id",
    component: InvoiceDetailPage,
    requiredPermissions: ["read:invoice"],
  },
  {
    path: "/sales/reports",
    component: SalesReportsPage,
    requiredPermissions: ["read:sales_order"],
  },
];
```

### Phase 4: Page Components

#### 1. Sales Index Page (Dashboard)

**`/frontend/src/features/sales/pages/SalesIndexPage.tsx`:**

```typescript
import { Receipt, Description, Assessment, TrendingUp } from "@mui/icons-material";
import { Box, Card, CardContent, Container, Grid, Typography } from "@mui/material";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";

export function SalesIndexPage() {
  const navigate = useAppNavigate();

  const menuItems = [
    {
      title: "Sales Orders",
      description: "Manage quotations and sales orders",
      icon: <Receipt fontSize="large" />,
      path: "/$lang/app/sales/orders" as const,
      color: "#1976d2",
    },
    {
      title: "Invoices",
      description: "View and manage customer invoices",
      icon: <Description fontSize="large" />,
      path: "/$lang/app/sales/invoices" as const,
      color: "#2e7d32",
    },
    {
      title: "Reports",
      description: "Sales analysis and AR aging",
      icon: <Assessment fontSize="large" />,
      path: "/$lang/app/sales/reports" as const,
      color: "#ed6c02",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sales Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage sales orders, quotations, invoices, and customer relationships
      </Typography>

      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.path}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate({ to: item.path })}
            >
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: `${item.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    color: item.color,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
```

#### 2. Sales Orders List Page

**Key features:**

- DataGrid with all orders
- Status filter (All, Draft, Sent, Confirmed, Invoiced, Cancelled)
- Search by order number or customer
- Actions: View, Edit, Send Quote, Confirm, Create Invoice, Cancel
- Create new order button

#### 3. Sales Order Detail Page

**Key features:**

- Order header (number, customer, date, status)
- Line items table (product, quantity, price, discount, subtotal)
- Total amount calculation
- Action buttons based on status:
  - Draft: Edit, Send Quote, Delete
  - Sent: Confirm, Cancel
  - Confirmed: Create Invoice, Cancel
  - Invoiced: View Invoice (readonly)
  - Cancelled: (readonly)

#### 4. Invoices List Page

**Key features:**

- DataGrid with all invoices
- Status filter (All, Draft, Sent, Paid, Cancelled)
- Search by invoice number or customer
- Display: Number, Customer, Date, Due Date, Amount, Status
- Actions: View, Post Invoice
- Link to related sales order

#### 5. Invoice Detail Page

**Key features:**

- Invoice header (number, customer, dates, status)
- Line items table (product, quantity, price, discount, tax, total)
- Amount breakdown (subtotal, discount, tax, total)
- ETA eInvoicing information (if available)
- Action buttons:
  - Draft: Post Invoice
  - Posted: (readonly, download PDF)

#### 6. Sales Reports Page

**Key features:**

- Sales Analysis report with filters:
  - Group by: Customer, Product, Month
  - Date range selector
  - Display as table and chart
- AR Aging report:
  - As of date selector
  - Table showing customer balances by aging bucket
  - Total overdue summary

### Phase 5: Reusable Components

#### Status Badges

```typescript
// SalesOrderStatusBadge.tsx
const statusColors = {
  DRAFT: "default",
  SENT: "info",
  CONFIRMED: "success",
  INVOICED: "warning",
  CANCELLED: "error",
} as const;

// InvoiceStatusBadge.tsx
const statusColors = {
  DRAFT: "default",
  SENT: "info",
  PAID: "success",
  CANCELLED: "error",
  RETURNED: "warning",
} as const;
```

#### Forms

1. **SalesOrderForm** - Create/edit sales orders with:
   - Customer selection (autocomplete from Partners API)
   - Order date picker
   - Dynamic line items:
     - Product autocomplete
     - Quantity input
     - Unit price input
     - Discount percentage
     - Subtotal calculation (readonly)
   - Add/remove lines
   - Total amount (readonly)
   - Form validation (Zod schema)

2. **Line Item Components** - Reusable table row components for displaying order/invoice lines

### Phase 6: Integration & Testing

**Tasks:**

1. Add sales routes to main router configuration
2. Add navigation links to main sidebar/menu
3. Test all CRUD operations
4. Test status transitions (Draft → Sent → Confirmed → Invoiced)
5. Test invoice generation from order
6. Test reports with different filters
7. Test permissions (ensure buttons/actions respect user permissions)
8. Add loading states and error handling
9. Add success/error notifications

### Phase 7: Polish & Documentation

**Tasks:**

1. Add i18n translations for all text
2. Responsive design testing
3. Accessibility audit
4. Performance optimization (lazy loading, memoization)
5. Update user documentation
6. Code review and refactoring

## File Checklist

### Types & API

- [ ] Add Sales types to `api.types.ts`
- [ ] Create `lib/api/queries/useSales.ts`
- [ ] Create `lib/api/mutations/useSales.ts`
- [ ] Update `lib/api/queries/index.ts`

### Feature Structure

- [ ] Create `features/sales/` folder
- [ ] Create `salesRoutes.ts`
- [ ] Create `pages/` folder
- [ ] Create `components/` folder

### Pages

- [ ] `SalesIndexPage.tsx`
- [ ] `SalesOrdersListPage.tsx`
- [ ] `SalesOrderDetailPage.tsx`
- [ ] `InvoicesListPage.tsx`
- [ ] `InvoiceDetailPage.tsx`
- [ ] `SalesReportsPage.tsx`
- [ ] `pages/index.ts` (re-exports)

### Components

- [ ] `SalesOrderForm.tsx`
- [ ] `SalesOrderStatusBadge.tsx`
- [ ] `InvoiceStatusBadge.tsx`
- [ ] `SalesOrderLineItem.tsx`
- [ ] `InvoiceLineItem.tsx`
- [ ] `SalesAnalysisChart.tsx`

### Integration

- [ ] Add to main router
- [ ] Add to navigation menu
- [ ] Add permissions to RBAC configuration
- [ ] Add i18n translations

### Testing

- [ ] Unit tests for forms and components
- [ ] Integration tests for API hooks
- [ ] E2E tests for critical flows

## Estimated Timeline

- **Phase 1** (Types & API): 1 day
- **Phase 2** (API Hooks): 1 day
- **Phase 3** (Routes): 0.5 days
- **Phase 4** (Pages): 3-4 days
- **Phase 5** (Components): 2-3 days
- **Phase 6** (Integration): 1-2 days
- **Phase 7** (Polish): 1-2 days

**Total: ~10-14 days** for a single developer

## Dependencies

### Required:

- Partners feature (for customer selection)
- Products feature (for product selection)
- Auth/RBAC system (for permissions)

### Optional Enhancements:

- Payment Terms integration (for invoice due dates)
- Document templates (for PDF generation)
- Email notifications (for sending quotes/invoices)
- ETA integration (for Egyptian Tax Authority eInvoicing)

## Notes

1. **Reuse existing patterns**: Follow the same structure as Inventory, Products, and Procurement features
2. **Status workflows**: Implement proper state machine for order/invoice status transitions
3. **Calculations**: Ensure accurate amount calculations (subtotal, discount, tax, total)
4. **Validation**: Add comprehensive form validation with clear error messages
5. **UX considerations**:
   - Show loading states during API calls
   - Disable actions based on current status
   - Confirm destructive actions (cancel order, delete)
   - Show success/error toast notifications
6. **Performance**: Use proper caching with React Query, lazy load routes
7. **Accessibility**: Ensure keyboard navigation, ARIA labels, proper focus management

## Phase 8: POS (Point of Sale) Mode

### Overview

POS mode provides an offline-first, touch-optimized interface for retail sales. Orders are created locally with client-generated UUIDs and synced to the server when connectivity is available.

### Backend API Analysis

**Endpoint:**

- `POST /pos/sync` - Sync offline orders (batch upload)

**Permission:**

- `sync:pos` - Required to sync POS orders

**DTO:**

```typescript
interface SyncOrderLineDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
}

interface SyncOrderDto {
  id: string; // Client-generated UUID v7
  partnerId: string;
  orderDate: string; // ISO 8601
  lines: SyncOrderLineDto[];
}
```

**Backend Behavior:**

- Accepts array of orders
- Idempotent: Skips already-synced orders (by ID)
- Each order becomes a `SalesOrder` with status `CONFIRMED`
- Order number: `POS-{first8CharsOfUUID}`
- Returns: `{ synced: number, failed: number, errors: Array<{id, error}> }`

### Frontend Implementation

#### 1. IndexedDB for Offline Storage

**`/frontend/src/lib/db/posDatabase.ts`:**

```typescript
import Dexie, { Table } from "dexie";

export interface POSOrder {
  id: string; // UUID v7
  partnerId: string;
  customerName?: string;
  orderDate: string;
  totalAmount: number;
  lines: POSOrderLine[];
  synced: boolean;
  createdAt: string;
}

export interface POSOrderLine {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  subtotal: number;
}

export class POSDatabase extends Dexie {
  orders!: Table<POSOrder>;

  constructor() {
    super("POSDatabase");
    this.version(1).stores({
      orders: "id, partnerId, synced, createdAt",
    });
  }
}

export const posDb = new POSDatabase();
```

#### 2. POS Types

**Add to `/frontend/src/types/api.types.ts`:**

```typescript
// POS Module
export interface SyncOrderLineDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
}

export interface SyncOrderDto {
  id: string;
  partnerId: string;
  orderDate: string;
  lines: SyncOrderLineDto[];
}

export interface POSSyncResult {
  synced: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}
```

#### 3. POS API Hooks

**`/frontend/src/lib/api/mutations/usePOS.ts`:**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { SyncOrderDto, POSSyncResult } from "@/types/api.types";

export const useSyncPOSOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orders: SyncOrderDto[]) =>
      apiClient.post<POSSyncResult>("/pos/sync", orders),
    onSuccess: () => {
      // Invalidate sales orders cache
      queryClient.invalidateQueries({ queryKey: ["sales", "orders"] });
    },
  });
};
```

#### 4. POS Store (Zustand)

**`/frontend/src/stores/posStore.ts`:**

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v7 as uuidv7 } from "uuid";
import { posDb, type POSOrder, type POSOrderLine } from "@/lib/db/posDatabase";

interface CartItem extends POSOrderLine {
  id: string; // Temporary cart item ID
}

interface POSStore {
  // Cart state
  cart: CartItem[];
  selectedPartnerId: string | null;

  // Actions
  addToCart: (item: Omit<CartItem, "id" | "subtotal">) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateDiscount: (itemId: string, discountRate: number) => void;
  clearCart: () => void;
  setPartner: (partnerId: string) => void;

  // Order actions
  completeOrder: () => Promise<string>; // Returns order ID

  // Computed
  getCartTotal: () => number;
}

export const usePOSStore = create<POSStore>()(
  persist(
    (set, get) => ({
      cart: [],
      selectedPartnerId: null,

      addToCart: (item) => {
        const cartItem: CartItem = {
          ...item,
          id: uuidv7(),
          subtotal:
            item.quantity * item.unitPrice * (1 - item.discountRate / 100),
        };
        set((state) => ({ cart: [...state.cart, cartItem] }));
      },

      removeFromCart: (itemId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity,
                  subtotal:
                    quantity * item.unitPrice * (1 - item.discountRate / 100),
                }
              : item,
          ),
        }));
      },

      updateDiscount: (itemId, discountRate) => {
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  discountRate,
                  subtotal:
                    item.quantity * item.unitPrice * (1 - discountRate / 100),
                }
              : item,
          ),
        }));
      },

      clearCart: () => {
        set({ cart: [], selectedPartnerId: null });
      },

      setPartner: (partnerId) => {
        set({ selectedPartnerId: partnerId });
      },

      completeOrder: async () => {
        const { cart, selectedPartnerId } = get();

        if (!selectedPartnerId || cart.length === 0) {
          throw new Error("Cannot complete order: missing partner or items");
        }

        const orderId = uuidv7();
        const order: POSOrder = {
          id: orderId,
          partnerId: selectedPartnerId,
          orderDate: new Date().toISOString(),
          totalAmount: get().getCartTotal(),
          lines: cart.map(({ id, ...line }) => line), // Remove temporary cart IDs
          synced: false,
          createdAt: new Date().toISOString(),
        };

        // Save to IndexedDB
        await posDb.orders.add(order);

        // Clear cart
        get().clearCart();

        return orderId;
      },

      getCartTotal: () => {
        return get().cart.reduce((sum, item) => sum + item.subtotal, 0);
      },
    }),
    {
      name: "pos-storage",
      partialize: (state) => ({
        selectedPartnerId: state.selectedPartnerId,
      }),
    },
  ),
);
```

#### 5. Sync Service

**`/frontend/src/lib/services/posSyncService.ts`:**

```typescript
import { posDb } from "@/lib/db/posDatabase";
import { apiClient } from "@/lib/api/client";
import type { SyncOrderDto, POSSyncResult } from "@/types/api.types";

export class POSSyncService {
  static async syncPendingOrders(): Promise<POSSyncResult> {
    // Get all unsynced orders
    const unsyncedOrders = await posDb.orders
      .where("synced")
      .equals(0)
      .toArray();

    if (unsyncedOrders.length === 0) {
      return { synced: 0, failed: 0, errors: [] };
    }

    // Map to DTO format
    const ordersToSync: SyncOrderDto[] = unsyncedOrders.map((order) => ({
      id: order.id,
      partnerId: order.partnerId,
      orderDate: order.orderDate,
      lines: order.lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discountRate: line.discountRate,
      })),
    }));

    try {
      // Sync to server
      const result = await apiClient.post<POSSyncResult>(
        "/pos/sync",
        ordersToSync,
      );

      // Mark synced orders in IndexedDB
      const syncedIds = unsyncedOrders
        .filter((order) => !result.errors.some((e) => e.id === order.id))
        .map((order) => order.id);

      await posDb.orders.bulkUpdate(
        syncedIds.map((id) => ({ key: id, changes: { synced: true } })),
      );

      return result;
    } catch (error) {
      console.error("Sync failed:", error);
      throw error;
    }
  }

  static async getPendingOrdersCount(): Promise<number> {
    return await posDb.orders.where("synced").equals(0).count();
  }

  static async getAllOrders() {
    return await posDb.orders.orderBy("createdAt").reverse().toArray();
  }

  static async deleteOrder(id: string) {
    await posDb.orders.delete(id);
  }
}
```

#### 6. POS Pages

**Folder structure:**

```
frontend/src/features/pos/
├── posRoutes.ts
├── pages/
│   ├── index.ts
│   ├── POSPage.tsx          (Main POS interface)
│   ├── POSHistoryPage.tsx   (Order history & sync status)
│   └── POSSettingsPage.tsx  (POS configuration)
└── components/
    ├── ProductGrid.tsx       (Touch-friendly product selector)
    ├── CartPanel.tsx         (Shopping cart sidebar)
    ├── NumericKeypad.tsx     (Quick quantity/price entry)
    ├── CustomerSelector.tsx  (Quick customer selection)
    └── SyncStatusIndicator.tsx
```

**Main POS Interface (`POSPage.tsx`):**

Key features:

- Full-screen layout (optimized for tablets/touchscreens)
- Left: Product grid with search/categories
- Right: Cart panel with items, totals, customer info
- Bottom: Action buttons (Clear, Hold, Pay)
- Top: Sync status indicator with pending orders count
- Auto-sync on network reconnect
- Barcode scanner support (optional)

**Layout:**

```
┌─────────────────────────────────────────┐
│ [Logo] POS Mode    [Sync: 3 pending] [≡]│
├──────────────────────┬──────────────────┤
│                      │ Customer: John D. │
│   Product Grid       │ ─────────────────│
│  ┌────┐ ┌────┐      │ Item 1    $10.00 │
│  │Prod│ │Prod│      │ Item 2    $25.00 │
│  │ 1  │ │ 2  │      │ ─────────────────│
│  └────┘ └────┘      │ Subtotal  $35.00 │
│  ┌────┐ ┌────┐      │ Discount   $0.00 │
│  │Prod│ │Prod│      │ Tax (14%)  $4.90 │
│  │ 3  │ │ 4  │      │ ─────────────────│
│  └────┘ └────┘      │ Total     $39.90 │
│                      │                   │
│   [Search...]        │ [Clear] [Pay Now]│
└──────────────────────┴──────────────────┘
```

**POS History Page:**

- List of all orders (synced and pending)
- Status badges (Synced, Pending, Failed)
- Manual sync button
- View order details
- Delete draft orders

#### 7. Routes Configuration

**`/frontend/src/features/pos/posRoutes.ts`:**

```typescript
import { lazy } from "react";
import type { RouteConfig } from "@/types/route.types";

const POSPage = lazy(() =>
  import("./pages/POSPage").then((m) => ({ default: m.POSPage })),
);

const POSHistoryPage = lazy(() =>
  import("./pages/POSHistoryPage").then((m) => ({
    default: m.POSHistoryPage,
  })),
);

export const posRoutes: RouteConfig[] = [
  {
    path: "/pos",
    component: POSPage,
    requiredPermissions: ["sync:pos"],
  },
  {
    path: "/pos/history",
    component: POSHistoryPage,
    requiredPermissions: ["sync:pos"],
  },
];
```

### POS Features Checklist

- [ ] Install dependencies (`dexie`, `uuid`)
- [ ] Create IndexedDB schema
- [ ] Create POS store with cart management
- [ ] Create sync service
- [ ] Build main POS interface
- [ ] Build cart panel component
- [ ] Build product grid with categories/search
- [ ] Build customer selector
- [ ] Build numeric keypad
- [ ] Build order history page
- [ ] Implement auto-sync on reconnect
- [ ] Add network status detection
- [ ] Add sync status indicator
- [ ] Test offline functionality
- [ ] Test sync conflict resolution
- [ ] Add barcode scanner support (optional)
- [ ] Add receipt printer support (optional)

### Dependencies

```bash
pnpm add dexie uuid
pnpm add -D @types/uuid
```

### Technical Considerations

1. **UUID v7**: Use UUID v7 for client-generated IDs (better for database indexing than v4)
2. **Idempotency**: Backend checks existing IDs, preventing duplicate orders on retry
3. **Offline-First**: All operations work without network, sync when available
4. **Conflict Resolution**: Backend wins - if order already exists, skip it
5. **Error Handling**: Failed syncs stay in queue, success removes from IndexedDB
6. **Network Detection**: Use `navigator.onLine` and `online`/`offline` events
7. **Auto-Sync**: Trigger sync on:
   - Network reconnect
   - Manual button click
   - Background interval (every 5 minutes if pending orders)
8. **Performance**: IndexedDB for fast local operations, pagination for large datasets

### Security Considerations

1. Validate POS permission on every sync request
2. Rate limit sync endpoint to prevent abuse
3. Sanitize all inputs before storage/sync
4. Clear IndexedDB on logout
5. Consider encrypting sensitive data in IndexedDB

### UX Considerations

1. **Touch-Friendly**: Large buttons (min 44x44px), generous spacing
2. **Visual Feedback**: Loading states, success/error toasts
3. **Keyboard Shortcuts**: Support for USB barcode scanners
4. **Quick Actions**: Recent products, favorites, quick customer selection
5. **Error Recovery**: Clear error messages, retry options
6. **Sync Status**: Always visible, pending count badge
7. **Confirmation**: Confirm before clearing cart or deleting orders
8. **Accessibility**: High contrast, large text, keyboard navigation

### Estimated Timeline

- **IndexedDB & Store**: 1 day
- **Sync Service**: 0.5 days
- **Main POS Interface**: 2-3 days
- **Cart & Products**: 2 days
- **History & Settings**: 1 day
- **Testing & Polish**: 1-2 days

**Total: ~7-9 days**

### Integration with Main Sales Module

- POS orders appear in regular Sales Orders list with `POS-` prefix
- POS orders are automatically `CONFIRMED` status
- Can still create invoices from POS orders through regular flow
- POS mode is separate interface, optimized for retail/restaurant scenarios

## Future Enhancements

### Sales Module

- Bulk operations (bulk send quotes, bulk invoice)
- Advanced search and filters
- Export to Excel/CSV
- Print/PDF generation
- Email integration (send quotes/invoices via email)
- Payment recording and tracking
- Credit notes and refunds
- Recurring invoices
- Multi-currency support
- Sales forecasting and analytics
- Integration with accounting module for journal entries

### POS Module

- Receipt printer integration (ESC/POS protocol)
- Barcode scanner support (USB HID)
- Cash drawer management
- Multiple payment methods (cash, card, split payment)
- Customer loyalty program integration
- Product bundles and promotions
- Returns and refunds from POS
- End-of-day reporting (cash reconciliation)
- Multi-device sync (multiple POS terminals)
- Kitchen/printer routing for restaurants
- Table management for restaurants
- Employee time tracking
- Tip management
