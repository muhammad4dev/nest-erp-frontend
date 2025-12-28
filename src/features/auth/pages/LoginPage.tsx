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

  const [email, setEmail] = React.useState("admin@email.com");
  const [password, setPassword] = React.useState("123123");
  const [tenantId, setTenantId] = React.useState(
    "019b70ce-918a-7a54-8302-eef2203a2a22",
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
            >
              Demo: admin@email.com / 123123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
