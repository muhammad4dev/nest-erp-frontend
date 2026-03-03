import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useParams } from "@tanstack/react-router";
import { useActionState, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useActivateContract,
  useCreateContract,
  useDeleteContract,
} from "@/lib/api/mutations";
import { useGetEmployee, useGetEmployeeContracts } from "@/lib/api/queries";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import { ContractStatus } from "@/types/api.types";

import { ContractStatusBadge } from "../components";
import { createContractSchema } from "../schemas/contractSchema";

type FormValues = {
  jobPosition: string;
  wage: string;
  startDate: string;
  endDate: string;
};

type FormState = {
  success: boolean;
  formError?: string;
  fieldErrors: Partial<Record<keyof FormValues, string>>;
};

const initialValues: FormValues = {
  jobPosition: "",
  wage: "",
  startDate: "",
  endDate: "",
};

const initialState: FormState = {
  success: false,
  fieldErrors: {},
};

export const EmployeeContractsPage = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const { employeeId } = useParams({
    from: "/$lang/app/hrms/employees/$employeeId/contracts",
  });

  const [values, setValues] = useState<FormValues>(initialValues);

  const { data: employee } = useGetEmployee(employeeId);
  const {
    data: contracts,
    isLoading,
    error,
  } = useGetEmployeeContracts(employeeId);

  const createContract = useCreateContract();
  const activateContract = useActivateContract();
  const deleteContract = useDeleteContract();

  const submitAction = async (
    _state: FormState,
    formData: FormData,
  ): Promise<FormState> => {
    const wage = Number(String(formData.get("wage") || "").trim());

    const parsed = createContractSchema.safeParse({
      jobPosition: String(formData.get("jobPosition") || "").trim(),
      wage,
      startDate: String(formData.get("startDate") || "").trim(),
      endDate: String(formData.get("endDate") || "").trim() || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
      const flattened = parsed.error.flatten().fieldErrors;

      Object.entries(flattened).forEach(([key, errors]) => {
        if (!errors?.length) return;
        fieldErrors[key as keyof FormValues] = errors[0];
      });

      return {
        success: false,
        fieldErrors,
      };
    }

    try {
      await createContract.mutateAsync({
        employeeId,
        dto: {
          jobPosition: parsed.data.jobPosition,
          wage: parsed.data.wage,
          startDate: parsed.data.startDate,
          endDate: parsed.data.endDate || undefined,
        },
      });

      setValues(initialValues);

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

  const [formState, formAction] = useActionState<FormState, FormData>(
    submitAction,
    initialState,
  );

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : t("common.error")}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Box>
            <Typography variant="h4">Employee Contracts</Typography>
            <Typography variant="body2" color="text.secondary">
              {employee
                ? `${employee.firstName} ${employee.lastName} (${employee.code})`
                : employeeId}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              navigate({
                to: "/$lang/app/hrms/employees/$employeeId",
                params: { employeeId },
              })
            }
          >
            {t("common.back")}
          </Button>
        </Stack>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Create Contract
            </Typography>

            {formState.formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formState.formError}
              </Alert>
            )}

            <Box component="form" action={formAction}>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    name="jobPosition"
                    label="Job Position"
                    value={values.jobPosition}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        jobPosition: e.target.value,
                      }))
                    }
                    error={Boolean(formState.fieldErrors.jobPosition)}
                    helperText={formState.fieldErrors.jobPosition}
                    fullWidth
                    required
                    disabled={createContract.isPending}
                  />

                  <TextField
                    name="wage"
                    label="Wage"
                    type="number"
                    value={values.wage}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, wage: e.target.value }))
                    }
                    error={Boolean(formState.fieldErrors.wage)}
                    helperText={formState.fieldErrors.wage}
                    fullWidth
                    required
                    disabled={createContract.isPending}
                  />
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    name="startDate"
                    label="Start Date"
                    type="date"
                    value={values.startDate}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    error={Boolean(formState.fieldErrors.startDate)}
                    helperText={formState.fieldErrors.startDate}
                    fullWidth
                    required
                    disabled={createContract.isPending}
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    name="endDate"
                    label="End Date"
                    type="date"
                    value={values.endDate}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    error={Boolean(formState.fieldErrors.endDate)}
                    helperText={formState.fieldErrors.endDate}
                    fullWidth
                    disabled={createContract.isPending}
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>

                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={createContract.isPending}
                  >
                    {createContract.isPending ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Create Contract"
                    )}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Contracts
            </Typography>

            {isLoading ? (
              <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </Box>
            ) : contracts && contracts.length > 0 ? (
              <Stack spacing={1.5}>
                {contracts.map((contract) => (
                  <Box
                    key={contract.id}
                    sx={{
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "stretch", sm: "center" }}
                      spacing={1.5}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {contract.jobPosition}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {contract.startDate?.split("T")[0]} -{" "}
                          {contract.endDate?.split("T")[0] || "Ongoing"}
                        </Typography>
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          Wage: {contract.wage}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <ContractStatusBadge status={contract.status} />

                        {contract.status === ContractStatus.DRAFT && (
                          <Button
                            size="small"
                            startIcon={<PlayArrowIcon />}
                            onClick={() => activateContract.mutate(contract.id)}
                            disabled={activateContract.isPending}
                          >
                            Activate
                          </Button>
                        )}

                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() =>
                            navigate({
                              to: "/$lang/app/hrms/contracts/$contractId",
                              params: { contractId: contract.id },
                            })
                          }
                        >
                          View
                        </Button>

                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() =>
                            navigate({
                              to: "/$lang/app/hrms/contracts/$contractId/edit",
                              params: { contractId: contract.id },
                            })
                          }
                        >
                          Edit
                        </Button>

                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={async () => {
                            if (!confirm(t("common.confirmDelete"))) return;
                            await deleteContract.mutateAsync(contract.id);
                          }}
                          disabled={deleteContract.isPending}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {t("common.noData")}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};
