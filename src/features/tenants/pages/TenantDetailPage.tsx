import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
} from "@mui/material";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useDeleteTenant } from "@/lib/api/mutations/useIdentity";
import { useTenant } from "@/lib/api/queries/useIdentity";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";

export function TenantDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams({ from: "/$lang/app/tenants/$id" });
  const navigate = useAppNavigate();
  const { data: tenant, isLoading, error } = useTenant(id);
  const { mutate: deleteTenant } = useDeleteTenant();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (tenant) {
      deleteTenant(tenant.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          navigate({ to: "/$lang/app/tenants" });
        },
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !tenant) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          {t("common.error")}:{" "}
          {error ? (error as Error).message : "Tenant not found"}
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate({ to: "/$lang/app/tenants" })}
          sx={{ mt: 2 }}
        >
          {t("common.goBack")}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate({ to: "/$lang/app/tenants" })}
          variant="text"
        >
          {t("common.goBack")}
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            startIcon={<EditIcon />}
            variant="contained"
            color="primary"
            onClick={() =>
              navigate({ to: "/$lang/app/tenants/$id/edit", params: { id } })
            }
          >
            {t("common.edit")}
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            variant="contained"
            color="error"
            onClick={handleDeleteClick}
          >
            {t("common.delete")}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          {tenant.name}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="body2" color="textSecondary">
              {t("common.name")}
            </Typography>
            <Typography variant="body1">{tenant.name}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="textSecondary">
              {t("common.schemaName")}
            </Typography>
            <Typography variant="body1">{tenant.schemaName || "-"}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="textSecondary">
              {t("common.status")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: tenant.isActive ? "green" : "red",
                fontWeight: 500,
              }}
            >
              {tenant.isActive ? t("common.active") : t("common.inactive")}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="textSecondary">
              {t("common.createdDate")}
            </Typography>
            <Typography variant="body1">
              {new Date(tenant.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>{t("common.confirmDelete")}</DialogTitle>
        <DialogContent>
          <Typography>
            {`${t("common.deleteConfirmation")} "${tenant.name}"?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
