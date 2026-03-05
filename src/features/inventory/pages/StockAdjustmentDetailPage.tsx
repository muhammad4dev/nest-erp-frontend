import { ArrowBack, Cancel as CancelIcon } from "@mui/icons-material";
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

import { useCancelStockAdjustment } from "@/lib/api/mutations/useStockAdjustments";
import { useStockAdjustment } from "@/lib/api/queries/useStockAdjustments";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";

const getStatusColor = (
  status: string,
): "default" | "success" | "warning" | "error" => {
  const colors: Record<string, "default" | "success" | "warning" | "error"> = {
    DRAFT: "default",
    COMPLETED: "success",
    CANCELLED: "error",
  };
  return colors[status] || "default";
};

export function StockAdjustmentDetailPage() {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const params = useParams({ strict: false });
  const adjustmentId =
    "adjustmentId" in params ? params.adjustmentId : undefined;

  const {
    data: adjustment,
    isLoading,
    error,
  } = useStockAdjustment(adjustmentId as string | undefined);
  const cancelAdjustment = useCancelStockAdjustment();
  const [actionLoading, setActionLoading] = useState(false);

  const canCancel =
    adjustment &&
    adjustment.status !== "COMPLETED" &&
    adjustment.status !== "CANCELLED";

  const handleCancelAdjustment = async () => {
    if (!adjustmentId) return;

    if (
      !window.confirm(t("confirm.cancelAdjustment", "Cancel this adjustment?"))
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await cancelAdjustment.mutateAsync(adjustmentId as string);
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

  if (error || !adjustment) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error ? (error as Error).message : t("common.notFound", "Not found")}
        </Alert>
        <Button
          onClick={() =>
            navigate({ to: "/$lang/app/inventory/stock-adjustments" })
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
              navigate({ to: "/$lang/app/inventory/stock-adjustments" })
            }
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {t("inventory.stockAdjustment", "Stock Adjustment")}
        </Typography>
        <Chip
          label={adjustment.status}
          color={getStatusColor(adjustment.status)}
        />
      </Stack>

      {/* Adjustment Details */}
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
                {adjustment.product?.name || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                {t("inventory.location", "Location")}
              </Typography>
              <Typography variant="body1">
                {adjustment.location?.name || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                {t("inventory.quantity", "Quantity Adjustment")}
              </Typography>
              <Typography
                variant="body1"
                color={
                  parseFloat(
                    (adjustment.quantity as unknown as number).toString(),
                  ) > 0
                    ? "success.main"
                    : "error.main"
                }
              >
                {parseFloat(
                  (adjustment.quantity as unknown as number).toString(),
                ).toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                {t("common.status", "Status")}
              </Typography>
              <Typography variant="body1">{adjustment.status}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                {t("inventory.reason", "Reason")}
              </Typography>
              <Typography variant="body1">{adjustment.reason}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                {t("common.createdAt", "Created At")}
              </Typography>
              <Typography variant="body1">
                {new Date(adjustment.createdAt).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Actions */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {canCancel && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={handleCancelAdjustment}
            disabled={actionLoading || cancelAdjustment.isPending}
          >
            {cancelAdjustment.isPending
              ? t("common.loading", "Loading...")
              : t("common.cancel", "Cancel")}
          </Button>
        )}

        <Button
          variant="outlined"
          color="secondary"
          onClick={() =>
            navigate({ to: "/$lang/app/inventory/stock-adjustments" })
          }
        >
          {t("common.back", "Back")}
        </Button>
      </Stack>

      {/* Error Messages */}
      {cancelAdjustment.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(cancelAdjustment.error as Error).message}
        </Alert>
      )}
    </Container>
  );
}
