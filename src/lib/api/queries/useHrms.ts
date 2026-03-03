import { useQuery } from "@tanstack/react-query";

import type {
  Employee,
  EmploymentContract,
  PaginatedResponse,
} from "@/types/api.types";

import { apiClient } from "../client";
import { queryKeys } from "../query-keys";

// ========== EMPLOYEES ==========

/**
 * Fetch list of employees with optional filters
 * GET /hrms/employees
 */
export const useListEmployees = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: queryKeys.employees.list(filters),
    queryFn: () =>
      apiClient.get<PaginatedResponse<Employee>>("/hrms/employees", {
        params: filters,
      }),
  });
};

/**
 * Fetch single employee by ID
 * GET /hrms/employees/:id
 */
export const useGetEmployee = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => apiClient.get<Employee>(`/hrms/employees/${id}`),
    enabled: enabled && !!id,
  });
};

// ========== CONTRACTS ==========

/**
 * Fetch list of contracts with optional filters
 * GET /hrms/contracts
 */
export const useListContracts = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: queryKeys.contracts.list(filters),
    queryFn: () =>
      apiClient.get<PaginatedResponse<EmploymentContract>>("/hrms/contracts", {
        params: filters,
      }),
  });
};

/**
 * Fetch single contract by ID
 * GET /hrms/contracts/:id
 */
export const useGetContract = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.contracts.detail(id),
    queryFn: () => apiClient.get<EmploymentContract>(`/hrms/contracts/${id}`),
    enabled: enabled && !!id,
  });
};

/**
 * Fetch all contracts for a specific employee
 * GET /hrms/employees/:employeeId/contracts
 */
export const useGetEmployeeContracts = (employeeId: string) => {
  return useQuery({
    queryKey: queryKeys.contracts.byEmployee(employeeId),
    queryFn: () =>
      apiClient.get<EmploymentContract[]>(
        `/hrms/employees/${employeeId}/contracts`,
      ),
    enabled: !!employeeId,
  });
};
