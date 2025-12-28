import { Add, Delete, Edit, Refresh } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import { useDeleteUser } from "@/lib/api/mutations/useIdentity";
import { useUsers } from "@/lib/api/queries/useIdentity";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type { User } from "@/types/api.types";

export const UsersListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const [search, setSearch] = React.useState("");

  const { data: users, isLoading, refetch } = useUsers({ search });
  const deleteUserMutation = useDeleteUser();

  const handleDelete = async (userId: string) => {
    if (window.confirm(t("users.confirmDelete"))) {
      try {
        await deleteUserMutation.mutateAsync(userId);
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const handleEdit = (userId: string) => {
    navigate({ to: `/identity/users/${userId}` });
  };

  const handleCreate = () => {
    navigate({ to: "/identity/users/new" });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            {t("users.title")}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            {t("users.createUser")}
          </Button>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                fullWidth
                placeholder={t("users.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
              />
              <Tooltip title={t("common.refresh")}>
                <IconButton onClick={() => refetch()}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("users.email")}</TableCell>
                <TableCell>{t("users.firstName")}</TableCell>
                <TableCell>{t("users.lastName")}</TableCell>
                <TableCell>{t("users.roles")}</TableCell>
                <TableCell>{t("common.status")}</TableCell>
                <TableCell align="right">{t("common.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              ) : users?.items && users.items.length > 0 ? (
                users.items.map((user: User) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.firstName || "-"}</TableCell>
                    <TableCell>{user.lastName || "-"}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {user.roles?.map((role) => (
                          <Chip
                            key={role.id}
                            label={role.name}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          user.isActive
                            ? t("users.active")
                            : t("users.inactive")
                        }
                        color={user.isActive ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={t("common.edit")}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(user.id)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("common.delete")}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(user.id)}
                          disabled={deleteUserMutation.isPending}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {t("common.noData")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};
