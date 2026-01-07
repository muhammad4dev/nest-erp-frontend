import { Add as AddIcon, Visibility as ViewIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMemo } from "react";

import { usePurchaseOrders } from "@/lib/api/queries/useProcurement";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type { PurchaseOrder } from "@/types/api.types";

export function RfqListPage() {
  const navigate = useAppNavigate();

  // Fetch only RFQs
  const { data: rfqs = [], isLoading } = usePurchaseOrders({ status: "RFQ" });

  const columns = useMemo<GridColDef<PurchaseOrder>[]>(
    () => [
      {
        field: "orderNumber",
        headerName: "Reference",
        width: 150,
        renderCell: (params) => (
          <Typography
            variant="body2"
            color="primary"
            sx={{
              cursor: "pointer",
              fontWeight: 600,
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() =>
              navigate({
                to: "/$lang/app/procurement/orders/$orderId",
                params: { orderId: params.row.id },
              })
            }
          >
            {params.value}
          </Typography>
        ),
      },
      {
        field: "partner",
        headerName: "Vendor",
        width: 250,
        valueGetter: (_value, row) => row.partner?.name || "N/A",
      },
      {
        field: "orderDate",
        headerName: "Date",
        width: 130,
        valueFormatter: (value) =>
          value ? new Date(value as string).toLocaleDateString() : "",
      },
      {
        field: "totalAmount",
        headerName: "Total",
        width: 130,
        type: "number",
        valueFormatter: (value) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(value as number),
      },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        renderCell: (params) => {
          const status = params.value as string;
          let color: "default" | "primary" | "secondary" | "info" = "default";

          if (status === "RFQ") color = "info";
          if (status === "RFQ_SENT") color = "primary";

          return (
            <Chip
              label={status.replace("_", " ")}
              size="small"
              color={color}
              variant="outlined"
            />
          );
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 100,
        sortable: false,
        renderCell: (params) => (
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() =>
                navigate({
                  to: "/$lang/app/procurement/orders/$orderId",
                  params: { orderId: params.row.id },
                })
              }
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [navigate],
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Requests for Quotation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your incoming vendor quotes and inquiries
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate({ to: "/$lang/app/procurement/rfq/new" })}
        >
          New RFQ
        </Button>
      </Stack>

      <Paper sx={{ width: "100%", height: 600 }}>
        <DataGrid
          rows={rfqs}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          disableRowSelectionOnClick
        />
      </Paper>
    </Container>
  );
}
