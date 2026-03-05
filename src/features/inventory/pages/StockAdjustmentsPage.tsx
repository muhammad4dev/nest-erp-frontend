import { Add, Delete, Cancel } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Container,
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
import {
  DataGrid,
  type GridColDef,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useCancelStockAdjustment,
  useCreateStockAdjustment,
} from "@/lib/api/mutations/useStockAdjustments";
import { useProducts } from "@/lib/api/queries/useProducts";
import { useStockAdjustments } from "@/lib/api/queries/useStockAdjustments";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type { StockAdjustment } from "@/types/api.types";

export function StockAdjustmentsPage() {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const { data: adjustments, isLoading } = useStockAdjustments();
  const { data: products = [] } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    locationId: "",
    quantity: 0,
    reason: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const createAdjustment = useCreateStockAdjustment();
  const cancelAdjustment = useCancelStockAdjustment();

  const filteredAdjustments = adjustments?.filter(
    (adj) =>
      adj.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adj.location?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adj.reason?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (
    status: string,
  ): "default" | "success" | "warning" | "error" => {
    const colors: Record<string, "default" | "success" | "warning" | "error"> =
      {
        DRAFT: "default",
        COMPLETED: "success",
        CANCELLED: "error",
      };
    return colors[status] || "default";
  };

  const handleCreateAdjustment = async () => {
    setFormError(null);

    if (
      !formData.productId ||
      !formData.locationId ||
      formData.quantity === 0 ||
      !formData.reason
    ) {
      setFormError(
        t("validation.required", "All required fields must be filled"),
      );
      return;
    }

    try {
      await createAdjustment.mutateAsync({
        productId: formData.productId,
        locationId: formData.locationId,
        quantity: formData.quantity,
        reason: formData.reason,
      });

      setFormDialogOpen(false);
      setFormData({
        productId: "",
        locationId: "",
        quantity: 0,
        reason: "",
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to create adjustment",
      );
    }
  };

  const handleCancelAdjustment = async (id: string) => {
    if (
      window.confirm(t("confirm.cancelAdjustment", "Cancel this adjustment?"))
    ) {
      await cancelAdjustment.mutateAsync(id);
    }
  };

  const columns: GridColDef<StockAdjustment>[] = [
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
      field: "location",
      headerName: t("inventory.location", "Location"),
      flex: 1,
      minWidth: 150,
      renderCell: (params) => params.row.location?.name || "N/A",
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
          (params.row.quantity as unknown as number).toString(),
        ).toFixed(2),
    },
    {
      field: "reason",
      headerName: t("inventory.reason", "Reason"),
      flex: 1,
      minWidth: 150,
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
        const canCancel =
          params.row.status !== "COMPLETED" &&
          params.row.status !== "CANCELLED";

        const actions = [];

        if (canCancel) {
          actions.push(
            <GridActionsCellItem
              key="cancel"
              icon={<Cancel />}
              label="Cancel"
              onClick={() => handleCancelAdjustment(params.row.id)}
              color="error"
              showInMenu
            />,
          );
        }

        return actions;
      },
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">
          {t("inventory.stockAdjustments", "Stock Adjustments")}
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
          rows={filteredAdjustments || []}
          columns={columns}
          loading={isLoading}
          disableSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          onRowClick={(params) =>
            navigate({
              to: "/$lang/app/inventory/stock-adjustments/$adjustmentId",
              params: { adjustmentId: params.row.id },
            })
          }
          sx={{ cursor: "pointer" }}
        />
      </Paper>

      {/* Create Adjustment Dialog */}
      <Dialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setFormError(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t("inventory.createAdjustment", "Create Stock Adjustment")}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              select
              label={t("inventory.product", "Product")}
              value={formData.productId}
              onChange={(e) =>
                setFormData({ ...formData, productId: e.target.value })
              }
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
              type="number"
              label={t("inventory.quantity", "Quantity")}
              value={formData.quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: parseFloat(e.target.value) || 0,
                })
              }
              inputProps={{ step: "0.01" }}
              fullWidth
              helperText="Positive value to add, negative to reduce"
            />

            <TextField
              label={t("inventory.reason", "Reason")}
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              multiline
              rows={3}
              fullWidth
              placeholder="e.g., Physical count adjustment, Damage, etc."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormDialogOpen(false)}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            onClick={handleCreateAdjustment}
            variant="contained"
            disabled={createAdjustment.isPending}
          >
            {createAdjustment.isPending ? (
              <CircularProgress size={24} />
            ) : (
              t("common.create", "Create")
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
