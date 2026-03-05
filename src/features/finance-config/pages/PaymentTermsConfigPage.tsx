import { Add, Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  IconButton,
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
  useCreatePaymentTerm,
  useUpdatePaymentTerm,
  useDeletePaymentTerm,
} from "@/lib/api/mutations/usePaymentTerms";
import { usePaymentTerms } from "@/lib/api/queries/usePaymentTerms";
import type { PaymentTerm } from "@/types/api.types";

export function PaymentTermsConfigPage() {
  const { t } = useTranslation();
  const { data: paymentTerms = [], isLoading } = usePaymentTerms();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    daysToPayment: 0,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreatePaymentTerm();
  const updateMutation = useUpdatePaymentTerm();
  const deleteMutation = useDeletePaymentTerm();

  const handleOpenForm = (term?: PaymentTerm) => {
    if (term) {
      setFormData({
        name: term.name,
        description: term.description || "",
        daysToPayment: term.daysToPayment || 0,
      });
      setEditingTermId(term.id);
    } else {
      setFormData({
        name: "",
        description: "",
        daysToPayment: 0,
      });
      setEditingTermId(null);
    }
    setFormError(null);
    setFormDialogOpen(true);
  };

  const handleSaveForm = async () => {
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError(t("validation.required", "Name is required"));
      return;
    }

    if (formData.daysToPayment < 0) {
      setFormError(t("validation.invalidDays", "Days to payment must be >= 0"));
      return;
    }

    try {
      if (editingTermId) {
        await updateMutation.mutateAsync({
          id: editingTermId,
          dto: {
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            daysToPayment: formData.daysToPayment,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          daysToPayment: formData.daysToPayment,
        });
      }
      setFormDialogOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to save payment term",
      );
    }
  };

  const handleDeleteTerm = async (id: string) => {
    if (window.confirm(t("confirm.delete", "Are you sure?"))) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const columns: GridColDef<PaymentTerm>[] = [
    {
      field: "name",
      headerName: t("finance.paymentTerm", "Payment Term"),
      flex: 1,
      minWidth: 150,
    },
    {
      field: "description",
      headerName: t("common.description", "Description"),
      flex: 2,
      minWidth: 200,
    },
    {
      field: "daysToPayment",
      headerName: t("finance.daysToPayment", "Days to Payment"),
      type: "number",
      width: 150,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("common.actions", "Actions"),
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<Edit />}
          label="Edit"
          onClick={() => handleOpenForm(params.row)}
          showInMenu
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDeleteTerm(params.row.id)}
          color="error"
          showInMenu
        />,
      ],
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
          {t("finance.paymentTermsConfig", "Payment Terms Configuration")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenForm()}
        >
          {t("common.create", "Create")}
        </Button>
      </Box>

      <Paper>
        <DataGrid
          rows={paymentTerms}
          columns={columns}
          loading={isLoading}
          disableSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </Paper>

      {/* Form Dialog */}
      <Dialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTermId
            ? t("common.edit", "Edit")
            : t("common.create", "Create")}{" "}
          {t("finance.paymentTerm", "Payment Term")}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label={t("finance.paymentTerm", "Payment Term")}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
              placeholder="e.g., Net 30, Due on Receipt"
            />

            <TextField
              label={t("common.description", "Description")}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              fullWidth
              multiline
              rows={2}
            />

            <TextField
              type="number"
              label={t("finance.daysToPayment", "Days to Payment")}
              value={formData.daysToPayment}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  daysToPayment: parseInt(e.target.value) || 0,
                })
              }
              fullWidth
              inputProps={{ min: "0" }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormDialogOpen(false)}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            onClick={handleSaveForm}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              t("common.save", "Save")
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
