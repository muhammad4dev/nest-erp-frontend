import PeopleIcon from "@mui/icons-material/People";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AssessmentIcon from "@mui/icons-material/Assessment";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import { useListContracts, useListEmployees } from "@/lib/api/queries";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";

export const HrmsIndexPage = () => {
  const navigate = useAppNavigate();

  const { data: employeesData, isLoading: isLoadingEmployees } =
    useListEmployees({
      skip: 0,
      take: 1,
    });
  const { data: contractsData, isLoading: isLoadingContracts } =
    useListContracts({
      skip: 0,
      take: 1,
    });

  const employeesCount = employeesData?.total ?? 0;
  const contractsCount = contractsData?.total ?? 0;
  const isLoading = isLoadingEmployees || isLoadingContracts;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h3">HRMS Dashboard</Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Welcome to the Human Resource Management System
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PeopleIcon color="primary" />
                    <Typography variant="h6">Employees</Typography>
                  </Stack>
                  {isLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Typography variant="h4">{employeesCount}</Typography>
                  )}
                  <Button
                    size="small"
                    onClick={() =>
                      navigate({ to: "/$lang/app/hrms/employees" })
                    }
                  >
                    Open Employees
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ReceiptLongIcon color="primary" />
                    <Typography variant="h6">Contracts</Typography>
                  </Stack>
                  {isLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Typography variant="h4">{contractsCount}</Typography>
                  )}
                  <Button
                    size="small"
                    onClick={() =>
                      navigate({ to: "/$lang/app/hrms/contracts" })
                    }
                  >
                    Open Contracts
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AssessmentIcon color="primary" />
                    <Typography variant="h6">Reports</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Headcount, salary expense, and expiration analytics.
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button
                      size="small"
                      onClick={() =>
                        navigate({ to: "/$lang/app/hrms/reports/headcount" })
                      }
                    >
                      Headcount
                    </Button>
                    <Button
                      size="small"
                      onClick={() =>
                        navigate({
                          to: "/$lang/app/hrms/reports/salary-expense",
                        })
                      }
                    >
                      Salary
                    </Button>
                    <Button
                      size="small"
                      onClick={() =>
                        navigate({
                          to: "/$lang/app/hrms/reports/contract-expiration",
                        })
                      }
                    >
                      Expiration
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};
