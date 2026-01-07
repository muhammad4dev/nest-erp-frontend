import { Delete, Edit, Security, Person } from "@mui/icons-material";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import type { User } from "@/types/api.types";

interface UsersTableProps {
  users?: User[];
  isLoading: boolean;
  onView: (userId: string) => void;
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
  onManageRoles: (user: User) => void;
  isDeleting: boolean;
}

export const UsersTable = ({
  users,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onManageRoles,
  isDeleting,
}: UsersTableProps) => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t("users.email")}</TableCell>
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
          ) : users && users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {(user.roles ?? []).map((role) => (
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
                      user.isActive ? t("users.active") : t("users.inactive")
                    }
                    color={user.isActive ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={t("common.view", "View Profile")}>
                    <IconButton size="small" onClick={() => onView(user.id)}>
                      <Person fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("users.assignRoles")}>
                    <IconButton
                      size="small"
                      onClick={() => onManageRoles(user)}
                    >
                      <Security fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("common.edit")}>
                    <IconButton size="small" onClick={() => onEdit(user.id)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("common.delete")}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(user.id)}
                      disabled={isDeleting}
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
  );
};
