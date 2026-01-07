import { Add, Lock, LockOpen } from "@mui/icons-material";
import { Box, Button, Chip, Container, Paper, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useState } from "react";

import {
  useCloseFiscalPeriod,
  useReopenFiscalPeriod,
} from "@/lib/api/mutations/useFinance";
import { useFiscalPeriods } from "@/lib/api/queries/useFinance";
import type { FiscalPeriod } from "@/types/api.types";

import { FiscalPeriodFormDialog } from "../components/FiscalPeriodFormDialog";

export function FiscalPeriodsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<
    FiscalPeriod | undefined
  >();

  const { data: periods, isLoading } = useFiscalPeriods();
  const closePeriod = useCloseFiscalPeriod();
  const reopenPeriod = useReopenFiscalPeriod();

  const handleEdit = (period: FiscalPeriod) => {
    setSelectedPeriod(period);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedPeriod(undefined);
  };

  const handleClosePeriod = async (periodId: string) => {
    if (
      confirm(
        "Are you sure you want to close this period? This will prevent new entries from being posted.",
      )
    ) {
      await closePeriod.mutateAsync({ id: periodId });
    }
  };

  const handleReopenPeriod = async (periodId: string) => {
    if (confirm("Are you sure you want to reopen this period?")) {
      await reopenPeriod.mutateAsync(periodId);
    }
  };

  const columns: GridColDef<FiscalPeriod>[] = [
    {
      field: "name",
      headerName: "Name",
      width: 150,
      sortable: true,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 130,
      sortable: true,
      valueFormatter: (value) => {
        if (!value) return "";
        return new Date(value).toLocaleDateString();
      },
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 130,
      sortable: true,
      valueFormatter: (value) => {
        if (!value) return "";
        return new Date(value).toLocaleDateString();
      },
    },
    {
      field: "isClosed",
      headerName: "Status",
      width: 120,
      sortable: true,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Closed" : "Open"}
          size="small"
          color={params.value ? "error" : "success"}
          icon={params.value ? <Lock /> : <LockOpen />}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 180,
      sortable: true,
      valueFormatter: (value) => {
        if (!value) return "";
        return new Date(value).toLocaleString();
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 250,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          {!params.row.isClosed && (
            <>
              <Button size="small" onClick={() => handleEdit(params.row)}>
                Edit
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Lock />}
                onClick={() => handleClosePeriod(params.row.id)}
              >
                Close
              </Button>
            </>
          )}
          {params.row.isClosed && (
            <Button
              size="small"
              variant="outlined"
              color="success"
              startIcon={<LockOpen />}
              onClick={() => handleReopenPeriod(params.row.id)}
            >
              Reopen
            </Button>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Typography variant="h4" gutterBottom>
            Fiscal Periods
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage fiscal periods and period closing
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          New Period
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={periods || []}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
            sorting: {
              sortModel: [{ field: "startDate", sort: "desc" }],
            },
          }}
          disableRowSelectionOnClick
          sx={{
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
          }}
        />
      </Paper>

      <FiscalPeriodFormDialog
        open={dialogOpen}
        period={selectedPeriod}
        onClose={handleClose}
      />
    </Container>
  );
}
