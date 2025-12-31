import { ArrowBack, Save } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  useCreatePartner,
  useUpdatePartner,
} from "@/lib/api/mutations/usePartners";
import { usePartner } from "@/lib/api/queries/usePartners";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type { CreatePartnerDto } from "@/types/api.types";

export function PartnerFormPage() {
  const navigate = useAppNavigate();

  // Get partnerId from route params (only available on /$lang/app/partners/$partnerId route)
  const params = useParams({ strict: false });
  const partnerId = "partnerId" in params ? params.partnerId : undefined;
  const isEditMode = !!partnerId;

  const { data: partner } = usePartner(partnerId || "");
  const createMutation = useCreatePartner();
  const updateMutation = useUpdatePartner();

  const getInitialFormData = (): CreatePartnerDto => {
    if (partner && isEditMode) {
      return {
        name: partner.name || "",
        email: partner.email || "",
        phone: partner.phone || "",
        partnerType: partner.partnerType || "BUSINESS",
        isCustomer: partner.isCustomer || false,
        isVendor: partner.isVendor || false,
        taxId: partner.taxId || "",
        address: partner.address || {
          country: "",
          governate: "",
          regionCity: "",
          street: "",
          buildingNumber: "",
        },
        contact: partner.contact || {
          email: "",
          phone: "",
          fax: "",
        },
      };
    }
    return {
      name: "",
      email: "",
      phone: "",
      partnerType: "BUSINESS",
      isCustomer: false,
      isVendor: false,
      taxId: "",
      address: {
        country: "",
        governate: "",
        regionCity: "",
        street: "",
        buildingNumber: "",
      },
      contact: {
        email: "",
        phone: "",
        fax: "",
      },
    };
  };

  const [formData, setFormData] =
    useState<CreatePartnerDto>(getInitialFormData);

  // Load partner data in edit mode
  useEffect(() => {
    if (partner && isEditMode) {
      setFormData(getInitialFormData());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partner, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && partnerId) {
      await updateMutation.mutateAsync({ id: partnerId, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }

    navigate({ to: "/$lang/app/partners/list" });
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Tooltip title="Go Back">
          <IconButton
            onClick={() => navigate({ to: "/$lang/app/partners/list" })}
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">
          {isEditMode ? "Edit Partner" : "New Partner"}
        </Typography>
      </Stack>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Basic Information
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Partner Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                fullWidth
              />

              <TextField
                select
                label="Entity Type"
                value={formData.partnerType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    partnerType: e.target.value as "BUSINESS" | "PERSON",
                  })
                }
                fullWidth
              >
                <MenuItem value="BUSINESS">Business</MenuItem>
                <MenuItem value="PERSON">Person</MenuItem>
              </TextField>

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  fullWidth
                />
                <TextField
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  fullWidth
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Partner Roles */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Partner Roles
            </Typography>
            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isCustomer}
                    onChange={(e) =>
                      setFormData({ ...formData, isCustomer: e.target.checked })
                    }
                  />
                }
                label="Customer"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isVendor}
                    onChange={(e) =>
                      setFormData({ ...formData, isVendor: e.target.checked })
                    }
                  />
                }
                label="Vendor"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Tax Information
            </Typography>
            <TextField
              label="Tax ID / VAT Number"
              value={formData.taxId}
              onChange={(e) =>
                setFormData({ ...formData, taxId: e.target.value })
              }
              fullWidth
            />
          </CardContent>
        </Card>

        {/* Address */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Address
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Country"
                value={formData.address?.country || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, country: e.target.value },
                  })
                }
                fullWidth
              />
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  label="Governate"
                  value={formData.address?.governate || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: {
                        ...formData.address,
                        governate: e.target.value,
                      },
                    })
                  }
                  fullWidth
                />
                <TextField
                  label="Region/City"
                  value={formData.address?.regionCity || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: {
                        ...formData.address,
                        regionCity: e.target.value,
                      },
                    })
                  }
                  fullWidth
                />
              </Box>
              <TextField
                label="Street"
                value={formData.address?.street || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
                fullWidth
              />
              <TextField
                label="Building Number"
                value={formData.address?.buildingNumber || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: {
                      ...formData.address,
                      buildingNumber: e.target.value,
                    },
                  })
                }
                fullWidth
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Contact Details
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Contact Email"
                type="email"
                value={formData.contact?.email || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, email: e.target.value },
                  })
                }
                fullWidth
              />
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  label="Contact Phone"
                  value={formData.contact?.phone || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, phone: e.target.value },
                    })
                  }
                  fullWidth
                />
                <TextField
                  label="Fax"
                  value={formData.contact?.fax || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, fax: e.target.value },
                    })
                  }
                  fullWidth
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Actions */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={() => navigate({ to: "/$lang/app/partners/list" })}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save />}
            disabled={
              isLoading ||
              !formData.name ||
              (!formData.isCustomer && !formData.isVendor)
            }
          >
            {isLoading ? "Saving..." : "Save Partner"}
          </Button>
        </Stack>
      </form>
    </Container>
  );
}
