import { adminRoutes } from "@/features/admin/adminRoutes";
import { dashboardRoutes } from "@/features/dashboard/dashboardRoutes";
import { financeRoutes } from "@/features/finance/financeRoutes";
import { rolesRoutes } from "@/features/roles/rolesRoutes";
import { usersRoutes } from "@/features/users/usersRoutes";

export const appRoutes = [
  ...dashboardRoutes,
  ...adminRoutes,
  ...usersRoutes,
  ...rolesRoutes,
  ...financeRoutes,
] as const;
