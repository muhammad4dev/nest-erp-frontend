import { useQuery } from "@tanstack/react-query";

import type {
  Account,
  JournalEntry,
  PaymentTerm,
  FiscalPeriod,
  PaginatedResponse,
  TrialBalanceEntry,
  GeneralLedgerEntry,
} from "@/types/api.types";

import { apiClient } from "../client";
import { queryKeys } from "../query-keys";
import type { JournalEntryListFilters } from "../query-keys";

/**
 * Fetch chart of accounts
 * GET /finance/accounts
 */
export const useAccounts = () => {
  return useQuery({
    queryKey: queryKeys.accounts.chartOfAccounts,
    queryFn: async () => {
      const response = await apiClient.get<Account[]>("/finance/accounts");
      return response;
    },
  });
};

/**
 * Fetch single account by ID
 * GET /finance/accounts/:id
 */
export const useAccount = (id: string) => {
  return useQuery({
    queryKey: queryKeys.accounts.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<Account>(`/finance/accounts/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

/**
 * Fetch journal entries with filters
 * GET /finance/journal-entries
 */
export const useJournalEntries = (filters?: JournalEntryListFilters) => {
  return useQuery({
    queryKey: queryKeys.journalEntries.list(filters),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<JournalEntry>>(
        "/finance/journal-entries",
        { params: filters },
      );
      return response;
    },
  });
};

/**
 * Fetch single journal entry by ID
 * GET /finance/journal-entries/:id
 */
export const useJournalEntry = (id: string) => {
  return useQuery({
    queryKey: queryKeys.journalEntries.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<JournalEntry>(
        `/finance/journal-entries/${id}`,
      );
      return response;
    },
    enabled: !!id,
  });
};

/**
 * Fetch fiscal periods
 * GET /finance/periods
 */
export const useFiscalPeriods = () => {
  return useQuery({
    queryKey: ["fiscal-periods"],
    queryFn: async () => {
      const response = await apiClient.get<FiscalPeriod[]>("/finance/periods");
      return response;
    },
  });
};

/**
 * Fetch current fiscal period
 * GET /finance/periods/current
 */
export const useCurrentFiscalPeriod = () => {
  return useQuery({
    queryKey: ["fiscal-periods", "current"],
    queryFn: async () => {
      const response = await apiClient.get<FiscalPeriod>(
        "/finance/periods/current",
      );
      return response;
    },
  });
};

/**
 * Fetch single fiscal period by ID
 * GET /finance/periods/:id
 */
export const useFiscalPeriod = (id: string) => {
  return useQuery({
    queryKey: ["fiscal-periods", id],
    queryFn: async () => {
      const response = await apiClient.get<FiscalPeriod>(
        `/finance/periods/${id}`,
      );
      return response;
    },
    enabled: !!id,
  });
};

/**
 * Fetch trial balance report
 * GET /finance/reports/trial-balance
 */
export const useTrialBalance = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: queryKeys.financialReports.trialBalance(startDate, endDate),
    queryFn: async () => {
      const response = await apiClient.get<TrialBalanceEntry[]>(
        "/finance/reports/trial-balance",
        {
          params: { startDate, endDate },
        },
      );
      return response;
    },
    enabled: Boolean(startDate && endDate),
  });
};

/**
 * Fetch general ledger report
 * GET /finance/reports/general-ledger
 */
export const useGeneralLedger = (
  accountId?: string,
  startDate?: string,
  endDate?: string,
) => {
  return useQuery({
    queryKey: queryKeys.financialReports.generalLedger(
      accountId,
      startDate,
      endDate,
    ),
    queryFn: async () => {
      const response = await apiClient.get<GeneralLedgerEntry[]>(
        "/finance/reports/general-ledger",
        {
          params: { accountId, startDate, endDate },
        },
      );
      return response;
    },
  });
};

/**
 * Fetch payment terms
 * GET /finance/payment-terms
 */
export const usePaymentTerms = () => {
  return useQuery({
    queryKey: queryKeys.paymentTerms.list(),
    queryFn: async () => {
      const response = await apiClient.get<PaymentTerm[]>(
        "/finance/payment-terms",
      );
      return response;
    },
  });
};

/**
 * Fetch single payment term by ID
 * GET /finance/payment-terms/:id
 */
export const usePaymentTerm = (id: string) => {
  return useQuery({
    queryKey: queryKeys.paymentTerms.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<PaymentTerm>(
        `/finance/payment-terms/${id}`,
      );
      return response;
    },
    enabled: !!id,
  });
};
