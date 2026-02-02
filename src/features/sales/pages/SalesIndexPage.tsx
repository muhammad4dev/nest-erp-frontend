import { Assessment, Description, Receipt } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";

import { useAppNavigate } from "@/shared/hooks/useAppNavigate";

export function SalesIndexPage() {
  const navigate = useAppNavigate();

  const menuItems = [
    {
      title: "Sales Orders",
      description: "Manage quotations and sales orders",
      icon: <Receipt fontSize="large" />,
      path: "/$lang/app/sales/orders" as const,
      color: "#1976d2",
    },
    {
      title: "Invoices",
      description: "View and manage customer invoices",
      icon: <Description fontSize="large" />,
      path: "/$lang/app/sales/invoices" as const,
      color: "#2e7d32",
    },
    {
      title: "Reports",
      description: "Sales analysis and AR aging",
      icon: <Assessment fontSize="large" />,
      path: "/$lang/app/sales/reports" as const,
      color: "#ed6c02",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sales Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage sales orders, quotations, invoices, and customer relationships
      </Typography>

      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.path}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate({ to: item.path })}
            >
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: `${item.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    color: item.color,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
