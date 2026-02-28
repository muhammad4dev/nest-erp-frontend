import { Cancel as CancelIcon, Save as SaveIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useCreateTenant,
  useUpdateTenant,
} from "@/lib/api/mutations/useIdentity";
import { useTenant } from "@/lib/api/queries/useIdentity";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type { CreateTenantDto, UpdateTenantDto } from "@/types/api.types";

export function TenantFormPage() {
  const { t } = useTranslation();
  const navigate = useAppNavigate();

  // Try to get params from edit route, fall back if not in edit route
  let tenantId: string | undefined;
  try {
    const editParams = useParams({ from: "/$lang/app/tenants/$id/edit" });
    tenantId = editParams?.id;
  } catch {
    // Not in edit route, this is create mode
  }

  const { data: tenantData, isLoading: isLoadingTenant } = useTenant(
    tenantId || "",
  );
  const { mutate: createTenant, isPending: isCreating } = useCreateTenant();
  const { mutate: updateTenant, isPending: isUpdating } = useUpdateTenant();

  const [formData, setFormData] = useState<
    CreateTenantDto & { isActive?: boolean }
  >({
    name: "",
    schemaName: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (tenantData && tenantData.id === tenantId) {
      setFormData({
        name: tenantData.name,
        schemaName: tenantData.schemaName || "",
        isActive: tenantData.isActive,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantData?.id]);

  const isEditing = !!tenantId;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = t("validation.required");
    } else if (formData.name.length < 2) {
      newErrors.name = t("validation.minLength", { min: 2 });
    } else if (formData.name.length > 100) {
      newErrors.name = t("validation.maxLength", { max: 100 });
    }

    if (formData.schemaName && formData.schemaName.length > 100) {
      newErrors.schemaName = t("validation.maxLength", { max: 100 });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    if (isEditing && tenantId) {
      const updateData: UpdateTenantDto = {
        name: formData.name,
        isActive: formData.isActive,
      };

      updateTenant(
        { id: tenantId, data: updateData },
        {
          onSuccess: () => {
            navigate({
              to: "/$lang/app/tenants/$id",
              params: { id: tenantId },
            });
          },
          onError: (error: unknown) => {
            setSubmitError((error as Error).message || t("common.error"));
          },
        },
      );
    } else {
      createTenant(
        {
          name: formData.name,
          schemaName: formData.schemaName || undefined,
        },
        {
          onSuccess: () => {
            navigate({ to: "/$lang/app/tenants" });
          },
          onError: (error: unknown) => {
            setSubmitError((error as Error).message || t("common.error"));
          },
        },
      );
    }
  };

  if (isLoadingTenant) {
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

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {isEditing ? t("common.edit") : t("common.create")}{" "}
        {t("nav.tenant").toLowerCase()}
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label={t("common.name")}
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) {
                setErrors({ ...errors, name: "" });
              }
            }}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
            disabled={isCreating || isUpdating}
          />

          {!isEditing && (
            <TextField
              label={t("common.schemaName")}
              value={formData.schemaName}
              onChange={(e) => {
                setFormData({ ...formData, schemaName: e.target.value });
                if (errors.schemaName) {
                  setErrors({ ...errors, schemaName: "" });
                }
              }}
              error={!!errors.schemaName}
              helperText={errors.schemaName}
              fullWidth
              placeholder="Optional"
              disabled={isCreating || isUpdating}
            />
          )}

          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}
          >
            <Button
              startIcon={<CancelIcon />}
              onClick={() => {
                if (isEditing && tenantId) {
                  navigate({
                    to: "/$lang/app/tenants/$id",
                    params: { id: tenantId },
                  });
                } else {
                  navigate({ to: "/$lang/app/tenants" });
                }
              }}
              disabled={isCreating || isUpdating}
              variant="outlined"
            >
              {t("common.cancel")}
            </Button>
            <Button
              startIcon={<SaveIcon />}
              type="submit"
              variant="contained"
              color="primary"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? (
                <CircularProgress size={20} />
              ) : (
                t("common.save")
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
