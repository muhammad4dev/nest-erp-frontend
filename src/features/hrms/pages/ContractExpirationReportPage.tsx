import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useListContracts } from "@/lib/api/queries";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type { EmploymentContract } from "@/types/api.types";

import { ContractStatusBadge } from "../components";
import { exportToCsv } from "../utils/reportExport";

const daysUntil = (dateValue: string) => {
  const now = new Date();
  const target = new Date(dateValue);
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const ContractExpirationReportPage = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();

  const [daysThreshold, setDaysThreshold] = useState("30");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    data: contractsData,
    isLoading,
    error,
  } = useListContracts({ skip: 0, take: 1000 });

  const expiringContracts = useMemo(() => {
    const threshold = Number(daysThreshold || 30);
    const contracts = contractsData?.data || [];

    return contracts
      .filter((contract: EmploymentContract) => !!contract.endDate)
      .filter((contract: EmploymentContract) => {
        const remaining = daysUntil(contract.endDate as string);
        if (remaining < 0) return false;
        if (remaining > threshold) return false;

        if (startDate) {
          const from = new Date(startDate).getTime();
          const current = new Date(contract.endDate as string).getTime();
          if (current < from) return false;
        }

        if (endDate) {
          const to = new Date(endDate).getTime();
          const current = new Date(contract.endDate as string).getTime();
          if (current > to) return false;
        }

        return true;
      })
      .sort(
        (a: EmploymentContract, b: EmploymentContract) =>
          new Date(a.endDate as string).getTime() -
          new Date(b.endDate as string).getTime(),
      );
  }, [contractsData, daysThreshold, startDate, endDate]);

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
          <Typography variant="h4">Contract Expiration Report</Typography>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() =>
              exportToCsv(
                "contract-expiration-report.csv",
                expiringContracts.map((contract: EmploymentContract) => ({
                  ContractId: contract.id,
                  Employee: contract.employee
                    ? `${contract.employee.firstName} ${contract.employee.lastName}`
                    : contract.employeeId,
                  Position: contract.jobPosition,
                  EndDate: contract.endDate?.split("T")[0] || "",
                  DaysRemaining: daysUntil(contract.endDate as string),
                  Status: contract.status,
                })),
              )
            }
            disabled={!expiringContracts.length}
          >
            Export CSV
          </Button>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Days Ahead"
            type="number"
            value={daysThreshold}
            onChange={(e) => setDaysThreshold(e.target.value)}
            sx={{ width: 150 }}
          />
          <TextField
            type="date"
            label="From End Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="To End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              setDaysThreshold("30");
              setStartDate("");
              setEndDate("");
            }}
          >
            {t("common.clear")}
          </Button>
        </Stack>

        {isLoading ? (
          <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Expiring Contracts ({expiringContracts.length})
              </Typography>

              <Stack spacing={1.5}>
                {expiringContracts.map((contract: EmploymentContract) => {
                  const remaining = daysUntil(contract.endDate as string);

                  return (
                    <Box
                      key={contract.id}
                      sx={{
                        p: 1.5,
                        border: "1px solid",
                        borderColor: remaining <= 7 ? "error.main" : "divider",
                        borderRadius: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {contract.jobPosition}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {contract.employee
                            ? `${contract.employee.firstName} ${contract.employee.lastName}`
                            : contract.employeeId}
                        </Typography>
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          Ends on {contract.endDate?.split("T")[0]} ·{" "}
                          {remaining} day(s) remaining
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <ContractStatusBadge status={contract.status} />
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
                      </Stack>
                    </Box>
                  );
                })}

                {!expiringContracts.length && (
                  <Typography variant="body2" color="text.secondary">
                    {t("common.noData")}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Container>
  );
};
