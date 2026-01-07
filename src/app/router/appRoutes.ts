import { financeRoutes } from "@/features/finance/financeRoutes";
import { inventoryRoutes } from "@/features/inventory/inventoryRoutes";
import { partnersRoutes } from "@/features/partners/partnersRoutes";
import { procurementRoutes } from "@/features/procurement/procurementRoutes";
import { productsRoutes } from "@/features/products/productsRoutes";
import { rolesRoutes } from "@/features/roles/rolesRoutes";
import { usersRoutes } from "@/features/users/usersRoutes";

export const appRoutes = [
  ...usersRoutes,
  ...rolesRoutes,
  ...financeRoutes,
  ...productsRoutes,
  ...inventoryRoutes,
  ...partnersRoutes,
  ...procurementRoutes,
] as const;
