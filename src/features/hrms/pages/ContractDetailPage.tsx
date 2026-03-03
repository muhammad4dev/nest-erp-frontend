import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { useActivateContract, useDeleteContract } from "@/lib/api/mutations";
import { useGetContract } from "@/lib/api/queries";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import { ContractStatus } from "@/types/api.types";

import { ContractStatusBadge } from "../components";

export const ContractDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const { contractId } = useParams({
    from: "/$lang/app/hrms/contracts/$contractId",
  });

  const { data: contract, isLoading, error } = useGetContract(contractId);
  const activateContract = useActivateContract();
  const deleteContract = useDeleteContract();

  const handleActivate = async () => {
    await activateContract.mutateAsync(contractId);
  };

  const handleDelete = async () => {
    if (!confirm(t("common.confirmDelete"))) return;
    await deleteContract.mutateAsync(contractId);
    navigate({ to: "/$lang/app/hrms/contracts" });
  };

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
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h4">{contract.jobPosition}</Typography>
            <Typography variant="body2" color="text.secondary">
              Contract #{contract.id}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate({ to: "/$lang/app/hrms/contracts" })}
            >
              {t("common.back")}
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() =>
                navigate({
                  to: "/$lang/app/hrms/contracts/$contractId/edit",
                  params: { contractId },
                })
              }
            >
              {t("common.edit")}
            </Button>
            {contract.status === ContractStatus.DRAFT && (
              <Button
                variant="outlined"
                color="success"
                startIcon={<PlayArrowIcon />}
                onClick={handleActivate}
                disabled={activateContract.isPending}
              >
                Activate
              </Button>
            )}
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              disabled={deleteContract.isPending}
            >
              {t("common.delete")}
            </Button>
          </Stack>
        </Stack>

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <ContractStatusBadge status={contract.status} />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Employee
                </Typography>
                <Typography variant="body1">
                  {contract.employee
                    ? `${contract.employee.firstName} ${contract.employee.lastName}`
                    : contract.employeeId}
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1">
                    {contract.startDate?.split("T")[0]}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography variant="body1">
                    {contract.endDate?.split("T")[0] || "Ongoing"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Wage
                  </Typography>
                  <Typography variant="body1">{contract.wage}</Typography>
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};
