import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { useCreateUser, useUpdateUser } from "@/lib/api/mutations/useIdentity";
import type { User, CreateUserDto, UpdateUserDto } from "@/types/api.types";

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  user?: User;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  onClose,
  user,
}) => {
  const { t } = useTranslation();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const isEdit = !!user;

  // Form state
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [preferences, setPreferences] = React.useState<Record<string, unknown>>(
    {},
  );

  // Error state
  const [formError, setFormError] = React.useState<string | null>(null);

  // Reset form when dialog opens/closes or user changes
  React.useEffect(() => {
    if (open) {
      if (user) {
        setEmail(user.email);
        setPassword(""); // Don't pre-fill password for edit
        setIsActive(user.isActive);
        setPreferences(user.preferences || {});
      } else {
        setEmail("");
        setPassword("");
        setIsActive(true);
        setPreferences({});
      }
      setFormError(null);
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!email || !email.includes("@")) {
      setFormError(
        t(
          "users.validation.invalidEmail",
          "Please enter a valid email address",
        ),
      );
      return;
    }

    if (!isEdit && !password) {
      setFormError(
        t(
          "users.validation.passwordRequired",
          "Password is required for new users",
        ),
      );
      return;
    }

    if (password && password.length < 8) {
      setFormError(
        t(
          "users.validation.passwordTooShort",
          "Password must be at least 8 characters",
        ),
      );
      return;
    }

    try {
      if (isEdit) {
        // Update user (email, isActive, preferences)
        const updateDto: UpdateUserDto = {
          email,
          isActive,
          preferences,
        };
        await updateMutation.mutateAsync({ id: user!.id, data: updateDto });
      } else {
        // Create new user
        const createDto: CreateUserDto = {
          email,
          password,
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
          ? t("users.editUser", "Edit User")
          : t("users.createUser", "Create User")}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          {!isEdit && (
            <>
              <TextField
                label={t("users.email", "Email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                margin="normal"
                disabled={isSubmitting}
              />

              <TextField
                label={t("users.password", "Password")}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                margin="normal"
                disabled={isSubmitting}
                helperText={t(
                  "users.passwordHelp",
                  "Password must be at least 8 characters",
                )}
              />
            </>
          )}

          {isEdit && (
            <>
              <TextField
                label={t("users.email", "Email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                margin="normal"
                disabled={isSubmitting}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    disabled={isSubmitting}
                  />
                }
                label={t("users.isActive", "Active")}
                sx={{ mt: 2 }}
              />
            </>
          )}
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
