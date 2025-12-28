import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";

import {
  useAssignUserRole,
  useRemoveUserRole,
} from "@/lib/api/mutations/useIdentity";
import { useRoles } from "@/lib/api/queries/useIdentity";
import type { User } from "@/types/api.types";

interface UserRoleDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

export const UserRoleDialog: React.FC<UserRoleDialogProps> = ({
  open,
  onClose,
  user,
}) => {
  const { t } = useTranslation();
  const assignRoleMutation = useAssignUserRole();
  const removeRoleMutation = useRemoveUserRole();
  const { data: rolesData, isLoading: rolesLoading } = useRoles();

  const roles = React.useMemo(() => {
    return Array.isArray(rolesData) ? rolesData : rolesData?.data || [];
  }, [rolesData]);

  // Form state
  const [selectedRoleIds, setSelectedRoleIds] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  // Initialize roles from user
  React.useEffect(() => {
    if (open) {
      setSelectedRoleIds(user.roles?.map((r) => r.id) || []);
      setError(null);
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedRoleIds.length === 0) {
      setError(
        t("users.validation.rolesRequired", "Please select at least one role")
      );
      return;
    }

    try {
      const currentRoleIds = user.roles?.map((r) => r.id) || [];
      const rolesToAdd = selectedRoleIds.filter(
        (id) => !currentRoleIds.includes(id)
      );
      const rolesToRemove = currentRoleIds.filter(
        (id) => !selectedRoleIds.includes(id)
      );

      // Assign new roles
      for (const roleId of rolesToAdd) {
        await assignRoleMutation.mutateAsync({ userId: user.id, roleId });
      }

      // Remove old roles
      for (const roleId of rolesToRemove) {
        await removeRoleMutation.mutateAsync({ userId: user.id, roleId });
      }

      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : t("common.error", "An error occurred")
      );
    }
  };

  const isSubmitting =
    assignRoleMutation.isPending || removeRoleMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("users.assignRoles", "Assign Roles to")} {user.email}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl
            fullWidth
            margin="normal"
            required
            disabled={rolesLoading || isSubmitting}
          >
            <InputLabel>{t("users.roles", "Roles")}</InputLabel>
            <Select
              multiple
              value={selectedRoleIds}
              onChange={(e) => setSelectedRoleIds(e.target.value as string[])}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((roleId) => {
                    const role = roles.find((r) => r.id === roleId);
                    return role ? (
                      <Chip key={roleId} label={role.name} size="small" />
                    ) : null;
                  })}
                </Box>
              )}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                  {role.description && (
                    <Box
                      component="span"
                      sx={{
                        ml: 1,
                        color: "text.secondary",
                        fontSize: "0.875rem",
                      }}
                    >
                      - {role.description}
                    </Box>
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || rolesLoading}
            startIcon={isSubmitting && <CircularProgress size={16} />}
          >
            {t("common.save", "Save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
