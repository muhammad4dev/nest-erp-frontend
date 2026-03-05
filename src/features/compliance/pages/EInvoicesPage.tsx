import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useCreateEInvoice,
  useEInvoices,
} from "@/lib/api/queries/useCompliance";
import type { EInvoice } from "@/types/api.types";

const statusColorMap: Record<
  string,
  "default" | "primary" | "success" | "error"
> = {
  DRAFT: "default",
  SUBMITTED: "primary",
  ACCEPTED: "success",
  REJECTED: "error",
  CANCELLED: "default",
};

export default function EInvoicesPage() {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    invoiceId: "",
    externalId: "",
    notes: "",
  });

  const { data: eInvoices = [], isLoading: eInvoicesLoading } = useEInvoices();
  const createEInvoice = useCreateEInvoice();

  const handleCreateEInvoice = () => {
    if (!formData.invoiceId) {
      return;
    }

    createEInvoice.mutate(
      {
        invoiceId: formData.invoiceId,
        externalId: formData.externalId || undefined,
        notes: formData.notes || undefined,
      },
      {
        onSuccess: () => {
          setFormData({ invoiceId: "", externalId: "", notes: "" });
          setOpenDialog(false);
        },
      },
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>EInvoices</h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          {t("common.create")}
        </Button>
      </Box>

      {eInvoicesLoading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Invoice ID</TableCell>
                <TableCell>External ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eInvoices && eInvoices.length > 0 ? (
                (eInvoices as EInvoice[]).map((eInvoice: EInvoice) => (
                  <TableRow key={eInvoice.id}>
                    <TableCell>{eInvoice.invoiceId}</TableCell>
                    <TableCell>{eInvoice.externalId || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={eInvoice.status}
                        color={statusColorMap[eInvoice.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {eInvoice.submittedAt
                        ? new Date(eInvoice.submittedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>{eInvoice.notes || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    {t("common.noData")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create EInvoice</DialogTitle>
        <DialogContent sx={{ minWidth: 400, pt: 2 }}>
          <TextField
            label="Invoice ID"
            value={formData.invoiceId}
            onChange={(e) =>
              setFormData({ ...formData, invoiceId: e.target.value })
            }
            fullWidth
            disabled={createEInvoice.isPending}
            required
          />

          <TextField
            label="External ID"
            value={formData.externalId}
            onChange={(e) =>
              setFormData({ ...formData, externalId: e.target.value })
            }
            fullWidth
            margin="normal"
            disabled={createEInvoice.isPending}
          />

          <TextField
            label="Notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            fullWidth
            margin="normal"
            multiline
            rows={3}
            disabled={createEInvoice.isPending}
          />

          {createEInvoice.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {createEInvoice.error?.message || "Error creating eInvoice"}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleCreateEInvoice}
            variant="contained"
            disabled={!formData.invoiceId || createEInvoice.isPending}
          >
            {createEInvoice.isPending ? (
              <CircularProgress size={24} />
            ) : (
              t("common.create")
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
