import { Menu as MenuIcon } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
} from "@mui/material";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/constants";
import { useLogout } from "@/lib/api/mutations";
import { useMe } from "@/lib/api/queries";
import { IfAllowed } from "@/lib/rbac/components";
import type { Permission, UserRole } from "@/lib/rbac/types";
import { AppLink } from "@/shared/components/ui/AppLink";
import { LocaleSwitcher } from "@/shared/components/ui/LocaleSwitcher";
import { NotificationCenter } from "@/shared/components/ui/NotificationCenter";
import { ThemeToggle } from "@/shared/components/ui/ThemeToggle";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import { useAuthStore } from "@/stores/authStore";

const DRAWER_WIDTH = 240;

export const AppLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Fetch and keep user data fresh (roles, permissions)
  useMe();

  // Note: We don't need to manually switch anchor for RTL.
  // The stylis-plugin-rtl automatically flips left/right in CSS.

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate({
      to: ROUTES.LOGIN,
    });
  };

  type NavItem = {
    to: string;
    label: string;
    roles?: UserRole[];
    permissions?: Permission[];
  };

  const navItems = React.useMemo<NavItem[]>(
    () => [
      {
        to: "/$lang/app/users",
        label: t("nav.users"),
      },
      {
        to: "/$lang/app/roles",
        label: t("nav.roles"),
        roles: ["ADMIN"],
      },
      {
        to: "/$lang/app/finance",
        label: t("nav.finance"),
        roles: ["ADMIN", "MANAGER"],
      },
      {
        to: "/$lang/app/products",
        label: t("nav.products"),
        permissions: ["read:product"],
      },
      {
        to: "/$lang/app/inventory",
        label: t("nav.inventory"),
        permissions: ["read:stock"],
      },
      {
        to: "/$lang/app/partners",
        label: t("nav.partners"),
        permissions: ["read:partner"],
      },
      {
        to: "/$lang/app/procurement",
        label: t("nav.procurement"),
        permissions: ["read:purchase_order"],
      },
      {
        to: "/$lang/app/sales",
        label: t("nav.sales"),
        permissions: ["read:sales_order"],
      },
      {
        to: "/$lang/app/pos",
        label: t("nav.pos"),
        permissions: ["sync:pos"],
      },
    ],
    [t],
  );

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap>
          {t("app.title")}
        </Typography>
      </Toolbar>
      <List>
        {navItems.map((item) => (
          <IfAllowed
            key={item.to}
            roles={item.roles}
            permissions={item.permissions}
          >
            <ListItem disablePadding>
              <ListItemButton
                component={AppLink as React.ElementType}
                to={item.to as string}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          </IfAllowed>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          // RTL/LTR margin is handled by stylis-plugin-rtl
          ml: { sm: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.name}
          </Typography>

          <LocaleSwitcher />

          <ThemeToggle />

          <NotificationCenter />

          <Button color="inherit" onClick={handleLogout}>
            {t("auth.logout")}
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { sm: DRAWER_WIDTH },
          flexShrink: { sm: 0 },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
            },
          }}
          anchor="left"
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
            },
          }}
          anchor="left"
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
        <ReactQueryDevtools initialIsOpen={false} />
        <TanStackRouterDevtools initialIsOpen={false} />
      </Box>
    </Box>
  );
};
