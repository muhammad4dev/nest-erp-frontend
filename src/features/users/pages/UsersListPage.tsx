import { Add } from "@mui/icons-material";
import { Box, Button, Container, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import { useDeleteUser } from "@/lib/api/mutations/useIdentity";
import { useRoles, useUsers } from "@/lib/api/queries/useIdentity";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type { User } from "@/types/api.types";

import { UserFormDialog } from "../components/UserFormDialog";
import { UserRoleDialog } from "../components/UserRoleDialog";
import { UsersFilterBar } from "../components/UsersFilterBar";
import { UsersTable } from "../components/UsersTable";

export const UsersListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const [search, setSearch] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("ALL");

  // State for dialogs
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | undefined>();
  const [selectedUserForRoles, setSelectedUserForRoles] = React.useState<
    User | undefined
  >();

  const { data: roles } = useRoles();

  const {
    data: users,
    isLoading,
    refetch,
  } = useUsers({
    search,
    role: selectedRole === "ALL" ? undefined : selectedRole,
    isActive:
      selectedStatus === "ALL" ? undefined : selectedStatus === "active",
  });
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
    const user = users?.find((u) => u.id === userId);
    if (user) {
      setEditingUser(user);
      setIsFormDialogOpen(true);
    }
  };

  const handleCreate = () => {
    setEditingUser(undefined);
    setIsFormDialogOpen(true);
  };

  const handleView = (userId: string) => {
    navigate({ to: "/$lang/app/users/$userId", params: { userId } });
  };

  const handleManageRoles = (user: User) => {
    setSelectedUserForRoles(user);
    setIsRoleDialogOpen(true);
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
        <UsersFilterBar
          search={search}
          onSearchChange={setSearch}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          roles={roles}
          onRefresh={() => refetch()}
        />
        <UsersTable
          users={users}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManageRoles={handleManageRoles}
          isDeleting={deleteUserMutation.isPending}
        />
      </Box>

      <UserFormDialog
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        user={editingUser}
      />

      {selectedUserForRoles && (
        <UserRoleDialog
          open={isRoleDialogOpen}
          onClose={() => setIsRoleDialogOpen(false)}
          user={selectedUserForRoles}
        />
      )}
    </Container>
  );
};
