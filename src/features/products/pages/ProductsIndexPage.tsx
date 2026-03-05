import {
  Category,
  Inventory,
  Label,
  Warehouse,
  Translate,
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

export function ProductsIndexPage() {
  const navigate = useAppNavigate();

  const menuItems = [
    {
      title: "Products Catalog",
      description: "Manage products, SKUs, and pricing",
      icon: <Inventory fontSize="large" />,
      path: "/$lang/app/products/list" as const,
      color: "#1976d2",
    },
    {
      title: "Categories",
      description: "Organize products in hierarchical categories",
      icon: <Category fontSize="large" />,
      path: "/$lang/app/products/categories" as const,
      color: "#2e7d32",
    },
    {
      title: "Attributes",
      description: "Define product attributes and variants",
      icon: <Label fontSize="large" />,
      path: "/$lang/app/products/attributes" as const,
      color: "#ed6c02",
    },
    {
      title: "Stock & Locations",
      description: "Manage inventory and stock locations",
      icon: <Warehouse fontSize="large" />,
      path: "/$lang/app/products/stock" as const,
      color: "#9c27b0",
    },
    {
      title: "Product Translations",
      description: "Manage product translations in multiple languages",
      icon: <Translate fontSize="large" />,
      path: "/$lang/app/i18n/product-translations" as const,
      color: "#0288d1",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Products & Inventory
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your product catalog, inventory, and stock across locations
      </Typography>

      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.path}>
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
