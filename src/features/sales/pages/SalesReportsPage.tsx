import { Card, CardContent, Container, Typography } from "@mui/material";

export function SalesReportsPage() {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sales Reports
      </Typography>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sales Analysis
          </Typography>
          <Typography color="text.secondary">
            Sales analysis report with filters coming soon...
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            AR Aging Report
          </Typography>
          <Typography color="text.secondary">
            Accounts receivable aging report coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
