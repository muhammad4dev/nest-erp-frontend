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
import { useActionState, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useUpdateContract } from "@/lib/api/mutations";
import { useGetContract } from "@/lib/api/queries";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type { UpdateContractDto } from "@/types/api.types";

import { createContractSchema } from "../schemas/contractSchema";

type ContractFormValues = {
  jobPosition: string;
  wage: string;
  startDate: string;
  endDate: string;
};

type FormState = {
  success: boolean;
  formError?: string;
  fieldErrors: Partial<Record<keyof ContractFormValues, string>>;
};

const initialValues: ContractFormValues = {
  jobPosition: "",
  wage: "",
  startDate: "",
  endDate: "",
};

const initialState: FormState = {
  success: false,
  fieldErrors: {},
};

export const ContractFormPage = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const { contractId } = useParams({
    from: "/$lang/app/hrms/contracts/$contractId/edit",
  });

  const [formValues, setFormValues] =
    useState<ContractFormValues>(initialValues);

  const { data: contract, isLoading, error } = useGetContract(contractId);
  const updateContract = useUpdateContract();

  useEffect(() => {
    if (!contract) return;
    setFormValues({
      jobPosition: contract.jobPosition || "",
      wage: String(contract.wage || ""),
      startDate: contract.startDate?.split("T")[0] || "",
      endDate: contract.endDate?.split("T")[0] || "",
    });
  }, [contract]);

  const submitAction = async (
    _previousState: FormState,
    formData: FormData,
  ): Promise<FormState> => {
    const rawWage = String(formData.get("wage") || "").trim();
    const wage = Number(rawWage);

    const parsed = createContractSchema.safeParse({
      jobPosition: String(formData.get("jobPosition") || "").trim(),
      wage,
      startDate: String(formData.get("startDate") || "").trim(),
      endDate: String(formData.get("endDate") || "").trim() || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof ContractFormValues, string>> = {};
      const flattened = parsed.error.flatten().fieldErrors;

      Object.entries(flattened).forEach(([key, errors]) => {
        if (!errors?.length) return;
        fieldErrors[key as keyof ContractFormValues] = errors[0];
      });

      return {
        success: false,
        fieldErrors,
      };
    }

    const payload: UpdateContractDto = {
      jobPosition: parsed.data.jobPosition,
      wage: parsed.data.wage,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate || undefined,
    };

    try {
      await updateContract.mutateAsync({ id: contractId, dto: payload });
      navigate({
        to: "/$lang/app/hrms/contracts/$contractId",
        params: { contractId },
      });

      return {
        success: true,
        fieldErrors: {},
      };
    } catch (submitError) {
      return {
        success: false,
        formError:
          submitError instanceof Error
            ? submitError.message
            : t("common.error"),
        fieldErrors: {},
      };
    }
  };

  const [state, formAction] = useActionState<FormState, FormData>(
    submitAction,
    initialState,
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !contract) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : t("common.error")}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 760, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Edit Contract
      </Typography>

      {state.formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.formError}
        </Alert>
      )}

      <Paper component="form" action={formAction} sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            name="jobPosition"
            label="Job Position"
            value={formValues.jobPosition}
            onChange={(e) =>
              setFormValues((prev) => ({
                ...prev,
                jobPosition: e.target.value,
              }))
            }
            error={Boolean(state.fieldErrors.jobPosition)}
            helperText={state.fieldErrors.jobPosition}
            required
            fullWidth
            disabled={updateContract.isPending}
          />

          <TextField
            name="wage"
            label="Wage"
            type="number"
            value={formValues.wage}
            onChange={(e) =>
              setFormValues((prev) => ({ ...prev, wage: e.target.value }))
            }
            error={Boolean(state.fieldErrors.wage)}
            helperText={state.fieldErrors.wage}
            required
            fullWidth
            disabled={updateContract.isPending}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              name="startDate"
              label="Start Date"
              type="date"
              value={formValues.startDate}
              onChange={(e) =>
                setFormValues((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              error={Boolean(state.fieldErrors.startDate)}
              helperText={state.fieldErrors.startDate}
              required
              fullWidth
              disabled={updateContract.isPending}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              name="endDate"
              label="End Date"
              type="date"
              value={formValues.endDate}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, endDate: e.target.value }))
              }
              error={Boolean(state.fieldErrors.endDate)}
              helperText={state.fieldErrors.endDate}
              fullWidth
              disabled={updateContract.isPending}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            sx={{ mt: 2 }}
          >
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              disabled={updateContract.isPending}
              onClick={() =>
                navigate({
                  to: "/$lang/app/hrms/contracts/$contractId",
                  params: { contractId },
                })
              }
            >
              {t("common.cancel")}
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={!updateContract.isPending ? <SaveIcon /> : undefined}
              disabled={updateContract.isPending}
            >
              {updateContract.isPending ? (
                <CircularProgress size={20} />
              ) : (
                t("common.save")
              )}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};
