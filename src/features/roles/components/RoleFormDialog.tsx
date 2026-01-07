import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { useCreateRole, useUpdateRole } from "@/lib/api/mutations/useIdentity";
import type { Role, CreateRoleDto, UpdateRoleDto } from "@/types/api.types";

interface RoleFormDialogProps {
  open: boolean;
  onClose: () => void;
  role?: Role;
}

export const RoleFormDialog: React.FC<RoleFormDialogProps> = ({
  open,
  onClose,
  role,
}) => {
  const { t } = useTranslation();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  const isEdit = !!role;

  // Form state
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  // Error state
  const [formError, setFormError] = React.useState<string | null>(null);

  // Reset form when dialog opens/closes or role changes
  React.useEffect(() => {
    if (open) {
      if (role) {
        setName(role.name);
        setDescription(role.description || "");
      } else {
        setName("");
        setDescription("");
      }
      setFormError(null);
    }
  }, [open, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!name || name.trim().length === 0) {
      setFormError(t("roles.validation.nameRequired", "Role name is required"));
      return;
    }

    if (name.trim().length < 3) {
      setFormError(
        t(
          "roles.validation.nameTooShort",
          "Role name must be at least 3 characters",
        ),
      );
      return;
    }

    try {
      if (isEdit) {
        // Update role
        const updateDto: UpdateRoleDto = {
          name: name.trim(),
          description: description.trim() || undefined,
        };
        await updateMutation.mutateAsync({ id: role!.id, data: updateDto });
      } else {
        // Create new role
        const createDto: CreateRoleDto = {
          name: name.trim(),
          description: description.trim() || undefined,
        };
        await createMutation.mutateAsync(createDto);
      }
      onClose();
    } catch (error: unknown) {
      setFormError(
        error instanceof Error
          ? error.message
          : t("common.error", "An error occurred"),
      );
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit
          ? t("roles.editRole", "Edit Role")
          : t("roles.createRole", "Create Role")}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <TextField
            label={t("roles.name", "Name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            margin="normal"
            disabled={isSubmitting}
            helperText={t("roles.nameHelp", "A unique identifier for the role")}
          />

          <TextField
            label={t("roles.description", "Description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            margin="normal"
            disabled={isSubmitting}
            helperText={t(
              "roles.descriptionHelp",
              "Optional description of the role purpose",
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting && <CircularProgress size={16} />}
          >
            {isEdit ? t("common.save", "Save") : t("common.create", "Create")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
