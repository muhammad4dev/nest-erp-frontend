import { z } from "zod";

/**
 * Validation schema for creating a new employee
 */
export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  jobTitle: z.string().min(1, "Job title is required"),
  department: z.string().min(1, "Department is required"),
  hireDate: z.string().min(1, "Hire date is required"),
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;

/**
 * Validation schema for updating an existing employee
 */
export const updateEmployeeSchema = createEmployeeSchema.partial();

export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;
