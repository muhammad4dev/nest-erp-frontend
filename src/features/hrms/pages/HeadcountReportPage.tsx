import DownloadIcon from "@mui/icons-material/Download";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useListEmployees } from "@/lib/api/queries";
import type { Employee } from "@/types/api.types";

import { exportToCsv } from "../utils/reportExport";

const inRange = (value: string, from?: string, to?: string) => {
  const date = new Date(value).getTime();
  const fromTime = from ? new Date(from).getTime() : Number.NEGATIVE_INFINITY;
  const toTime = to ? new Date(to).getTime() : Number.POSITIVE_INFINITY;
  return date >= fromTime && date <= toTime;
};

export const HeadcountReportPage = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    data: employeesData,
    isLoading,
    error,
  } = useListEmployees({ skip: 0, take: 1000 });

  const filteredEmployees = useMemo(() => {
    const data = employeesData?.data || [];
    return data.filter((employee: Employee) => {
      if (!startDate && !endDate) return true;
      return inRange(
        employee.hireDate,
        startDate || undefined,
        endDate || undefined,
      );
    });
  }, [employeesData, startDate, endDate]);

  const reportRows = useMemo(() => {
    const byDepartment = new Map<
      string,
      { total: number; active: number; inactive: number }
    >();

    filteredEmployees.forEach((employee: Employee) => {
      const department = employee.department || "Unassigned";
      const current = byDepartment.get(department) || {
        total: 0,
        active: 0,
        inactive: 0,
      };

      current.total += 1;
      if (employee.isActive) {
        current.active += 1;
      } else {
        current.inactive += 1;
      }

      byDepartment.set(department, current);
    });

    return Array.from(byDepartment.entries()).map(([department, totals]) => ({
      department,
      ...totals,
    }));
  }, [filteredEmployees]);

  const total = filteredEmployees.length;
  const active = filteredEmployees.filter(
    (employee: Employee) => employee.isActive,
  ).length;
  const inactive = total - active;

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
          <Typography variant="h4">Headcount Report</Typography>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() =>
              exportToCsv(
                "headcount-report.csv",
                reportRows.map((row) => ({
                  Department: row.department,
                  Total: row.total,
                  Active: row.active,
                  Inactive: row.inactive,
                })),
              )
            }
            disabled={!reportRows.length}
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
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Total Employees
                    </Typography>
                    <Typography variant="h5">{total}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Active Employees
                    </Typography>
                    <Typography variant="h5">{active}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Inactive Employees
                    </Typography>
                    <Typography variant="h5">{inactive}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  By Department
                </Typography>
                <Stack spacing={1.5}>
                  {reportRows.map((row) => (
                    <Box
                      key={row.department}
                      sx={{
                        p: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {row.department}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total: {row.total} · Active: {row.active} · Inactive:{" "}
                        {row.inactive}
                      </Typography>
                    </Box>
                  ))}
                  {!reportRows.length && (
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
