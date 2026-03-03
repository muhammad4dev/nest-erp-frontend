import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { appRoute } from "@/app/router/layouts";
import { RouteGuard } from "@/app/router/routeGuard";

// HRMS Index Route
// Path: /app/hrms
const hrmsIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "hrms",
  component: lazyRouteComponent(() =>
    import("./pages/HrmsIndexPage").then((m) => ({
      default: m.HrmsIndexPage,
    })),
  ),
  beforeLoad: ({ params }) =>
    RouteGuard({ permissions: ["read:employee"] }, params),
});

// Employee List Route
// Path: /app/hrms/employees
const employeeListRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "hrms/employees",
  component: lazyRouteComponent(() =>
    import("./pages/EmployeeListPage").then((m) => ({
      default: m.EmployeeListPage,
    })),
  ),
  beforeLoad: ({ params }) =>
    RouteGuard({ permissions: ["read:employee"] }, params),
});

// Employee Create Route
// Path: /app/hrms/employees/new
const employeeCreateRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "hrms/employees/new",
  component: lazyRouteComponent(() =>
    import("./pages/EmployeeFormPage").then((m) => ({
      default: m.EmployeeFormPage,
    })),
  ),
  beforeLoad: ({ params }) =>
    RouteGuard({ permissions: ["create:employee"] }, params),
});

// Employee Detail Route
// Path: /app/hrms/employees/:employeeId
const employeeDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "hrms/employees/$employeeId",
  component: lazyRouteComponent(() =>
    import("./pages/EmployeeDetailPage").then((m) => ({
      default: m.EmployeeDetailPage,
    })),
  ),
  beforeLoad: ({ params }) =>
    RouteGuard({ permissions: ["read:employee"] }, params),
});

// Employee Edit Route
// Path: /app/hrms/employees/:employeeId/edit
const employeeEditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "hrms/employees/$employeeId/edit",
  component: lazyRouteComponent(() =>
    import("./pages/EmployeeFormPage").then((m) => ({
      default: m.EmployeeFormPage,
    })),
  ),
  beforeLoad: ({ params }) =>
    RouteGuard({ permissions: ["update:employee"] }, params),
});

// Employee Contracts Route
// Path: /app/hrms/employees/:employeeId/contracts
const employeeContractsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "hrms/employees/$employeeId/contracts",
  component: lazyRouteComponent(() =>
    import("./pages/EmployeeContractsPage").then((m) => ({
      default: m.EmployeeContractsPage,
    })),
  ),
  beforeLoad: ({ params }) =>
    RouteGuard({ permissions: ["read:employment_contract"] }, params),
});

// Contract List Route
// Path: /app/hrms/contracts
const contractListRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "hrms/contracts",
  component: lazyRouteComponent(() =>
    import("./pages/ContractListPage").then((m) => ({
      default: m.ContractListPage,
    })),
  ),
  beforeLoad: ({ params }) =>
    RouteGuard({ permissions: ["read:employment_contract"] }, params),
});

// Contract Detail Route
// Path: /app/hrms/contracts/:contractId
const contractDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "hrms/contracts/$contractId",
  component: lazyRouteComponent(() =>
    import("./pages/ContractDetailPage").then((m) => ({
      default: m.ContractDetailPage,
    })),
  ),
  beforeLoad: ({ params }) =>
    RouteGuard({ permissions: ["read:employment_contract"] }, params),
});

// Contract Edit Route
// Path: /app/hrms/contracts/:contractId/edit
const contractEditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "hrms/contracts/$contractId/edit",
  component: lazyRouteComponent(() =>
    import("./pages/ContractFormPage").then((m) => ({
      default: m.ContractFormPage,
    })),
  ),
  beforeLoad: ({ params }) =>
    RouteGuard({ permissions: ["update:employment_contract"] }, params),
});

// Headcount Report Route
// Path: /app/hrms/reports/headcount
const headcountReportRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "hrms/reports/headcount",
  component: lazyRouteComponent(() =>
    import("./pages/HeadcountReportPage").then((m) => ({
      default: m.HeadcountReportPage,
    })),
  ),
  beforeLoad: ({ params }) =>
    RouteGuard({ permissions: ["read:hrms_reports"] }, params),
});

// Salary Expense Report Route
// Path: /app/hrms/reports/salary-expense
const salaryExpenseReportRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "hrms/reports/salary-expense",
  component: lazyRouteComponent(() =>
    import("./pages/SalaryExpenseReportPage").then((m) => ({
      default: m.SalaryExpenseReportPage,
    })),
  ),
  beforeLoad: ({ params }) =>
    RouteGuard({ permissions: ["read:hrms_reports"] }, params),
});

// Contract Expiration Report Route
// Path: /app/hrms/reports/contract-expiration
const contractExpirationReportRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "hrms/reports/contract-expiration",
  component: lazyRouteComponent(() =>
    import("./pages/ContractExpirationReportPage").then((m) => ({
      default: m.ContractExpirationReportPage,
    })),
  ),
  beforeLoad: ({ params }) =>
    RouteGuard({ permissions: ["read:hrms_reports"] }, params),
});

export const hrmsRoutes = [
  hrmsIndexRoute,
  employeeListRoute,
  employeeCreateRoute,
  employeeDetailRoute,
  employeeEditRoute,
  employeeContractsRoute,
  contractListRoute,
  contractDetailRoute,
  contractEditRoute,
  headcountReportRoute,
  salaryExpenseReportRoute,
  contractExpirationReportRoute,
] as const;
