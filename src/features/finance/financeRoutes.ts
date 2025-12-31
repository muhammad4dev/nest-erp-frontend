import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { appRoute } from "@/app/router/layouts";
import { RouteGuard } from "@/app/router/routeGuard";

const financeIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "finance",
  component: lazyRouteComponent(() =>
    import("./pages/FinanceIndexPage").then((m) => ({
      default: m.FinanceIndexPage,
    }))
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ roles: ["ADMIN", "MANAGER"] }, params),
});

const accountsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "finance/accounts",
  component: lazyRouteComponent(() =>
    import("./pages/AccountsListPage").then((m) => ({
      default: m.AccountsListPage,
    }))
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ roles: ["ADMIN", "MANAGER"] }, params),
});

const journalEntriesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "finance/journal-entries",
  component: lazyRouteComponent(() =>
    import("./pages/JournalEntriesListPage").then((m) => ({
      default: m.JournalEntriesListPage,
    }))
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ roles: ["ADMIN", "MANAGER"] }, params),
});

const fiscalPeriodsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "finance/periods",
  component: lazyRouteComponent(() =>
    import("./pages/FiscalPeriodsPage").then((m) => ({
      default: m.FiscalPeriodsPage,
    }))
  ),
  beforeLoad: async ({ params }) => RouteGuard({ roles: ["ADMIN"] }, params),
});

const trialBalanceRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "finance/reports/trial-balance",
  component: lazyRouteComponent(() =>
    import("./pages/TrialBalancePage").then((m) => ({
      default: m.TrialBalancePage,
    }))
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ roles: ["ADMIN", "MANAGER"] }, params),
});

const generalLedgerRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "finance/reports/general-ledger",
  component: lazyRouteComponent(() =>
    import("./pages/GeneralLedgerPage").then((m) => ({
      default: m.GeneralLedgerPage,
    }))
  ),
  beforeLoad: async ({ params }) =>
    RouteGuard({ roles: ["ADMIN", "MANAGER"] }, params),
});

export const financeRoutes = [
  financeIndexRoute,
  accountsRoute,
  journalEntriesRoute,
  fiscalPeriodsRoute,
  trialBalanceRoute,
  generalLedgerRoute,
] as const;
