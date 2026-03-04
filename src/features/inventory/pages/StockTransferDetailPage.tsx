import {
  ArrowBack,
  CheckCircle,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useCompleteStockTransfer,
  useCancelStockTransfer,
} from "@/lib/api/mutations/useStockTransfers";
import { useStockTransfer } from "@/lib/api/queries/useStockTransfers";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";

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

export function StockTransferDetailPage() {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const params = useParams({ strict: false });
  const transferId = "transferId" in params ? params.transferId : undefined;

  const { data: transfer, isLoading, error } = useStockTransfer(transferId);
  const completeTransfer = useCompleteStockTransfer();
  const cancelTransfer = useCancelStockTransfer();
  const [actionLoading, setActionLoading] = useState(false);

  const canComplete = transfer && transfer.status === "DRAFT";
  const canCancel =
    transfer &&
    transfer.status !== "COMPLETED" &&
    transfer.status !== "CANCELLED";

  const handleCompleteTransfer = async () => {
    if (!transferId) return;

    if (
      !window.confirm(
        t("confirm.completeTransfer", "Complete this transfer?")
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await completeTransfer.mutateAsync(transferId);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelTransfer = async () => {
    if (!transferId) return;

    if (!window.confirm(t("confirm.cancelTransfer", "Cancel this transfer?"))) {
      return;
    }

    setActionLoading(true);
    try {
      await cancelTransfer.mutateAsync(transferId);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>{t("common.loading", "Loading...")}</Typography>
      </Container>
    );
  }

  if (error || !transfer) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error ? (error as Error).message : t("common.notFound", "Not found")}
        </Alert>
        <Button
          onClick={() =>
            navigate({ to: "/$lang/app/inventory/stock-transfers" })
          }
          sx={{ mt: 2 }}
        >
          {t("common.back", "Back")}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Tooltip title={t("common.back", "Back")}>
          <IconButton
            onClick={() =>
              navigate({ to: "/$lang/app/inventory/stock-transfers" })
            }
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {t("inventory.stockTransfer", "Stock Transfer")} {transfer.reference}
        </Typography>
        <Chip
          label={transfer.status}
          color={getStatusColor(transfer.status)}
        />
      </Stack>

      {/* Transfer Details */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("common.details", "Details")}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                {t("inventory.product", "Product")}
              </Typography>
              <Typography variant="body1">
                {transfer.product?.name || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                {t("inventory.quantity", "Quantity")}
              </Typography>
              <Typography variant="body1">
                {parseFloat((transfer.quantity as unknown as number).toString()).toFixed(
                  2
                )}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                {t("inventory.fromLocation", "From Location")}
              </Typography>
              <Typography variant="body1">
                {transfer.fromLocation?.name || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                {t("inventory.toLocation", "To Location")}
              </Typography>
              <Typography variant="body1">
                {transfer.toLocation?.name || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                {t("common.status", "Status")}
              </Typography>
              <Typography variant="body1">{transfer.status}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                {t("common.createdAt", "Created At")}
              </Typography>
              <Typography variant="body1">
                {new Date(transfer.createdAt).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Actions */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {canComplete && (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={handleCompleteTransfer}
            disabled={actionLoading || completeTransfer.isPending}
          >
            {completeTransfer.isPending
              ? t("common.loading", "Loading...")
              : t("common.complete", "Complete")}
          </Button>
        )}

        {canCancel && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={handleCancelTransfer}
            disabled={actionLoading || cancelTransfer.isPending}
          >
            {cancelTransfer.isPending
              ? t("common.loading", "Loading...")
              : t("common.cancel", "Cancel")}
          </Button>
        )}

        <Button
          variant="outlined"
          color="secondary"
          onClick={() =>
            navigate({ to: "/$lang/app/inventory/stock-transfers" })
          }
        >
          {t("common.back", "Back")}
        </Button>
      </Stack>

      {/* Error Messages */}
      {(completeTransfer.error || cancelTransfer.error) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {completeTransfer.error
            ? (completeTransfer.error as Error).message
            : (cancelTransfer.error as Error).message}
        </Alert>
      )}
    </Container>
  );
}
