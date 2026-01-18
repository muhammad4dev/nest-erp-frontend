/**
 * Backend API Types
 * TypeScript interfaces matching NestJS ERP backend entities
 */

// ========== BASE TYPES ==========

export interface BaseEntity {
  id: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ========== IDENTITY MODULE ==========

export interface User extends BaseEntity {
  email: string;
  passwordHash?: string; // Not returned from API
  isActive: boolean;
  preferences?: Record<string, unknown>;
  roles?: Role[];
  permissions?: Permission[];
  branchId?: string;
  branch?: Branch;
}

export interface Role extends BaseEntity {
  name: string;
  description?: string;
  permissions?: Permission[];
  users?: User[];
}

export interface Permission extends BaseEntity {
  action: string;
  resource: string;
  description?: string;
}

export interface PermissionListItem {
  action: string;
  resource: string;
  description?: string;
}

export interface Branch extends BaseEntity {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Tenant extends BaseEntity {
  name: string;
  domain?: string;
  isActive: boolean;
  users?: User[];
}

// ========== FINANCE MODULE ==========

export const AccountType = {
  ASSET: "ASSET",
  LIABILITY: "LIABILITY",
  EQUITY: "EQUITY",
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export interface Account extends BaseEntity {
  code: string;
  name: string;
  type: AccountType;
  isControlAccount: boolean;
  parentAccountId?: string;
}

export const JournalStatus = {
  DRAFT: "DRAFT",
  POSTED: "POSTED",
  VOIDED: "VOIDED",
} as const;

export type JournalStatus = (typeof JournalStatus)[keyof typeof JournalStatus];
export interface JournalEntry extends BaseEntity {
  reference?: string;
  transactionDate: string;
  status: JournalStatus;
  branchId?: string;
  lines?: JournalLine[];
}

export interface JournalLine extends BaseEntity {
  journalEntryId: string;
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
  account?: Account;
}

export interface FiscalPeriod extends BaseEntity {
  name: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
}

export interface PaymentTerm extends BaseEntity {
  label: string;
  days: number;
  discountPercent?: number;
  discountDays?: number;
}

export interface TrialBalanceEntry {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debit: number;
  credit: number;
  balance: number;
}

export interface GeneralLedgerEntry {
  date: string;
  reference: string;
  description?: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
}

// ========== PRODUCTS & INVENTORY MODULE ==========

export const ProductType = {
  GOODS: "GOODS",
  SERVICE: "SERVICE",
  CONSUMABLE: "CONSUMABLE",
  DIGITAL: "DIGITAL",
} as const;

export type ProductType = (typeof ProductType)[keyof typeof ProductType];

export const AttributeType = {
  TEXT: "TEXT",
  NUMBER: "NUMBER",
  BOOLEAN: "BOOLEAN",
  SELECT: "SELECT",
  MULTI_SELECT: "MULTI_SELECT",
  DATE: "DATE",
  COLOR: "COLOR",
} as const;

export type AttributeType = (typeof AttributeType)[keyof typeof AttributeType];

export interface Product extends BaseEntity {
  sku: string;
  name: string;
  description?: string;
  productType: ProductType;
  categoryId?: string;
  category?: ProductCategory;
  uomId?: string;
  uom?: UomUnit;
  salesPrice: number;
  costPrice: number;
  taxCode?: string;
  barcode?: string;
  weight?: number;
  canBeSold: boolean;
  canBePurchased: boolean;
  trackInventory: boolean;
  isActive: boolean;
  hasVariants: boolean;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
  translations?: ProductTranslation[];
  attributeValues?: ProductAttributeValue[];
  variants?: ProductVariant[];
}

export interface ProductCategory extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  parent?: ProductCategory;
  children?: ProductCategory[];
  isActive: boolean;
  sortOrder: number;
}

export interface ProductAttribute extends BaseEntity {
  name: string;
  code: string;
  type: AttributeType;
  isRequired: boolean;
  isFilterable: boolean;
  isVariant: boolean;
  options?: string[];
  sortOrder: number;
}

export interface ProductAttributeValue extends BaseEntity {
  productId: string;
  product?: Product;
  attributeId: string;
  attribute?: ProductAttribute;
  valueText?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  valueDate?: string;
  valueSelect?: number[];
}

export interface ProductVariant extends BaseEntity {
  productId: string;
  product?: Product;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  salesPrice?: number;
  costPrice?: number;
  barcode?: string;
  weight?: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface ProductTranslation extends BaseEntity {
  productId: string;
  product?: Product;
  locale: string;
  name: string;
  description?: string;
}

export interface UomUnit extends BaseEntity {
  name: string;
  categoryId?: string;
  ratio: number;
  isReference: boolean;
  etaCode?: string;
}

export interface UnitOfMeasure extends BaseEntity {
  name: string;
  symbol: string;
  category: string;
}

export interface StockLocation extends BaseEntity {
  name: string;
  code: string;
  locationType: string;
  parentId?: string;
  parent?: StockLocation;
  children?: StockLocation[];
  isActive: boolean;
}

export interface StockQuant extends BaseEntity {
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  locationId: string;
  location?: StockLocation;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface StockLedgerEntry extends BaseEntity {
  productId: string;
  product?: Product;
  variantId?: string;
  locationId: string;
  location?: StockLocation;
  quantity: number;
  reference?: string;
  movementType: string;
  unitCost?: number;
}

export interface Location extends BaseEntity {
  name: string;
  code: string;
  type: "WAREHOUSE" | "STORE" | "TRANSIT";
  address?: string;
}

export interface StockMovement extends BaseEntity {
  productId: string;
  product?: Product;
  locationId: string;
  location?: Location;
  quantity: number;
  movementType: "IN" | "OUT" | "ADJUSTMENT";
  reference?: string;
  date: string;
}

// ========== SALES MODULE ==========

export interface Partner extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  partnerType?: "BUSINESS" | "PERSON";
  isCustomer: boolean;
  isVendor: boolean;
  taxId?: string;
  address?: {
    country?: string;
    governate?: string;
    regionCity?: string;
    street?: string;
    buildingNumber?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    fax?: string;
  };
  paymentTermId?: string;
  paymentTerm?: PaymentTerm;
}

// ========== DTOs (Data Transfer Objects) ==========

// Auth DTOs
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  access_token: string;
  refresh_token: string;
}

export interface UserMeResponseDto {
  id: string;
  tenantId: string;
  email: string;
  preferences?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  /**
   * Denormalized permissions array (O(1) access).
   * Format: ["action:resource", ...]
   */
  permissions?: string[];
  roles?: Array<{
    id: string;
    tenantId: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    version: number;
    permissions?: Array<{
      id: string;
      tenantId: string;
      action: string;
      resource: string;
      description?: string;
      createdAt: string;
      updatedAt: string;
      version: number;
    }>;
  }>;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

// User DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  tenantId?: string;
}

export interface UpdateUserDto {
  email?: string;
  isActive?: boolean;
  preferences?: Record<string, unknown>;
}

// Role DTOs
export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
}

// Tenant DTOs
export interface CreateTenantDto {
  name: string;
  domain?: string;
}

export interface UpdateTenantDto {
  name?: string;
  domain?: string;
  isActive?: boolean;
}

// Account DTOs
export interface CreateAccountDto {
  code: string;
  name: string;
  type: AccountType;
  isControlAccount?: boolean;
  parentAccountId?: string;
}

export interface UpdateAccountDto {
  code?: string;
  name?: string;
  type?: AccountType;
  isControlAccount?: boolean;
  parentAccountId?: string;
}

// Fiscal Period DTOs
export interface CreateFiscalPeriodDto {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateFiscalPeriodDto {
  name?: string;
  startDate?: string;
  endDate?: string;
}

export interface ClosePeriodDto {
  force?: boolean;
}

// Journal Entry DTOs
export interface CreateJournalEntryDto {
  description: string;
  date: string;
  lines: CreateJournalLineDto[];
}

export interface CreateJournalLineDto {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

// Report Query DTOs
export interface TrialBalanceQueryDto {
  periodId?: string;
  accountType?: AccountType;
}

export interface GeneralLedgerQueryDto {
  accountId?: string;
  startDate?: string;
  endDate?: string;
}

// Payment Term DTOs
export interface CreatePaymentTermDto {
  label: string;
  days: number;
}

export interface UpdatePaymentTermDto {
  label?: string;
  days?: number;
}

// Partner DTOs
export interface CreatePartnerDto {
  name: string;
  email?: string;
  phone?: string;
  partnerType?: "BUSINESS" | "PERSON";
  isCustomer?: boolean;
  isVendor?: boolean;
  taxId?: string;
  address?: {
    country?: string;
    governate?: string;
    regionCity?: string;
    street?: string;
    buildingNumber?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    fax?: string;
  };
  paymentTermId?: string;
}

export interface UpdatePartnerDto {
  name?: string;
  email?: string;
  phone?: string;
  partnerType?: "BUSINESS" | "PERSON";
  isCustomer?: boolean;
  isVendor?: boolean;
  taxId?: string;
  address?: {
    country?: string;
    governate?: string;
    regionCity?: string;
    street?: string;
    buildingNumber?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    fax?: string;
  };
  paymentTermId?: string;
}

// Product DTOs
export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  productType: ProductType;
  categoryId?: string;
  uomId?: string;
  salesPrice: number;
  costPrice: number;
  taxCode?: string;
  barcode?: string;
  weight?: number;
  canBeSold?: boolean;
  canBePurchased?: boolean;
  trackInventory?: boolean;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateProductDto {
  sku?: string;
  name?: string;
  description?: string;
  productType?: ProductType;
  categoryId?: string;
  uomId?: string;
  salesPrice?: number;
  costPrice?: number;
  taxCode?: string;
  barcode?: string;
  weight?: number;
  canBeSold?: boolean;
  canBePurchased?: boolean;
  trackInventory?: boolean;
  isActive?: boolean;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateProductCategoryDto {
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateProductCategoryDto {
  name?: string;
  code?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateProductAttributeDto {
  name: string;
  code: string;
  type: AttributeType;
  isRequired?: boolean;
  isFilterable?: boolean;
  isVariant?: boolean;
  options?: string[];
  sortOrder?: number;
}

export interface UpdateProductAttributeDto {
  name?: string;
  code?: string;
  type?: AttributeType;
  isRequired?: boolean;
  isFilterable?: boolean;
  isVariant?: boolean;
  options?: string[];
  sortOrder?: number;
}

export interface CreateProductVariantDto {
  sku: string;
  name: string;
  attributes: Record<string, string>;
  salesPrice?: number;
  costPrice?: number;
  barcode?: string;
  weight?: number;
  imageUrl?: string;
}

export interface UpdateProductVariantDto {
  sku?: string;
  name?: string;
  attributes?: Record<string, string>;
  salesPrice?: number;
  costPrice?: number;
  barcode?: string;
  weight?: number;
  isActive?: boolean;
  imageUrl?: string;
}

export interface GenerateVariantsDto {
  attributeIds: string[];
}

export interface StockTransferDto {
  productId: string;
  variantId?: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
  reference?: string;
}

export interface StockAdjustmentDto {
  productId: string;
  variantId?: string;
  locationId: string;
  quantity: number;
  reason?: string;
  reference?: string;
}

export interface StockLedgerQueryDto {
  productId?: string;
  locationId?: string;
  startDate?: string;
  endDate?: string;
}

export interface StockValuationQueryDto {
  locationId?: string;
  categoryId?: string;
  date?: string;
}

// Stock Receipt & Issue Types

export type ReceiptSourceType =
  | "PURCHASE"
  | "PRODUCTION"
  | "RETURN"
  | "TRANSFER"
  | "ADJUSTMENT";

export type ReceiptStatus = "DRAFT" | "COMPLETED" | "CANCELLED";

export type IssueType =
  | "SALE"
  | "PRODUCTION"
  | "WRITEOFF"
  | "TRANSFER"
  | "ADJUSTMENT";

export type IssueStatus = "DRAFT" | "COMPLETED" | "CANCELLED";

export interface StockReceiptLine extends BaseEntity {
  receiptId: string;
  productId: string;
  product?: Product;
  variantId?: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  batchNumber?: string;
  expiryDate?: string;
  serialNumbers?: string[];
  notes?: string;
}

export interface StockReceipt extends BaseEntity {
  receiptNumber: string;
  receiptDate: string;
  sourceType: ReceiptSourceType;
  sourceReference?: string;
  locationId: string;
  location?: Location;
  supplierId?: string;
  status: ReceiptStatus;
  totalQuantity: number;
  totalValue: number;
  notes?: string;
  completedBy?: string;
  completedAt?: string;
  lines?: StockReceiptLine[];
}

export interface StockIssueLine extends BaseEntity {
  issueId: string;
  productId: string;
  product?: Product;
  variantId?: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  batchNumber?: string;
  serialNumbers?: string[];
  notes?: string;
}

export interface StockIssue extends BaseEntity {
  issueNumber: string;
  issueDate: string;
  issueType: IssueType;
  sourceReference?: string;
  locationId: string;
  location?: Location;
  customerId?: string;
  status: IssueStatus;
  totalQuantity: number;
  totalValue: number;
  notes?: string;
  completedBy?: string;
  completedAt?: string;
  lines?: StockIssueLine[];
}

export interface CreateStockReceiptLineDto {
  productId: string;
  variantId?: string;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: string;
  serialNumbers?: string[];
  notes?: string;
}

export interface CreateStockReceiptDto {
  receiptDate: string;
  sourceType: ReceiptSourceType;
  sourceReference?: string;
  locationId: string;
  supplierId?: string;
  notes?: string;
  lines: CreateStockReceiptLineDto[];
}

export interface UpdateStockReceiptDto {
  receiptDate?: string;
  sourceType?: ReceiptSourceType;
  sourceReference?: string;
  locationId?: string;
  supplierId?: string;
  notes?: string;
  totalQuantity?: number;
  totalValue?: number;
  lines?: CreateStockReceiptLineDto[];
}

export interface CreateStockIssueLineDto {
  productId: string;
  variantId?: string;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  serialNumbers?: string[];
  notes?: string;
}

export interface CreateStockIssueDto {
  issueDate: string;
  issueType: IssueType;
  sourceReference?: string;
  locationId: string;
  customerId?: string;
  notes?: string;
  lines: CreateStockIssueLineDto[];
}

export interface UpdateStockIssueDto {
  issueDate?: string;
  issueType?: IssueType;
  sourceReference?: string;
  locationId?: string;
  customerId?: string;
  notes?: string;
  totalQuantity?: number;
  totalValue?: number;
  lines?: CreateStockIssueLineDto[];
}

// ========== PROCUREMENT MODULE ==========

export const PurchaseOrderStatus = {
  RFQ: "RFQ",
  RFQ_SENT: "RFQ_SENT",
  TO_APPROVE: "TO_APPROVE",
  PURCHASE_ORDER: "PURCHASE_ORDER",
  RECEIVED: "RECEIVED",
  BILLED: "BILLED",
  LOCKED: "LOCKED",
  CANCELLED: "CANCELLED",
} as const;

export type PurchaseOrderStatus =
  (typeof PurchaseOrderStatus)[keyof typeof PurchaseOrderStatus];

export const VendorBillType = {
  BILL: "BILL",
  CREDIT_NOTE: "CREDIT_NOTE",
  DEBIT_NOTE: "DEBIT_NOTE",
} as const;

export type VendorBillType =
  (typeof VendorBillType)[keyof typeof VendorBillType];

export const VendorBillStatus = {
  DRAFT: "DRAFT",
  POSTED: "POSTED",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
} as const;

export type VendorBillStatus =
  (typeof VendorBillStatus)[keyof typeof VendorBillStatus];

export interface PurchaseOrder extends BaseEntity {
  orderNumber: string;
  partnerId: string;
  partner?: Partner;
  orderDate: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  lines?: PurchaseOrderLine[];
}

export interface PurchaseOrderLine extends BaseEntity {
  orderId: string;
  order?: PurchaseOrder;
  productId: string;
  product?: Product;
  quantity: number;
  uomId?: string;
  uom?: UomUnit;
  unitPrice: number;
  subtotal: number;
}

export interface VendorBill extends BaseEntity {
  billReference: string;
  partnerId: string;
  partner?: Partner;
  purchaseOrderId?: string;
  purchaseOrder?: PurchaseOrder;
  originalBillId?: string;
  originalBill?: VendorBill;
  type: VendorBillType;
  status: VendorBillStatus;
  receivedAt?: string;
  dueDate?: string;
  totalDiscountAmount: number;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  paymentTermId?: string;
  paymentTerm?: PaymentTerm;
  notes?: string;
  lines?: VendorBillLine[];
  balanceDue?: number;
  isOverdue?: boolean;
}

export interface VendorBillLine extends BaseEntity {
  vendorBillId: string;
  bill?: VendorBill;
  productId: string;
  product?: Product;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  lineTotal: number;
}

export interface APAgingEntry {
  partnerId: string;
  partnerName: string;
  currentAmount: number;
  overdue1To30: number;
  overdue31To60: number;
  overdue61To90: number;
  overdue90Plus: number;
  totalDue: number;
}

export interface CreatePurchaseOrderLineDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateRfqDto {
  partnerId: string;
  orderDate: string;
  lines: CreatePurchaseOrderLineDto[];
}
