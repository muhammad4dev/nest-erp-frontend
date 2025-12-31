import { adminRoutes } from "@/features/admin/adminRoutes";
import { dashboardRoutes } from "@/features/dashboard/dashboardRoutes";
import { financeRoutes } from "@/features/finance/financeRoutes";
import { inventoryRoutes } from "@/features/inventory/inventoryRoutes";
import { partnersRoutes } from "@/features/partners/partnersRoutes";
import { productsRoutes } from "@/features/products/productsRoutes";
import { rolesRoutes } from "@/features/roles/rolesRoutes";
import { usersRoutes } from "@/features/users/usersRoutes";

export const appRoutes = [
  ...dashboardRoutes,
  ...adminRoutes,
  ...usersRoutes,
  ...rolesRoutes,
  ...financeRoutes,
  ...productsRoutes,
  ...inventoryRoutes,
  ...partnersRoutes,
] as const;
