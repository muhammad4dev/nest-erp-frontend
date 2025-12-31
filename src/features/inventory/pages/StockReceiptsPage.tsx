import { Add, CheckCircle, Delete, Search } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppNavigate } from "@/shared/hooks/useAppNavigate";

import {
  useCompleteStockReceipt,
  useDeleteStockReceipt,
} from "@/lib/api/mutations/useStockReceipts";
import { useStockReceipts } from "@/lib/api/queries/useStockReceipts";
import type { StockReceipt } from "@/types/api.types";
import { StockReceiptFormDialog } from "../components/StockReceiptFormDialog";

export function StockReceiptsPage() {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const { data: receipts, isLoading } = useStockReceipts();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const completeReceipt = useCompleteStockReceipt();
  const deleteReceipt = useDeleteStockReceipt();

  // Client-side filtering
  const filteredReceipts = receipts?.filter(
    (receipt) =>
      receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.sourceReference
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      receipt.location?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, "default" | "success" | "error"> = {
      DRAFT: "default",
      COMPLETED: "success",
      CANCELLED: "error",
    };
    return colors[status] || "default";
  };

  const getSourceTypeColor = (
    type: string
  ): "primary" | "success" | "warning" | "info" | "secondary" => {
    const colors: Record<
      string,
      "primary" | "success" | "warning" | "info" | "secondary"
    > = {
      PURCHASE: "primary",
      PRODUCTION: "success",
      RETURN: "warning",
      TRANSFER: "info",
      ADJUSTMENT: "secondary",
    };
    return colors[type] || "primary";
  };

  const handleComplete = async (id: string) => {
    if (window.confirm(t("inventory.stockReceipts.confirmComplete"))) {
      await completeReceipt.mutateAsync(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t("inventory.stockReceipts.confirmDelete"))) {
      await deleteReceipt.mutateAsync(id);
    }
  };

  const handleRowClick = (row: StockReceipt) => {
    navigate({
      to: "/$lang/app/inventory/receipts/$receiptId",
      params: { receiptId: row.id },
    });
  };

  const columns: GridColDef<StockReceipt>[] = [
    {
      field: "receiptNumber",
      headerName: t("inventory.stockReceipts.receiptNumber"),
      width: 150,
      renderCell: (params) => (
        <Box
          sx={{
            cursor: "pointer",
            color: "primary.main",
            fontWeight: 600,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "receiptDate",
      headerName: t("inventory.stockReceipts.receiptDate"),
      width: 120,
      valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      field: "sourceType",
      headerName: t("inventory.stockReceipts.sourceType"),
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getSourceTypeColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "location",
      headerName: t("inventory.stockReceipts.location"),
      width: 150,
      valueGetter: (_, row) => row.location?.name || "-",
    },
    {
      field: "totalQuantity",
      headerName: t("inventory.stockReceipts.totalQuantity"),
      width: 110,
      type: "number",
      valueFormatter: (value) => {
        const numValue = typeof value === "number" ? value : parseFloat(value);
        return !isNaN(numValue) ? numValue.toFixed(2) : "0.00";
      },
    },
    {
      field: "totalValue",
      headerName: t("inventory.stockReceipts.totalValue"),
      width: 130,
      type: "number",
      valueFormatter: (value) => {
        const numValue = typeof value === "number" ? value : parseFloat(value);
        return `$${!isNaN(numValue) ? numValue.toFixed(2) : "0.00"}`;
      },
    },
    {
      field: "status",
      headerName: t("inventory.stockReceipts.status"),
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: t("inventory.stockReceipts.actions"),
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {params.row.status === "DRAFT" && (
            <>
              <Tooltip title={t("inventory.stockReceipts.complete")}>
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => handleComplete(params.row.id)}
                  disabled={completeReceipt.isPending}
                >
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("common.delete")}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(params.row.id)}
                  disabled={deleteReceipt.isPending}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
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
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <div>
          <Typography variant="h4" gutterBottom>
            {t("inventory.stockReceipts.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("inventory.stockReceipts.description")}
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          {t("inventory.stockReceipts.newReceipt")}
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t("inventory.stockReceipts.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />
      </Paper>

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={filteredReceipts || []}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
            sorting: {
              sortModel: [{ field: "receiptDate", sort: "desc" }],
            },
          }}
          onRowClick={(params) => handleRowClick(params.row)}
          disableRowSelectionOnClick
          sx={{
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
          }}
        />
      </Paper>

      <StockReceiptFormDialog
        open={dialogOpen}
        mode="create"
        onClose={() => setDialogOpen(false)}
        onSaved={() => setDialogOpen(false)}
      />
    </Container>
  );
}
