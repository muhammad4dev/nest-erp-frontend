import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  TablePagination,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import { useDashboardStats } from "@/lib/api/queries";

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t("nav.dashboard")}
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mt: 2 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Users
            </Typography>
            <Typography variant="h4">
              {stats?.totalUsers.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Active Users
            </Typography>
            <Typography variant="h4">
              {stats?.activeUsers.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Revenue
            </Typography>
            <Typography variant="h4">
              ${stats?.revenue.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Stack>
      {/* mock table pagination */}
      <TablePagination
        component="div"
        count={100}
        page={1}
        rowsPerPage={10}
        onPageChange={() => {}}
      />
    </Container>
  );
};
