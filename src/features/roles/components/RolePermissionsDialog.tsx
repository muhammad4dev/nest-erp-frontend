import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
  Chip,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { useAssignRolePermissions } from "@/lib/api/mutations/useIdentity";
import { usePermissions } from "@/lib/api/queries/useIdentity";
import type { Role, Permission } from "@/types/api.types";

interface RolePermissionsDialogProps {
  open: boolean;
  onClose: () => void;
  role: Role;
}

export const RolePermissionsDialog: React.FC<RolePermissionsDialogProps> = ({
  open,
  onClose,
  role,
}) => {
  const { t } = useTranslation();
  const assignPermissionsMutation = useAssignRolePermissions();
  const { data: permissionsResponse, isLoading: permissionsLoading } =
    usePermissions();

  const allPermissions = React.useMemo(() => {
    return permissionsResponse || [];
  }, [permissionsResponse]);

  // Group permissions by resource
  const groupedPermissions = React.useMemo(() => {
    const grouped: Record<string, Permission[]> = {};
    allPermissions.forEach((permission) => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
      grouped[permission.resource].push(permission);
    });
    return grouped;
  }, [allPermissions]);

  // Form state - use permission IDs for type safety
  const [selectedPermissionIds, setSelectedPermissionIds] = React.useState<
    string[]
  >([]);
  const [error, setError] = React.useState<string | null>(null);

  // Initialize permissions from role
  React.useEffect(() => {
    if (open) {
      setSelectedPermissionIds((role.permissions ?? []).map((p) => p.id));
      setError(null);
    }
  }, [open, role]);

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  const handleToggleResource = (resource: string) => {
    const resourcePermissions = groupedPermissions[resource];
    const resourcePermissionIds = resourcePermissions.map((p) => p.id);
    const allSelected = resourcePermissionIds.every((id) =>
      selectedPermissionIds.includes(id),
    );

    if (allSelected) {
      // Deselect all
      setSelectedPermissionIds((prev) =>
        prev.filter((id) => !resourcePermissionIds.includes(id)),
      );
    } else {
      // Select all
      setSelectedPermissionIds((prev) => [
        ...new Set([...prev, ...resourcePermissionIds]),
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await assignPermissionsMutation.mutateAsync({
        roleId: role.id,
        permissionIds: selectedPermissionIds,
      });
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : t("common.error", "An error occurred"),
      );
    }
  };

  const isSubmitting = assignPermissionsMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6">
            {t("roles.managePermissions", "Manage Permissions")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {role.name} - {role.description}
          </Typography>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {permissionsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {Object.keys(groupedPermissions).length === 0 ? (
                <Alert severity="info">
                  {t("roles.noPermissions", "No permissions available")}
                </Alert>
              ) : (
                Object.entries(groupedPermissions).map(
                  ([resource, permissions]) => {
                    const resourcePermissionIds = permissions.map((p) => p.id);
                    const allSelected = resourcePermissionIds.every((id) =>
                      selectedPermissionIds.includes(id),
                    );
                    const someSelected = resourcePermissionIds.some((id) =>
                      selectedPermissionIds.includes(id),
                    );

                    return (
                      <Box key={resource} sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={allSelected}
                                indeterminate={someSelected && !allSelected}
                                onChange={() => handleToggleResource(resource)}
                                disabled={isSubmitting}
                              />
                            }
                            label={
                              <Typography variant="h6" fontWeight="bold">
                                {resource.toUpperCase()}
                              </Typography>
                            }
                          />
                          <Chip
                            label={`${permissions.filter((p) => selectedPermissionIds.includes(p.id)).length}/${permissions.length}`}
                            size="small"
                            color={allSelected ? "primary" : "default"}
                            sx={{ ml: 1 }}
                          />
                        </Box>
                        <Divider sx={{ mb: 1 }} />
                        <Box sx={{ pl: 4 }}>
                          {permissions.map((permission) => (
                            <FormControlLabel
                              key={permission.id}
                              control={
                                <Checkbox
                                  checked={selectedPermissionIds.includes(
                                    permission.id,
                                  )}
                                  onChange={() =>
                                    handleTogglePermission(permission.id)
                                  }
                                  disabled={isSubmitting}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body1">
                                    {permission.action}:{permission.resource}
                                  </Typography>
                                  {permission.description && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {permission.description}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          ))}
                        </Box>
                      </Box>
                    );
                  },
                )
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || permissionsLoading}
            startIcon={isSubmitting && <CircularProgress size={16} />}
          >
            {t("common.save", "Save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
