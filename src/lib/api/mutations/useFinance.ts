import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  Account,
  JournalEntry,
  PaymentTerm,
  FiscalPeriod,
  CreateAccountDto,
  UpdateAccountDto,
  CreateJournalEntryDto,
  CreateFiscalPeriodDto,
  UpdateFiscalPeriodDto,
  ClosePeriodDto,
  CreatePaymentTermDto,
  UpdatePaymentTermDto,
} from "@/types/api.types";

import { apiClient } from "../client";
import { queryKeys } from "../query-keys";

/**
 * Create new account in chart of accounts
 * POST /finance/accounts
 */
export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAccountDto) => {
      const response = await apiClient.post<Account>("/finance/accounts", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
};

/**
 * Update existing account
 * put /finance/accounts/:id
 */
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAccountDto;
    }) => {
      const response = await apiClient.put<Account>(
        `/finance/accounts/${id}`,
        data,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.detail(variables.id),
      });
    },
  });
};

/**
 * Delete account (soft delete)
 * DELETE /finance/accounts/:id
 */
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/finance/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
};

/**
 * Create new journal entry with lines
 * POST /finance/journal-entries
 */
export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJournalEntryDto) => {
      const response = await apiClient.post<JournalEntry>(
        "/finance/journal-entries",
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.journalEntries.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.financialReports.trialBalance(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.financialReports.generalLedger(),
      });
    },
  });
};

/**
 * Post journal entry (change status from DRAFT to POSTED)
 * POST /finance/journal-entries/:id/post
 */
export const usePostJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<JournalEntry>(
        `/finance/journal-entries/${id}/post`,
      );
      return response;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.journalEntries.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.journalEntries.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.financialReports.trialBalance(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.financialReports.generalLedger(),
      });
    },
  });
};

/**
 * Delete journal entry
 * DELETE /finance/journal-entries/:id
 */
export const useDeleteJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/finance/journal-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.journalEntries.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.financialReports.trialBalance(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.financialReports.generalLedger(),
      });
    },
  });
};

/**
 * Create fiscal period
 * POST /finance/periods
 */
export const useCreateFiscalPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFiscalPeriodDto) => {
      const response = await apiClient.post<FiscalPeriod>(
        "/finance/periods",
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscal-periods"] });
    },
  });
};

/**
 * Update fiscal period
 * PUT /finance/periods/:id
 */
export const useUpdateFiscalPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFiscalPeriodDto;
    }) => {
      const response = await apiClient.put<FiscalPeriod>(
        `/finance/periods/${id}`,
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscal-periods"] });
    },
  });
};

/**
 * Close fiscal period
 * POST /finance/periods/:id/close
 */
export const useCloseFiscalPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: ClosePeriodDto }) => {
      const response = await apiClient.post<FiscalPeriod>(
        `/finance/periods/${id}/close`,
        data || {},
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscal-periods"] });
    },
  });
};

/**
 * Reopen fiscal period
 * POST /finance/periods/:id/reopen
 */
export const useReopenFiscalPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<FiscalPeriod>(
        `/finance/periods/${id}/reopen`,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscal-periods"] });
    },
  });
};

/**
 * Create payment term
 * POST /finance/payment-terms
 */
export const useCreatePaymentTerm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePaymentTermDto) => {
      const response = await apiClient.post<PaymentTerm>(
        "/finance/payment-terms",
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentTerms.all });
    },
  });
};

/**
 * Update payment term
 * put /finance/payment-terms/:id
 */
export const useUpdatePaymentTerm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePaymentTermDto;
    }) => {
      const response = await apiClient.put<PaymentTerm>(
        `/finance/payment-terms/${id}`,
        data,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentTerms.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.paymentTerms.detail(variables.id),
      });
    },
  });
};

/**
 * Delete payment term
 * DELETE /finance/payment-terms/:id
 */
export const useDeletePaymentTerm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/finance/payment-terms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentTerms.all });
    },
  });
};
