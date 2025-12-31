import { Group, Business, Person } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";

import { useAppNavigate } from "@/shared/hooks/useAppNavigate";

export function PartnersIndexPage() {
  const navigate = useAppNavigate();

  const menuItems = [
    {
      title: "All Partners",
      description: "View and manage all partners",
      icon: <Group fontSize="large" />,
      path: "/$lang/app/partners/list" as const,
      color: "#1976d2",
    },
    {
      title: "Customers",
      description: "Manage customer relationships",
      icon: <Person fontSize="large" />,
      path: "/$lang/app/partners/list" as const,
      filter: { isCustomer: true },
      color: "#2e7d32",
    },
    {
      title: "Vendors",
      description: "Manage vendor relationships",
      icon: <Business fontSize="large" />,
      path: "/$lang/app/partners/list" as const,
      filter: { isVendor: true },
      color: "#ed6c02",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Partners Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your customers, vendors, and business relationships
      </Typography>

      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.title}>
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
