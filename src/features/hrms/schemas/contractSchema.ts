import { z } from "zod";

/**
 * Validation schema for creating a new contract
 */
export const createContractSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  wage: z.number().positive("Wage must be greater than 0"),
  jobPosition: z.string().min(1, "Job position is required"),
});

export type CreateContractFormData = z.infer<typeof createContractSchema>;

/**
 * Validation schema for updating an existing contract
 */
export const updateContractSchema = createContractSchema.partial();

export type UpdateContractFormData = z.infer<typeof updateContractSchema>;
