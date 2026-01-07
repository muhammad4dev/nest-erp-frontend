import { Refresh } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import type { Role } from "@/types/api.types";

interface UsersFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedRole: string;
  onRoleChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  roles?: Role[];
  onRefresh: () => void;
}

export const UsersFilterBar = ({
  search,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  roles = [],
  onRefresh,
}: UsersFilterBarProps) => {
  const { t } = useTranslation();

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder={t("users.searchPlaceholder")}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            size="small"
            sx={{ width: 300 }}
          />
          <FormControl size="small" sx={{ width: 200 }}>
            <InputLabel>{t("users.roles")}</InputLabel>
            <Select
              value={selectedRole}
              label={t("users.roles")}
              onChange={(e) => onRoleChange(e.target.value)}
            >
              <MenuItem value="ALL">{t("common.all")}</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.name}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ width: 200 }}>
            <InputLabel>{t("common.status")}</InputLabel>
            <Select
              value={selectedStatus}
              label={t("common.status")}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <MenuItem value="ALL">{t("common.all")}</MenuItem>
              <MenuItem value="active">{t("users.active")}</MenuItem>
              <MenuItem value="inactive">{t("users.inactive")}</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title={t("common.refresh")}>
            <IconButton onClick={onRefresh}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};
