import { Refresh } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";

import { usePartners } from "@/lib/api/queries/usePartners";
import { useAPAgingReport } from "@/lib/api/queries/useProcurement";
import type { APAgingEntry, Partner } from "@/types/api.types";

export function APAgingReportPage() {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [referenceDate, setReferenceDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const { data: partners = [] } = usePartners();
  const {
    data: agingData = [],
    isLoading,
    refetch,
  } = useAPAgingReport({
    partnerId: selectedPartner?.id,
    date: referenceDate,
  });

  const columns: GridColDef<APAgingEntry>[] = [
    {
      field: "partnerName",
      headerName: "Vendor",
      width: 200,
      flex: 1,
    },
    {
      field: "currentAmount",
      headerName: "Current",
      width: 130,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value: number) => value?.toFixed(2) || "0.00",
      renderCell: (params: GridRenderCellParams<APAgingEntry, number>) => (
        <Typography
          variant="body2"
          color={(params.value ?? 0) > 0 ? "success.main" : "text.secondary"}
        >
          {params.value?.toFixed(2) || "0.00"}
        </Typography>
      ),
    },
    {
      field: "overdue1To30",
      headerName: "1-30 Days",
      width: 130,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value: number) => value?.toFixed(2) || "0.00",
      renderCell: (params: GridRenderCellParams<APAgingEntry, number>) => (
        <Typography
          variant="body2"
          color={(params.value ?? 0) > 0 ? "warning.main" : "text.secondary"}
        >
          {params.value?.toFixed(2) || "0.00"}
        </Typography>
      ),
    },
    {
      field: "overdue31To60",
      headerName: "31-60 Days",
      width: 130,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value: number) => value?.toFixed(2) || "0.00",
      renderCell: (params: GridRenderCellParams<APAgingEntry, number>) => (
        <Typography
          variant="body2"
          color={(params.value ?? 0) > 0 ? "warning.main" : "text.secondary"}
        >
          {params.value?.toFixed(2) || "0.00"}
        </Typography>
      ),
    },
    {
      field: "overdue61To90",
      headerName: "61-90 Days",
      width: 130,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value: number) => value?.toFixed(2) || "0.00",
      renderCell: (params: GridRenderCellParams<APAgingEntry, number>) => (
        <Typography
          variant="body2"
          color={(params.value ?? 0) > 0 ? "error.main" : "text.secondary"}
        >
          {params.value?.toFixed(2) || "0.00"}
        </Typography>
      ),
    },
    {
      field: "overdue90Plus",
      headerName: "90+ Days",
      width: 130,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value: number) => value?.toFixed(2) || "0.00",
      renderCell: (params: GridRenderCellParams<APAgingEntry, number>) => (
        <Typography
          variant="body2"
          color={(params.value ?? 0) > 0 ? "error.main" : "text.secondary"}
          fontWeight={(params.value ?? 0) > 0 ? "bold" : "normal"}
        >
          {params.value?.toFixed(2) || "0.00"}
        </Typography>
      ),
    },
    {
      field: "totalDue",
      headerName: "Total Due",
      width: 140,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value: number) => value?.toFixed(2) || "0.00",
      renderCell: (params: GridRenderCellParams<APAgingEntry, number>) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value?.toFixed(2) || "0.00"}
        </Typography>
      ),
    },
  ];

  const calculateTotals = () => {
    return agingData.reduce(
      (totals, entry) => ({
        currentAmount: totals.currentAmount + entry.currentAmount,
        overdue1To30: totals.overdue1To30 + entry.overdue1To30,
        overdue31To60: totals.overdue31To60 + entry.overdue31To60,
        overdue61To90: totals.overdue61To90 + entry.overdue61To90,
        overdue90Plus: totals.overdue90Plus + entry.overdue90Plus,
        totalDue: totals.totalDue + entry.totalDue,
      }),
      {
        currentAmount: 0,
        overdue1To30: 0,
        overdue31To60: 0,
        overdue61To90: 0,
        overdue90Plus: 0,
        totalDue: 0,
      },
    );
  };

  const totals = calculateTotals();

  const handleRefresh = () => {
    void refetch();
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = [
      "Vendor",
      "Current",
      "1-30 Days",
      "31-60 Days",
      "61-90 Days",
      "90+ Days",
      "Total Due",
    ];

    const rows = agingData.map((entry) => [
      entry.partnerName,
      entry.currentAmount.toFixed(2),
      entry.overdue1To30.toFixed(2),
      entry.overdue31To60.toFixed(2),
      entry.overdue61To90.toFixed(2),
      entry.overdue90Plus.toFixed(2),
      entry.totalDue.toFixed(2),
    ]);

    // Add totals row
    rows.push([
      "TOTAL",
      totals.currentAmount.toFixed(2),
      totals.overdue1To30.toFixed(2),
      totals.overdue31To60.toFixed(2),
      totals.overdue61To90.toFixed(2),
      totals.overdue90Plus.toFixed(2),
      totals.totalDue.toFixed(2),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ap-aging-report-${referenceDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Accounts Payable Aging Report
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Filters
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Autocomplete
              options={partners}
              getOptionLabel={(option) => option.name}
              value={selectedPartner}
              onChange={(_, newValue) => setSelectedPartner(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Filter by Vendor (Optional)" />
              )}
              sx={{ minWidth: 300 }}
            />
            <TextField
              label="Reference Date"
              type="date"
              value={referenceDate}
              onChange={(e) => setReferenceDate(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button variant="contained" onClick={handleExportCSV}>
              Export CSV
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <DataGrid
            rows={agingData}
            columns={columns}
            loading={isLoading}
            getRowId={(row) => row.partnerId}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
            autoHeight
          />

          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: 2,
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Total Summary
            </Typography>
            <Stack direction="row" spacing={4} flexWrap="wrap">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Current
                </Typography>
                <Typography variant="h6" color="success.main">
                  {totals.currentAmount.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  1-30 Days
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {totals.overdue1To30.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  31-60 Days
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {totals.overdue31To60.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  61-90 Days
                </Typography>
                <Typography variant="h6" color="error.main">
                  {totals.overdue61To90.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  90+ Days
                </Typography>
                <Typography variant="h6" color="error.main" fontWeight="bold">
                  {totals.overdue90Plus.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Due
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {totals.totalDue.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
