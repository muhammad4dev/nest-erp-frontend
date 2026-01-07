import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/constants";
import { useLogin } from "@/lib/api/mutations";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const loginMutation = useLogin();

  const [email, setEmail] = React.useState(
    import.meta.env.VITE_DEFAULT_EMAIL || "",
  );
  const [password, setPassword] = React.useState(
    import.meta.env.VITE_DEFAULT_PASSWORD || "",
  );
  const [tenantId, setTenantId] = React.useState(
    import.meta.env.VITE_DEFAULT_TENANT_ID || "",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginMutation.mutateAsync({ email, password, tenantId });
      navigate({
        to: ROUTES.DASHBOARD,
      });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {t("auth.welcomeBack")}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            {loginMutation.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {loginMutation.error?.message || t("auth.loginFailed")}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Tenant ID"
              type="text"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              margin="normal"
              required
              helperText="Enter your tenant UUID"
            />

            <TextField
              fullWidth
              label={t("auth.email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label={t("auth.password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? t("common.loading") : t("auth.signIn")}
            </Button>

            <Typography
              variant="caption"
              display="block"
              sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}
            ></Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
