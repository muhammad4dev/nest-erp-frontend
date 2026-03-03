import { Cancel as CancelIcon, Save as SaveIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useParams } from "@tanstack/react-router";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useCreateEmployee, useUpdateEmployee } from "@/lib/api/mutations";
import { useGetEmployee } from "@/lib/api/queries";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type { CreateEmployeeDto } from "@/types/api.types";

import { createEmployeeSchema } from "../schemas/employeeSchema";

type EmployeeFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  hireDate: string;
};

type FormState = {
  success: boolean;
  formError?: string;
  fieldErrors: Partial<Record<keyof EmployeeFormValues, string>>;
};

const initialValues: EmployeeFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  jobTitle: "",
  department: "",
  hireDate: "",
};

const initialState: FormState = {
  success: false,
  formError: undefined,
  fieldErrors: {},
};

export const EmployeeFormPage = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const params = useParams({ strict: false }) as {
    employeeId?: string;
  };

  const employeeId = params.employeeId;
  const isEditing = Boolean(employeeId);

  const [formValues, setFormValues] =
    useState<EmployeeFormValues>(initialValues);

  const { data: employeeData, isLoading: isLoadingEmployee } = useGetEmployee(
    employeeId || "",
    isEditing,
  );

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

  const isSubmitting = createEmployee.isPending || updateEmployee.isPending;

  useEffect(() => {
    if (!employeeData || !isEditing) return;

    setFormValues({
      firstName: employeeData.firstName || "",
      lastName: employeeData.lastName || "",
      email: employeeData.email || "",
      phone: employeeData.phone || "",
      jobTitle: employeeData.jobTitle || "",
      department: employeeData.department || "",
      hireDate: employeeData.hireDate?.split("T")[0] || "",
    });
  }, [employeeData, isEditing]);

  const submitAction = async (
    _previousState: FormState,
    formData: FormData,
  ): Promise<FormState> => {
    const values: EmployeeFormValues = {
      firstName: String(formData.get("firstName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      jobTitle: String(formData.get("jobTitle") || "").trim(),
      department: String(formData.get("department") || "").trim(),
      hireDate: String(formData.get("hireDate") || "").trim(),
    };

    const parsed = createEmployeeSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof EmployeeFormValues, string>> = {};
      const flattened = parsed.error.flatten().fieldErrors;

      Object.entries(flattened).forEach(([key, errors]) => {
        if (!errors?.length) return;
        fieldErrors[key as keyof EmployeeFormValues] = errors[0];
      });

      return {
        success: false,
        fieldErrors,
      };
    }

    const payload: CreateEmployeeDto = {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone || undefined,
      jobTitle: parsed.data.jobTitle,
      department: parsed.data.department,
      hireDate: parsed.data.hireDate,
    };

    try {
      if (isEditing && employeeId) {
        await updateEmployee.mutateAsync({
          id: employeeId,
          dto: payload,
        });

        navigate({
          to: "/$lang/app/hrms/employees/$employeeId",
          params: { employeeId },
        });
      } else {
        const created = await createEmployee.mutateAsync(payload);

        navigate({
          to: "/$lang/app/hrms/employees/$employeeId",
          params: { employeeId: created.id },
        });
      }

      return {
        success: true,
        fieldErrors: {},
      };
    } catch (error) {
      return {
        success: false,
        formError: error instanceof Error ? error.message : t("common.error"),
        fieldErrors: {},
      };
    }
  };

  const [state, formAction] = useActionState<FormState, FormData>(
    submitAction,
    initialState,
  );

  const pageTitle = useMemo(() => {
    return isEditing
      ? `${t("common.edit")} ${t("nav.employees")}`
      : `${t("common.create")} ${t("nav.employees")}`;
  }, [isEditing, t]);

  if (isEditing && isLoadingEmployee) {
    return (
      <Box
        sx={{
          minHeight: 360,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {pageTitle}
      </Typography>

      {state.formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.formError}
        </Alert>
      )}

      <Paper component="form" action={formAction} sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              name="firstName"
              label="First Name"
              value={formValues.firstName}
              onChange={(e) =>
                setFormValues((prev) => ({
                  ...prev,
                  firstName: e.target.value,
                }))
              }
              error={Boolean(state.fieldErrors.firstName)}
              helperText={state.fieldErrors.firstName}
              fullWidth
              required
              disabled={isSubmitting}
            />

            <TextField
              name="lastName"
              label="Last Name"
              value={formValues.lastName}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, lastName: e.target.value }))
              }
              error={Boolean(state.fieldErrors.lastName)}
              helperText={state.fieldErrors.lastName}
              fullWidth
              required
              disabled={isSubmitting}
            />
          </Stack>

          <TextField
            name="email"
            label="Email"
            type="email"
            value={formValues.email}
            onChange={(e) =>
              setFormValues((prev) => ({ ...prev, email: e.target.value }))
            }
            error={Boolean(state.fieldErrors.email)}
            helperText={state.fieldErrors.email}
            fullWidth
            required
            disabled={isSubmitting}
          />

          <TextField
            name="phone"
            label="Phone"
            value={formValues.phone}
            onChange={(e) =>
              setFormValues((prev) => ({ ...prev, phone: e.target.value }))
            }
            error={Boolean(state.fieldErrors.phone)}
            helperText={state.fieldErrors.phone}
            fullWidth
            disabled={isSubmitting}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              name="jobTitle"
              label="Job Title"
              value={formValues.jobTitle}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, jobTitle: e.target.value }))
              }
              error={Boolean(state.fieldErrors.jobTitle)}
              helperText={state.fieldErrors.jobTitle}
              fullWidth
              required
              disabled={isSubmitting}
            />

            <TextField
              name="department"
              label="Department"
              value={formValues.department}
              onChange={(e) =>
                setFormValues((prev) => ({
                  ...prev,
                  department: e.target.value,
                }))
              }
              error={Boolean(state.fieldErrors.department)}
              helperText={state.fieldErrors.department}
              fullWidth
              required
              disabled={isSubmitting}
            />
          </Stack>

          <TextField
            name="hireDate"
            label="Hire Date"
            type="date"
            value={formValues.hireDate}
            onChange={(e) =>
              setFormValues((prev) => ({ ...prev, hireDate: e.target.value }))
            }
            error={Boolean(state.fieldErrors.hireDate)}
            helperText={state.fieldErrors.hireDate}
            fullWidth
            required
            disabled={isSubmitting}
            InputLabelProps={{ shrink: true }}
          />

          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            sx={{ mt: 2 }}
          >
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => {
                if (isEditing && employeeId) {
                  navigate({
                    to: "/$lang/app/hrms/employees/$employeeId",
                    params: { employeeId },
                  });
                  return;
                }

                navigate({ to: "/$lang/app/hrms/employees" });
              }}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={!isSubmitting ? <SaveIcon /> : undefined}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={20} /> : t("common.save")}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};
