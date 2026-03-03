import DownloadIcon from "@mui/icons-material/Download";
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
import type { EmploymentContract } from "@/types/api.types";

import { ContractStatusBadge } from "../components";
import { exportToCsv } from "../utils/reportExport";

const dateInRange = (value: string, from?: string, to?: string) => {
  const date = new Date(value).getTime();
  const fromTime = from ? new Date(from).getTime() : Number.NEGATIVE_INFINITY;
  const toTime = to ? new Date(to).getTime() : Number.POSITIVE_INFINITY;
  return date >= fromTime && date <= toTime;
};

export const SalaryExpenseReportPage = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    data: contractsData,
    isLoading,
    error,
  } = useListContracts({ skip: 0, take: 1000 });

  const filteredContracts = useMemo(() => {
    const data = contractsData?.data || [];
    return data.filter((contract: EmploymentContract) => {
      if (!startDate && !endDate) return true;
      return dateInRange(
        contract.startDate,
        startDate || undefined,
        endDate || undefined,
      );
    });
  }, [contractsData, startDate, endDate]);

  const totalExpense = filteredContracts.reduce(
    (sum: number, contract: EmploymentContract) =>
      sum + Number(contract.wage || 0),
    0,
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
          <Typography variant="h4">Salary Expense Report</Typography>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() =>
              exportToCsv(
                "salary-expense-report.csv",
                filteredContracts.map((contract: EmploymentContract) => ({
                  ContractId: contract.id,
                  Employee: contract.employee
                    ? `${contract.employee.firstName} ${contract.employee.lastName}`
                    : contract.employeeId,
                  Position: contract.jobPosition,
                  Wage: contract.wage,
                  Status: contract.status,
                  StartDate: contract.startDate?.split("T")[0],
                  EndDate: contract.endDate?.split("T")[0] || "",
                })),
              )
            }
            disabled={!filteredContracts.length}
          >
            Export CSV
          </Button>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="outlined"
            onClick={() => {
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
          <>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Total Salary Expense
                </Typography>
                <Typography variant="h5">{totalExpense}</Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Contracts Included
                </Typography>
                <Stack spacing={1.5}>
                  {filteredContracts.map((contract: EmploymentContract) => (
                    <Box
                      key={contract.id}
                      sx={{
                        p: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
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
                          Wage: {contract.wage}
                        </Typography>
                      </Box>
                      <ContractStatusBadge status={contract.status} />
                    </Box>
                  ))}
                  {!filteredContracts.length && (
                    <Typography variant="body2" color="text.secondary">
                      {t("common.noData")}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </>
        )}
      </Stack>
    </Container>
  );
};
