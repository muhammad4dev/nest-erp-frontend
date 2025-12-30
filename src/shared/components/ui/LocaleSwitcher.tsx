import CheckIcon from "@mui/icons-material/Check";
import LanguageIcon from "@mui/icons-material/Language";
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "@tanstack/react-router";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";

import type { SupportedLanguage } from "@/lib/i18n/config";
import { supportedLanguages } from "@/lib/i18n/config";
import { getLanguageConfig, languageConfig } from "@/lib/i18n/languageConfig";
import { usePreferencesStore } from "@/stores/preferencesStore";

export const LocaleSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams({ strict: false });
  const { setLocale, setDirection } = usePreferencesStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // We use strict: false because this component might be rendered outside of a route
  // that explicitly has 'lang' (though in your app structure it's almost always there).
  const currentLang = lang || i18n.language;
  const currentConfig = getLanguageConfig(currentLang);

  const handleOpen = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [],
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const changeLanguage = useCallback(
    (lang: SupportedLanguage) => {
      const config = languageConfig[lang];
      if (!config) return;

      // 1. Update Persistent Store (optional, but good for next visit)
      setLocale(lang);

      // 2. Update Direction
      setDirection(config.direction);
      document.dir = config.direction;

      // 3. Navigate to new URL (The Router will see the param change and sync i18n via langRoute)
      navigate({
        to: ".", // Stay on current route
        params: { lang }, // Verify this merges correctly with your router setup
        replace: true,
      });

      handleClose();
    },
    [navigate, handleClose, setLocale, setDirection],
  );

  return (
    <>
      <Tooltip title={t("common.changeLanguage", "Change Language")}>
        <IconButton
          color="inherit"
          onClick={handleOpen}
          aria-label={t("common.changeLanguage", "Change Language")}
          sx={{
            borderRadius: 2,
            px: 1.5,
            gap: 0.5,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            },
          }}
        >
          <LanguageIcon fontSize="small" />
          <Typography
            variant="body2"
            component="span"
            sx={{
              fontWeight: 600,
              fontSize: "0.875rem",
              display: { xs: "none", sm: "block" },
            }}
          >
            {currentConfig.flag} {currentLang.toUpperCase()}
          </Typography>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              minWidth: 180,
              borderRadius: 2,
              mt: 1,
            },
          },
        }}
      >
        {supportedLanguages.map((lang) => {
          const config = languageConfig[lang as keyof typeof languageConfig];

          const isSelected = lang === currentLang;

          return (
            <MenuItem
              key={lang}
              onClick={() => changeLanguage(lang as SupportedLanguage)}
              selected={isSelected}
              sx={{
                py: 1.5,
                borderRadius: 1,
                mx: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Box
                  component="span"
                  sx={{ fontSize: "1.25rem", lineHeight: 1 }}
                >
                  {config.flag}
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={config.nativeName}
                secondary={
                  config.nativeName !== config.englishName
                    ? config.englishName
                    : undefined
                }
                primaryTypographyProps={{
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? "inherit" : "text.primary",
                }}
                secondaryTypographyProps={{
                  fontSize: "0.75rem",
                  color: isSelected ? "inherit" : "text.secondary",
                  sx: { opacity: isSelected ? 0.8 : 1 },
                }}
              />
              {isSelected && (
                <CheckIcon fontSize="small" sx={{ ml: 1, color: "inherit" }} />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
