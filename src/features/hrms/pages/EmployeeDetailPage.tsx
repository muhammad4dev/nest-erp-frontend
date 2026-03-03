import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
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
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useDeleteEmployee } from "@/lib/api/mutations";
import { useGetEmployee, useGetEmployeeContracts } from "@/lib/api/queries";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";

import { ContractStatusBadge, EmployeeStatusBadge } from "../components";

export const EmployeeDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const { employeeId } = useParams({
    from: "/$lang/app/hrms/employees/$employeeId",
  });
  const [activeTab, setActiveTab] = useState(0);

  const { data: employee, isLoading, error } = useGetEmployee(employeeId);
  const { data: contracts, isLoading: isLoadingContracts } =
    useGetEmployeeContracts(employeeId);
  const deleteEmployee = useDeleteEmployee();

  const handleDelete = async () => {
    if (!confirm(t("common.confirmDelete"))) return;

    try {
      await deleteEmployee.mutateAsync(employeeId);
      navigate({ to: "/$lang/app/hrms/employees" });
    } catch {
      // no-op, error is reflected by mutation state in future enhancements
    }
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

  if (error || !employee) {
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
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Box>
            <Typography variant="h4">
              {employee.firstName} {employee.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {employee.code}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate({ to: "/$lang/app/hrms/employees" })}
            >
              {t("common.back")}
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() =>
                navigate({
                  to: "/$lang/app/hrms/employees/$employeeId/edit",
                  params: { employeeId },
                })
              }
            >
              {t("common.edit")}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              disabled={deleteEmployee.isPending}
            >
              {t("common.delete")}
            </Button>
          </Stack>
        </Stack>

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{employee.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {employee.phone || "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <EmployeeStatusBadge isActive={employee.isActive} />
                  </Box>
                </Box>
              </Stack>

              <Divider />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Job Title
                  </Typography>
                  <Typography variant="body1">
                    {employee.jobTitle || "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1">
                    {employee.department || "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Hire Date
                  </Typography>
                  <Typography variant="body1">
                    {employee.hireDate?.split("T")[0] || "-"}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
            >
              <Tab label="Contracts" />
              <Tab label="Activity" />
            </Tabs>

            <Divider sx={{ mb: 2 }} />

            {activeTab === 0 && (
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    size="small"
                    startIcon={<ReceiptLongIcon />}
                    onClick={() =>
                      navigate({
                        to: "/$lang/app/hrms/employees/$employeeId/contracts",
                        params: { employeeId },
                      })
                    }
                  >
                    View All Contracts
                  </Button>
                </Stack>

                {isLoadingContracts ? (
                  <Box
                    sx={{
                      py: 3,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : contracts && contracts.length > 0 ? (
                  <Stack spacing={1.5}>
                    {contracts.slice(0, 5).map((contract) => (
                      <Box
                        key={contract.id}
                        sx={{
                          p: 1.5,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {contract.jobPosition}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {contract.startDate?.split("T")[0]} -{" "}
                            {contract.endDate?.split("T")[0] || "Ongoing"}
                          </Typography>
                        </Box>
                        <ContractStatusBadge status={contract.status} />
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t("common.noData")}
                  </Typography>
                )}
              </Stack>
            )}

            {activeTab === 1 && (
              <Typography variant="body2" color="text.secondary">
                Activity timeline will be added in the next phase.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};
