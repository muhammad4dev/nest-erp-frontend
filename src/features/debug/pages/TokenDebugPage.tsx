import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
} from "@mui/material";
import { useState } from "react";

import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";

/**
 * Debug page to test token refresh functionality
 * Access at /en/token-debug (add route manually for testing)
 */
export const TokenDebugPage = () => {
  const { user } = useAuthStore();
  const [testResult, setTestResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  const testAuthEndpoint = async () => {
    try {
      setError("");
      setTestResult("Testing /auth/me...");
      const result = await apiClient.get("/auth/me");
      setTestResult(`Success: ${JSON.stringify(result, null, 2)}`);
    } catch (err) {
      setError(`Failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const checkTokenExpiry = () => {
    if (!user?.token) {
      setTestResult("No token found");
      return;
    }

    try {
      const payload = JSON.parse(atob(user.token.split(".")[1]));
      const expiresAt = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = now > expiresAt;
      const timeLeft = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);

      setTestResult(
        `Token expires at: ${expiresAt.toLocaleString()}\n` +
          `Current time: ${now.toLocaleString()}\n` +
          `Expired: ${isExpired}\n` +
          `Time left: ${isExpired ? "EXPIRED" : `${timeLeft}s`}\n\n` +
          `Payload: ${JSON.stringify(payload, null, 2)}`,
      );
    } catch (err) {
      setError(
        `Failed to decode token: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Token Debug Page
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Auth State
          </Typography>
          <Typography
            variant="body2"
            component="pre"
            sx={{ whiteSpace: "pre-wrap", fontSize: "0.75rem" }}
          >
            {JSON.stringify(
              {
                isAuthenticated: !!user,
                userId: user?.id,
                email: user?.email,
                tenantId: user?.tenantId,
                hasAccessToken: !!user?.token,
                hasRefreshToken: !!user?.refreshToken,
                accessTokenPreview: user?.token?.substring(0, 50) + "...",
                refreshTokenPreview:
                  user?.refreshToken?.substring(0, 50) + "...",
              },
              null,
              2,
            )}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Actions
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button variant="contained" onClick={checkTokenExpiry}>
              Check Token Expiry
            </Button>
            <Button
              variant="contained"
              onClick={testAuthEndpoint}
              color="secondary"
            >
              Test /auth/me (triggers refresh if expired)
            </Button>
          </Box>
        </CardContent>
      </Card>

      {testResult && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            component="pre"
            sx={{ whiteSpace: "pre-wrap", fontSize: "0.75rem" }}
          >
            {testResult}
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            component="pre"
            sx={{ whiteSpace: "pre-wrap", fontSize: "0.75rem" }}
          >
            {error}
          </Typography>
        </Alert>
      )}

      <Alert severity="warning">
        <Typography variant="body2">
          <strong>How to test:</strong>
          <ol style={{ marginTop: 8, marginBottom: 0 }}>
            <li>
              Click &ldquo;Check Token Expiry&rdquo; to see when your token
              expires
            </li>
            <li>
              Wait for the token to expire (or manually change the token in
              localStorage to an expired one)
            </li>
            <li>
              Click &ldquo;Test /auth/me&rdquo; to trigger an API call that
              should refresh the token
            </li>
            <li>
              Check browser console for detailed logs: &ldquo;Attempting token
              refresh...&rdquo;, &ldquo;Token refresh successful&rdquo;, etc.
            </li>
            <li>
              If refresh works, you should see new token data without being
              logged out
            </li>
          </ol>
        </Typography>
      </Alert>
    </Box>
  );
};
