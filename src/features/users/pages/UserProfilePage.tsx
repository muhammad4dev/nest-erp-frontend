import { ArrowBack, Edit as EditIcon } from "@mui/icons-material";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useParams } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { useUser } from "@/lib/api/queries/useIdentity";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";

import { UserFormDialog } from "../components/UserFormDialog";

export const UserProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const { userId } = useParams({ from: "/$lang/app/users/$userId" });

  const { data: user, isLoading, error } = useUser(userId);

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error?.message || t("users.notFound", "User not found")}
          </Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate({ to: "/$lang/app/users" })}
          >
            {t("users.backToList", "Back to User Directory")}
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate({ to: "/$lang/app/users" })}
        >
          {t("common.back", "Back")}
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => setIsEditDialogOpen(true)}
        >
          {t("common.edit", "Edit")}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Main Info Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {user.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("users.userId", "User ID")}: {user.id}
                </Typography>
              </Box>
              <Chip
                label={
                  user.isActive
                    ? t("common.active", "Active")
                    : t("common.inactive", "Inactive")
                }
                color={user.isActive ? "success" : "default"}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {t("users.createdAt", "Created At")}
                </Typography>
                <Typography variant="body1">
                  {new Date(user.createdAt).toLocaleString()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {t("users.updatedAt", "Updated At")}
                </Typography>
                <Typography variant="body1">
                  {new Date(user.updatedAt).toLocaleString()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {t("users.version", "Version")}
                </Typography>
                <Typography variant="body1">{user.version}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {t("users.tenantId", "Tenant ID")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    overflowWrap: "break-word",
                  }}
                >
                  {user.tenantId}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Roles Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t("users.roles", "Roles")}
            </Typography>
            <Stack direction="column" spacing={1}>
              {user.roles?.map((role) => (
                <Chip
                  key={role.id}
                  label={role.name}
                  color={role.name === "ADMIN" ? "primary" : "default"}
                />
              ))}
            </Stack>
            {(!user.roles || user.roles.length === 0) && (
              <Typography variant="body2" color="text.secondary">
                {t("users.noRoles", "No roles assigned")}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Permissions Card */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t("users.permissions", "Permissions")}
            </Typography>
            {user.permissions && user.permissions.length > 0 ? (
              <List dense>
                {user.permissions.map((permission) => (
                  <ListItem key={permission.action + permission.resource}>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", gap: 1, alignItems: "center" }}
                        >
                          <Chip
                            label={permission.action}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Typography variant="body2">
                            on <strong>{permission.resource}</strong>
                          </Typography>
                        </Box>
                      }
                      secondary={permission.description}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t("users.noPermissions", "No permissions assigned")}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Preferences Card */}
        {user.preferences && Object.keys(user.preferences).length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t("users.preferences", "Preferences")}
              </Typography>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  overflow: "auto",
                  fontSize: "0.875rem",
                }}
              >
                {JSON.stringify(user.preferences, null, 2)}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      <UserFormDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        user={user}
      />
    </Container>
  );
};
