import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAddProductTranslation } from "@/lib/api/mutations/useI18n";
import { useProductTranslations } from "@/lib/api/queries/useI18n";
import { useProducts } from "@/lib/api/queries/useProducts";

const SUPPORTED_LOCALES = ["en", "fr", "es", "de", "it", "pt", "ja", "zh"];

export default function ProductTranslationsPage() {
  const { t } = useTranslation();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    locale: "",
    name: "",
    description: "",
  });

  const { data: products, isLoading: productsLoading } = useProducts();

  // Always call the hook, but pass an empty string if no product selected
  const { data: translations = [], isLoading: translationsLoading } =
    useProductTranslations(selectedProductId || "");
  const addTranslation = useAddProductTranslation();

  const handleAddTranslation = () => {
    if (!selectedProductId || !formData.locale || !formData.name) {
      return;
    }

    addTranslation.mutate(
      {
        productId: selectedProductId,
        locale: formData.locale,
        name: formData.name,
      },
      {
        onSuccess: () => {
          setFormData({ locale: "", name: "", description: "" });
          setOpenDialog(false);
        },
      },
    );
  };

  const getTranslationForLocale = (locale: string) => {
    return translations?.find((t) => t.locale === locale);
  };

  const availableLocalesForProduct = SUPPORTED_LOCALES.filter(
    (locale) => !getTranslationForLocale(locale),
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          select
          label="Product"
          value={selectedProductId || ""}
          onChange={(e) => {
            setSelectedProductId(e.target.value || null);
            setFormData({ locale: "", name: "", description: "" });
          }}
          SelectProps={{ native: true }}
          sx={{ minWidth: 300 }}
          disabled={productsLoading}
        >
          <option value="">Select a product...</option>
          {products?.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </TextField>

        {selectedProductId && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            disabled={availableLocalesForProduct.length === 0}
          >
            Add Translation
          </Button>
        )}
      </Box>

      {!selectedProductId ? (
        <Alert severity="info">
          Please select a product to view translations
        </Alert>
      ) : translationsLoading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Locale</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">{t("common.edit")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {translations && translations.length > 0 ? (
                translations.map((translation) => (
                  <TableRow key={translation.id}>
                    <TableCell>
                      <Chip label={translation.locale} size="small" />
                    </TableCell>
                    <TableCell>{translation.name}</TableCell>
                    <TableCell>{translation.description || "-"}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    No translations yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Translation</DialogTitle>
        <DialogContent sx={{ minWidth: 400, pt: 2 }}>
          <TextField
            select
            label="Locale"
            value={formData.locale}
            onChange={(e) =>
              setFormData({ ...formData, locale: e.target.value })
            }
            fullWidth
            SelectProps={{ native: true }}
            disabled={
              availableLocalesForProduct.length === 0 ||
              addTranslation.isPending
            }
          >
            <option value="">Select locale...</option>
            {availableLocalesForProduct.map((locale) => (
              <option key={locale} value={locale}>
                {locale}
              </option>
            ))}
          </TextField>

          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            margin="normal"
            disabled={addTranslation.isPending}
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            fullWidth
            margin="normal"
            multiline
            rows={3}
            disabled={addTranslation.isPending}
          />

          {addTranslation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {addTranslation.error?.message || "Error adding translation"}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleAddTranslation}
            variant="contained"
            disabled={
              !formData.locale || !formData.name || addTranslation.isPending
            }
          >
            {addTranslation.isPending ? <CircularProgress size={24} /> : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
