import { Add, Delete, CheckCircle, Cancel } from "@mui/icons-material";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DataGrid, type GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useCompleteStockTransfer,
  useCancelStockTransfer,
  useCreateStockTransfer,
} from "@/lib/api/mutations/useStockTransfers";
import { useProducts, useStockLocations } from "@/lib/api/queries/useProducts";
import { useStockTransfers } from "@/lib/api/queries/useStockTransfers";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type { StockTransfer } from "@/types/api.types";

export function StockTransfersPage() {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const { data: transfers, isLoading } = useStockTransfers();
  const { data: locations = [] } = useStockLocations();
  const { data: products = [] } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    fromLocationId: "",
    toLocationId: "",
    quantity: 0,
    reference: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const createTransfer = useCreateStockTransfer();
  const completeTransfer = useCompleteStockTransfer();
  const cancelTransfer = useCancelStockTransfer();

  const filteredTransfers = transfers?.filter(
    (transfer) =>
      transfer.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.fromLocation?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transfer.toLocation?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (
    status: string
  ): "default" | "success" | "warning" | "error" => {
    const colors: Record<string, "default" | "success" | "warning" | "error"> = {
      DRAFT: "default",
      COMPLETED: "success",
      CANCELLED: "error",
      IN_PROGRESS: "warning",
    };
    return colors[status] || "default";
  };

  const handleCreateTransfer = async () => {
    setFormError(null);

    if (
      !formData.productId ||
      !formData.fromLocationId ||
      !formData.toLocationId ||
      formData.quantity <= 0
    ) {
      setFormError(t("validation.required", "All required fields must be filled"));
      return;
    }

    if (formData.fromLocationId === formData.toLocationId) {
      setFormError(
        t("inventory.sameLocation", "From and to locations must be different")
      );
      return;
    }

    try {
      await createTransfer.mutateAsync({
        productId: formData.productId,
        fromLocationId: formData.fromLocationId,
        toLocationId: formData.toLocationId,
        quantity: formData.quantity,
        reference: formData.reference || undefined,
      });

      setFormDialogOpen(false);
      setFormData({
        productId: "",
        fromLocationId: "",
        toLocationId: "",
        quantity: 0,
        reference: "",
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to create transfer"
      );
    }
  };

  const handleCompleteTransfer = async (id: string) => {
    if (window.confirm(t("confirm.completeTransfer", "Complete this transfer?"))) {
      await completeTransfer.mutateAsync(id);
    }
  };

  const handleCancelTransfer = async (id: string) => {
    if (window.confirm(t("confirm.cancelTransfer", "Cancel this transfer?"))) {
      await cancelTransfer.mutateAsync(id);
    }
  };

  const columns: GridColDef<StockTransfer>[] = [
    {
      field: "reference",
      headerName: t("inventory.reference", "Reference"),
      flex: 1,
      minWidth: 100,
    },
    {
      field: "product",
      headerName: t("inventory.product", "Product"),
      flex: 1,
      minWidth: 150,
      renderCell: (params) => params.row.product?.name || "N/A",
    },
    {
      field: "fromLocation",
      headerName: t("inventory.fromLocation", "From Location"),
      flex: 1,
      minWidth: 150,
      renderCell: (params) => params.row.fromLocation?.name || "N/A",
    },
    {
      field: "toLocation",
      headerName: t("inventory.toLocation", "To Location"),
      flex: 1,
      minWidth: 150,
      renderCell: (params) => params.row.toLocation?.name || "N/A",
    },
    {
      field: "quantity",
      headerName: t("inventory.quantity", "Quantity"),
      type: "number",
      align: "right",
      headerAlign: "right",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) =>
        parseFloat(
          (params.row.quantity as unknown as number).toString()
        ).toFixed(2),
    },
    {
      field: "status",
      headerName: t("common.status", "Status"),
      flex: 0.7,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.status}
          color={getStatusColor(params.row.status)}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("common.actions", "Actions"),
      flex: 0.8,
      minWidth: 100,
      getActions: (params) => {
        const canComplete = params.row.status === "DRAFT";
        const canCancel =
          params.row.status !== "COMPLETED" && params.row.status !== "CANCELLED";

        const actions = [];

        if (canComplete) {
          actions.push(
            <GridActionsCellItem
              key="complete"
              icon={<CheckCircle />}
              label="Complete"
              onClick={() => handleCompleteTransfer(params.row.id)}
              showInMenu
            />
          );
        }

        if (canCancel) {
          actions.push(
            <GridActionsCellItem
              key="cancel"
              icon={<Cancel />}
              label="Cancel"
              onClick={() => handleCancelTransfer(params.row.id)}
              color="error"
              showInMenu
            />
          );
        }

        return actions;
      },
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">
          {t("inventory.stockTransfers", "Stock Transfers")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setFormDialogOpen(true)}
        >
          {t("common.create", "Create")}
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t("common.search", "Search...")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ p: 2 }}
        />
      </Paper>

      <Paper>
        <DataGrid
          rows={filteredTransfers || []}
          columns={columns}
          loading={isLoading}
          disableSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          onRowClick={(params) =>
            navigate({
              to: "/$lang/app/inventory/stock-transfers/$transferId",
              params: { transferId: params.row.id },
            })
          }
          sx={{ cursor: "pointer" }}
        />
      </Paper>

      {/* Create Transfer Dialog */}
      <Dialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setFormError(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("inventory.createTransfer", "Create Stock Transfer")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              select
              label={t("inventory.product", "Product")}
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              SelectProps={{
                native: true,
              }}
              fullWidth
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (SKU: {product.sku})
                </option>
              ))}
            </TextField>

            <TextField
              select
              label={t("inventory.fromLocation", "From Location")}
              value={formData.fromLocationId}
              onChange={(e) => setFormData({ ...formData, fromLocationId: e.target.value })}
              SelectProps={{
                native: true,
              }}
              fullWidth
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </TextField>

            <TextField
              select
              label={t("inventory.toLocation", "To Location")}
              value={formData.toLocationId}
              onChange={(e) => setFormData({ ...formData, toLocationId: e.target.value })}
              SelectProps={{
                native: true,
              }}
              fullWidth
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </TextField>

            <TextField
              type="number"
              label={t("inventory.quantity", "Quantity")}
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })
              }
              inputProps={{ step: "0.01", min: "0" }}
              fullWidth
            />

            <TextField
              label={t("inventory.reference", "Reference")}
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormDialogOpen(false)}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            onClick={handleCreateTransfer}
            variant="contained"
            disabled={createTransfer.isPending}
          >
            {createTransfer.isPending ? <CircularProgress size={24} /> : t("common.create", "Create")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
