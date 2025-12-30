# API Hooks Implementation - Complete

## Overview

All Identity and Finance module API hooks have been successfully implemented and are ready for use in UI components.

## Files Created

### Identity Module

#### Query Hooks (`src/lib/api/queries/useIdentity.ts`)

- ✅ `useUsers(filters?)` - Fetch paginated list of users with optional filters
- ✅ `useUser(id)` - Fetch single user by ID
- ✅ `useRoles()` - Fetch list of all roles
- ✅ `useRole(id)` - Fetch single role with permissions
- ✅ `useTenants()` - Fetch list of tenants (admin only)
- ✅ `useTenant(id)` - Fetch single tenant by ID

#### Mutation Hooks (`src/lib/api/mutations/useIdentity.ts`)

- ✅ `useCreateUser()` - Create new user
- ✅ `useUpdateUser()` - Update existing user
- ✅ `useDeleteUser()` - Delete user (soft delete)
- ✅ `useCreateRole()` - Create new role
- ✅ `useUpdateRole()` - Update existing role
- ✅ `useAssignRolePermissions()` - Assign permissions to role
- ✅ `useCreateTenant()` - Create new tenant (admin only)
- ✅ `useUpdateTenant()` - Update existing tenant
- ✅ `useDeleteTenant()` - Delete tenant (soft delete)

### Finance Module

#### Query Hooks (`src/lib/api/queries/useFinance.ts`)

- ✅ `useAccounts()` - Fetch chart of accounts
- ✅ `useAccount(id)` - Fetch single account by ID
- ✅ `useJournalEntries(filters?)` - Fetch journal entries with filters
- ✅ `useJournalEntry(id)` - Fetch single journal entry
- ✅ `useTrialBalance(startDate?, endDate?)` - Fetch trial balance report
- ✅ `useGeneralLedger(accountId?, startDate?, endDate?)` - Fetch general ledger report
- ✅ `usePaymentTerms()` - Fetch payment terms
- ✅ `usePaymentTerm(id)` - Fetch single payment term

#### Mutation Hooks (`src/lib/api/mutations/useFinance.ts`)

- ✅ `useCreateAccount()` - Create new account
- ✅ `useUpdateAccount()` - Update existing account
- ✅ `useDeleteAccount()` - Delete account (soft delete)
- ✅ `useCreateJournalEntry()` - Create new journal entry with lines
- ✅ `usePostJournalEntry()` - Post journal entry (DRAFT → POSTED)
- ✅ `useDeleteJournalEntry()` - Delete journal entry
- ✅ `useCreatePaymentTerm()` - Create payment term
- ✅ `useUpdatePaymentTerm()` - Update payment term
- ✅ `useDeletePaymentTerm()` - Delete payment term

## Key Features

### 1. Type Safety

All hooks are fully typed using TypeScript interfaces from `api.types.ts`:

- Request DTOs (CreateUserDto, UpdateAccountDto, etc.)
- Response types (User, Account, JournalEntry, etc.)
- Paginated responses (PaginatedResponse<T>)
- Report types (TrialBalanceEntry, GeneralLedgerEntry)

### 2. Query Key Management

All hooks use the centralized query key factory from `query-keys.ts`:

- Consistent cache key patterns
- Easy cache invalidation
- Proper filter-based caching

### 3. Automatic Cache Invalidation

Mutations automatically invalidate related queries:

- Create user → invalidates `users.all`
- Update user → invalidates `users.all` + `users.detail(id)`
- Post journal entry → invalidates journal entries + financial reports
- This ensures UI stays in sync with backend

### 4. Multi-Tenant Support

All API calls automatically include:

- `x-tenant-id` header (from authStore)
- `Authorization: Bearer <token>` header
- Proper error handling for 401/403 responses

### 5. Conditional Queries

Detail queries use `enabled` flag:

```typescript
useUser(id); // Only fetches when id is truthy
useAccount(id); // Prevents unnecessary API calls
```

### 6. Error Handling

All hooks integrate with TanStack Query error handling:

- `isError` flag
- `error` object with axios error details
- Automatic retry on network failures (3 times)

## Usage Examples

### Identity Module

#### Fetch Users List

```typescript
import { useUsers } from '@/lib/api/queries/useIdentity';

const UsersPage = () => {
  const { data, isLoading, error } = useUsers({
    search: 'john',
    isActive: true
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.items.map(user => (
        <div key={user.id}>{user.email}</div>
      ))}
    </div>
  );
};
```

#### Create User

```typescript
import { useCreateUser } from '@/lib/api/mutations/useIdentity';

const CreateUserForm = () => {
  const createUser = useCreateUser();

  const handleSubmit = async (data: CreateUserDto) => {
    try {
      const user = await createUser.mutateAsync(data);
      console.log('User created:', user);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={createUser.isPending}>
        {createUser.isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
};
```

#### Update User

```typescript
import { useUpdateUser } from '@/lib/api/mutations/useIdentity';

const EditUserForm = ({ userId }: { userId: string }) => {
  const updateUser = useUpdateUser();

  const handleSubmit = async (data: UpdateUserDto) => {
    await updateUser.mutateAsync({ id: userId, data });
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
};
```

### Finance Module

#### Fetch Chart of Accounts

```typescript
import { useAccounts } from '@/lib/api/queries/useFinance';

const ChartOfAccountsPage = () => {
  const { data: accounts, isLoading } = useAccounts();

  if (isLoading) return <div>Loading accounts...</div>;

  return (
    <div>
      {accounts?.map(account => (
        <div key={account.id}>
          {account.code} - {account.name} ({account.type})
        </div>
      ))}
    </div>
  );
};
```

#### Create Journal Entry

```typescript
import { useCreateJournalEntry } from '@/lib/api/mutations/useFinance';

const CreateJournalForm = () => {
  const createEntry = useCreateJournalEntry();

  const handleSubmit = async (data: CreateJournalEntryDto) => {
    const entry = await createEntry.mutateAsync(data);
    console.log('Journal entry created:', entry);
  };

  return <form onSubmit={handleSubmit}>{/* Form */}</form>;
};
```

#### Trial Balance Report

```typescript
import { useTrialBalance } from '@/lib/api/queries/useFinance';
import { useState } from 'react';

const TrialBalancePage = () => {
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();

  const { data: trialBalance, isLoading } = useTrialBalance(startDate, endDate);

  return (
    <div>
      <h1>Trial Balance</h1>
      {/* Date filters */}
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th>Debit</th>
            <th>Credit</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {trialBalance?.map(entry => (
            <tr key={entry.accountId}>
              <td>{entry.accountName}</td>
              <td>{entry.debit}</td>
              <td>{entry.credit}</td>
              <td>{entry.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## Build Status

✅ **Build Successful** (10.68s)

- No TypeScript errors
- No ESLint errors
- All imports correctly ordered
- Type safety verified

## Next Steps

### Task 3: Update LoginPage

Update `src/features/auth/pages/LoginPage.tsx` to use `useLogin()` hook:

- Replace mock login with real backend authentication
- Add loading state (`loginMutation.isPending`)
- Add error handling (`loginMutation.isError`)
- Show error messages on failure

### Task 4: Create Identity Module UI

Create feature pages in `src/features/identity/`:

- `pages/UsersListPage.tsx` - List all users with filters
- `pages/UserDetailPage.tsx` - View/edit user details
- `pages/RolesListPage.tsx` - List all roles
- `pages/RoleDetailPage.tsx` - View/edit role and assign permissions
- `pages/TenantsListPage.tsx` - List all tenants (admin only)
- `pages/TenantDetailPage.tsx` - View/edit tenant details
- `components/UserForm.tsx` - Create/edit user form
- `components/RoleForm.tsx` - Create/edit role form
- `components/PermissionCheckboxes.tsx` - Permission assignment UI
- `components/TenantForm.tsx` - Create/edit tenant form

### Task 5: Create Finance Module UI

Create feature pages in `src/features/finance/`:

- `pages/ChartOfAccountsPage.tsx` - View chart of accounts
- `pages/AccountDetailPage.tsx` - View/edit account
- `pages/JournalEntriesListPage.tsx` - List journal entries
- `pages/CreateJournalEntryPage.tsx` - Create new journal entry
- `pages/TrialBalancePage.tsx` - Trial balance report with filters
- `pages/GeneralLedgerPage.tsx` - General ledger report with filters
- `pages/PaymentTermsPage.tsx` - Manage payment terms
- `components/AccountForm.tsx` - Create/edit account form
- `components/JournalLineItem.tsx` - Journal line input component
- `components/JournalEntryForm.tsx` - Journal entry form with balance validation
- `components/FinancialReportFilters.tsx` - Date/account filters for reports

### Task 6: End-to-End Testing

- Start backend: `cd /home/m/Projects/nest-erp && pnpm start:dev`
- Start frontend: `cd /home/m/Projects/nest-erp/frontend && pnpm dev`
- Test login with `admin@admin.local` / `Admin123!`
- Verify `x-tenant-id` header in DevTools Network tab
- Test RBAC route protection (403 for unauthorized access)
- Test API calls with tenant isolation
- Verify no cross-tenant data leakage

## Backend Integration

All hooks are configured to work with the NestJS ERP backend:

- **Base URL**: http://localhost:3000
- **Auth**: JWT tokens in Authorization header
- **Multi-Tenant**: x-tenant-id header on all requests
- **Permissions**: action:resource format (e.g., `create:user`)

## Testing Credentials

- **Admin Email**: admin@admin.local
- **Admin Password**: Admin123!
- **Tenant ID**: 019b69f9-f794-74ad-8732-c2b2b0c92104

## Documentation

See also:

- [Integration Complete](./INTEGRATION-COMPLETE.md) - Full integration guide
- [Backend Types](./src/types/api.types.ts) - All TypeScript interfaces
- [Backend Permissions](./src/lib/rbac/backend-permissions.ts) - Permission constants
- [Query Keys](./src/lib/api/query-keys.ts) - Query key factory
- [API Client](./src/lib/api/client.ts) - Axios instance with interceptors
