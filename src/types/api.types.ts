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
  roles?: Role[];
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

export interface Account extends BaseEntity {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentId?: string;
  parent?: Account;
  children?: Account[];
  isActive: boolean;
}

export interface JournalEntry extends BaseEntity {
  reference: string;
  transactionDate: string;
  description?: string;
  status: 'DRAFT' | 'POSTED';
  lines: JournalLine[];
}

export interface JournalLine extends BaseEntity {
  journalEntryId: string;
  journalEntry?: JournalEntry;
  accountId: string;
  account?: Account;
  debit: number;
  credit: number;
  description?: string;
}

export interface PaymentTerm extends BaseEntity {
  label: string;
  days: number;
}

export interface TrialBalanceEntry {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface GeneralLedgerEntry {
  date: Date;
  journalEntryNumber: string;
  description: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
}

// ========== INVENTORY MODULE ==========

export interface Product extends BaseEntity {
  name: string;
  sku: string;
  description?: string;
  type: 'PRODUCT' | 'SERVICE';
  category?: string;
  unitPrice: number;
  costPrice: number;
  uomId?: string;
  uom?: UnitOfMeasure;
  isActive: boolean;
}

export interface UnitOfMeasure extends BaseEntity {
  name: string;
  symbol: string;
  category: string;
}

export interface Location extends BaseEntity {
  name: string;
  code: string;
  type: 'WAREHOUSE' | 'STORE' | 'TRANSIT';
  address?: string;
}

export interface StockMovement extends BaseEntity {
  productId: string;
  product?: Product;
  locationId: string;
  location?: Location;
  quantity: number;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT';
  reference?: string;
  date: string;
}

// ========== SALES MODULE ==========

export interface Partner extends BaseEntity {
  name: string;
  type: 'customer' | 'vendor' | 'both';
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
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
  refresh_token?: string;
  user: User;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

// User DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  tenantId: string;
  branchId?: string;
  roles?: string[];
}

export interface UpdateUserDto {
  email?: string;
  isActive?: boolean;
  branchId?: string;
  roles?: string[];
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
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentId?: string;
}

export interface UpdateAccountDto {
  code?: string;
  name?: string;
  type?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentId?: string;
  isActive?: boolean;
}

// Journal Entry DTOs
export interface CreateJournalEntryDto {
  reference: string;
  transactionDate: string;
  description?: string;
  lines: CreateJournalLineDto[];
}

export interface CreateJournalLineDto {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
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

// Product DTOs
export interface CreateProductDto {
  name: string;
  sku: string;
  description?: string;
  type: 'PRODUCT' | 'SERVICE';
  category?: string;
  unitPrice: number;
  costPrice: number;
  uomId?: string;
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  description?: string;
  type?: 'PRODUCT' | 'SERVICE';
  category?: string;
  unitPrice?: number;
  costPrice?: number;
  uomId?: string;
  isActive?: boolean;
}

// Partner DTOs
export interface CreatePartnerDto {
  name: string;
  type: 'customer' | 'vendor' | 'both';
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTermId?: string;
}

export interface UpdatePartnerDto {
  name?: string;
  type?: 'customer' | 'vendor' | 'both';
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTermId?: string;
}
