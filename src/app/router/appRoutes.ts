import { financeRoutes } from "@/features/finance/financeRoutes";
import { inventoryRoutes } from "@/features/inventory/inventoryRoutes";
import { partnersRoutes } from "@/features/partners/partnersRoutes";
import { posRoutes } from "@/features/pos/posRoutes";
import { procurementRoutes } from "@/features/procurement/procurementRoutes";
import { productsRoutes } from "@/features/products/productsRoutes";
import { rolesRoutes } from "@/features/roles/rolesRoutes";
import { salesRoutes } from "@/features/sales/salesRoutes";
import { tenantsRoutes } from "@/features/tenants/tenantsRoutes";
import { usersRoutes } from "@/features/users/usersRoutes";
import { hrmsRoutes } from "@/features/hrms/hrmsRoutes";

export const appRoutes = [
  ...usersRoutes,
  ...rolesRoutes,
  ...tenantsRoutes,
  ...hrmsRoutes,
  ...financeRoutes,
  ...productsRoutes,
  ...inventoryRoutes,
  ...partnersRoutes,
  ...procurementRoutes,
  ...salesRoutes,
  ...posRoutes,
] as const;
