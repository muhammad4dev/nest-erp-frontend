import {
  Assignment,
  Description,
  Receipt,
  ShoppingCart,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";

import { useAppNavigate } from "@/shared/hooks/useAppNavigate";

export function ProcurementIndexPage() {
  const navigate = useAppNavigate();

  const features = [
    {
      title: "Requests for Quotation",
      description: "Create and manage RFQs",
      icon: <Assignment sx={{ fontSize: 40, mb: 2, color: "#1976d2" }} />,
      path: "/$lang/app/procurement/rfq" as const,
      color: "#1976d2",
    },
    {
      title: "Purchase Orders",
      description: "Manage confirmed orders",
      icon: <ShoppingCart sx={{ fontSize: 40, mb: 2, color: "#2e7d32" }} />,
      path: "/$lang/app/procurement/orders" as const,
      color: "#2e7d32",
    },
    {
      title: "Vendor Bills",
      description: "Track and post bills",
      icon: <Description sx={{ fontSize: 40, mb: 2, color: "#ed6c02" }} />,
      path: "/$lang/app/procurement/bills" as const,
      color: "#ed6c02",
    },
    {
      title: "AP Aging Report",
      description: "Accounts payable aging",
      icon: <Receipt sx={{ fontSize: 40, mb: 2, color: "#9c27b0" }} />,
      path: "/$lang/app/procurement/reports/ap-aging" as const,
      color: "#9c27b0",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Procurement Management
      </Typography>

      <Grid container spacing={3}>
        {features.map((feature) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={feature.title}>
            <Card
              onClick={() => navigate({ to: feature.path })}
              sx={{
                cursor: "pointer",
                height: "100%",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  {feature.icon}
                  <Typography variant="h6" sx={{ mb: 1, color: feature.color }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
