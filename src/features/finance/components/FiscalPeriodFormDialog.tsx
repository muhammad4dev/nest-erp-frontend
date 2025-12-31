import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

import {
  useCreateFiscalPeriod,
  useUpdateFiscalPeriod,
} from "@/lib/api/mutations/useFinance";
import type { CreateFiscalPeriodDto, FiscalPeriod } from "@/types/api.types";

interface FiscalPeriodFormDialogProps {
  open: boolean;
  period?: FiscalPeriod;
  onClose: () => void;
}

export function FiscalPeriodFormDialog({
  open,
  period,
  onClose,
}: FiscalPeriodFormDialogProps) {
  const [formData, setFormData] = useState<CreateFiscalPeriodDto>({
    name: "",
    startDate: "",
    endDate: "",
  });

  const createPeriod = useCreateFiscalPeriod();
  const updatePeriod = useUpdateFiscalPeriod();

  useEffect(() => {
    if (period) {
      setFormData({
        name: period.name,
        startDate: period.startDate,
        endDate: period.endDate,
      });
    } else {
      setFormData({
        name: "",
        startDate: "",
        endDate: "",
      });
    }
  }, [period]);

  const handleSubmit = async () => {
    if (period) {
      await updatePeriod.mutateAsync({ id: period.id, data: formData });
    } else {
      await createPeriod.mutateAsync(formData);
    }
    onClose();
  };

  const canEdit = !period?.isClosed;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {period ? "Edit Fiscal Period" : "New Fiscal Period"}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Period Name"
          fullWidth
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., 2025-Q1"
          disabled={!canEdit}
        />

        <TextField
          margin="dense"
          label="Start Date"
          type="date"
          fullWidth
          required
          value={formData.startDate}
          onChange={(e) =>
            setFormData({ ...formData, startDate: e.target.value })
          }
          InputLabelProps={{ shrink: true }}
          disabled={!canEdit}
        />

        <TextField
          margin="dense"
          label="End Date"
          type="date"
          fullWidth
          required
          value={formData.endDate}
          onChange={(e) =>
            setFormData({ ...formData, endDate: e.target.value })
          }
          InputLabelProps={{ shrink: true }}
          disabled={!canEdit}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {canEdit && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.name ||
              !formData.startDate ||
              !formData.endDate ||
              createPeriod.isPending ||
              updatePeriod.isPending
            }
          >
            {period ? "Update" : "Create"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
