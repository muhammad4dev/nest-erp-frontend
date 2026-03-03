import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  Employee,
  EmploymentContract,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateContractDto,
  UpdateContractDto,
} from "@/types/api.types";

import { apiClient } from "../client";
import { queryKeys } from "../query-keys";

// ========== EMPLOYEES ==========

/**
 * Create a new employee
 * POST /hrms/employees
 */
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateEmployeeDto) =>
      apiClient.post<Employee>("/hrms/employees", dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.employees.all,
      });
    },
  });
};

/**
 * Update an existing employee
 * PUT /hrms/employees/:id
 */
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateEmployeeDto }) =>
      apiClient.put<Employee>(`/hrms/employees/${id}`, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.employees.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.employees.detail(id),
      });
    },
  });
};

/**
 * Delete an employee
 * DELETE /hrms/employees/:id
 */
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/hrms/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.employees.all,
      });
    },
  });
};

// ========== CONTRACTS ==========

/**
 * Create a new contract for an employee
 * POST /hrms/employees/:employeeId/contracts
 */
export const useCreateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      employeeId,
      dto,
    }: {
      employeeId: string;
      dto: CreateContractDto;
    }) =>
      apiClient.post<EmploymentContract>(
        `/hrms/employees/${employeeId}/contracts`,
        dto,
      ),
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contracts.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.contracts.byEmployee(employeeId),
      });
    },
  });
};

/**
 * Activate a draft contract
 * POST /hrms/contracts/:contractId/activate
 */
export const useActivateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contractId: string) =>
      apiClient.post<EmploymentContract>(
        `/hrms/contracts/${contractId}/activate`,
        {},
      ),
    onSuccess: (_, contractId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contracts.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.contracts.detail(contractId),
      });
    },
  });
};

/**
 * Update an existing contract
 * PUT /hrms/contracts/:id
 */
export const useUpdateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateContractDto }) =>
      apiClient.put<EmploymentContract>(`/hrms/contracts/${id}`, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contracts.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.contracts.detail(id),
      });
    },
  });
};

/**
 * Delete a contract
 * DELETE /hrms/contracts/:id
 */
export const useDeleteContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/hrms/contracts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contracts.all,
      });
    },
  });
};
