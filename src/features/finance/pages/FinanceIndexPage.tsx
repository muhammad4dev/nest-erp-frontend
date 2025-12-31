import {
  AccountBalance,
  Assessment,
  CalendarToday,
  Receipt,
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

export function FinanceIndexPage() {
  const navigate = useAppNavigate();

  const menuItems = [
    {
      title: "Chart of Accounts",
      description: "Manage accounts and account hierarchy",
      icon: <AccountBalance fontSize="large" />,
      path: "/$lang/app/finance/accounts" as const,
      color: "#1976d2",
    },
    {
      title: "Journal Entries",
      description: "Create and manage journal entries",
      icon: <Receipt fontSize="large" />,
      path: "/$lang/app/finance/journal-entries" as const,
      color: "#2e7d32",
    },
    {
      title: "Fiscal Periods",
      description: "Manage fiscal periods and closing",
      icon: <CalendarToday fontSize="large" />,
      path: "/$lang/app/finance/periods" as const,
      color: "#ed6c02",
    },
    {
      title: "Reports",
      description: "Trial Balance & General Ledger",
      icon: <Assessment fontSize="large" />,
      path: "/$lang/app/finance/reports/trial-balance" as const,
      color: "#9c27b0",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Finance & Accounting
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your organization&apos;s financial records, accounts, and reports
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
