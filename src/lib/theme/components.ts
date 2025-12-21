import type { Components, Theme } from "@mui/material";

/**
 * Custom component overrides for a premium, polished look.
 * Includes enhanced styles, transitions, and hover effects.
 */
export const componentOverrides: Components<Omit<Theme, "components">> = {
  MuiCssBaseline: {
    styleOverrides: {
      html: {
        scrollBehavior: "smooth",
      },
      body: {
        scrollbarWidth: "thin",
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          borderRadius: "4px",
          background: "rgba(0, 0, 0, 0.2)",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "rgba(0, 0, 0, 0.3)",
        },
      },
      // Dark mode scrollbar
      '[data-theme="dark"] body': {
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(255, 255, 255, 0.2)",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "rgba(255, 255, 255, 0.3)",
        },
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: "8px",
        padding: "8px 20px",
        transition: "all 0.2s ease-in-out",
      },
      contained: {
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        "&:hover": {
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
          transform: "translateY(-1px)",
        },
      },
      outlined: {
        borderWidth: "1.5px",
        "&:hover": {
          borderWidth: "1.5px",
          backgroundColor: "rgba(59, 130, 246, 0.04)",
        },
      },
      text: {
        "&:hover": {
          backgroundColor: "rgba(59, 130, 246, 0.08)",
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: "12px",
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        transition: "box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out",
        "&:hover": {
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
      },
      rounded: {
        borderRadius: "12px",
      },
      elevation1: {
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: "outlined",
    },
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",
          transition:
            "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#3B82F6",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: "2px",
          },
          "&.Mui-focused": {
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
          },
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: "6px",
        fontWeight: 500,
      },
      filled: {
        "&:hover": {
          transform: "scale(1.02)",
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: "6px",
        fontSize: "0.75rem",
        fontWeight: 500,
        padding: "8px 12px",
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: "16px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: "none",
        boxShadow: "4px 0 24px -4px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        "& .MuiTableCell-root": {
          fontWeight: 600,
          textTransform: "uppercase",
          fontSize: "0.75rem",
          letterSpacing: "0.05em",
        },
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        transition: "background-color 0.15s ease-in-out",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.02)",
        },
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        fontSize: "0.875rem",
        fontWeight: 600,
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: "8px",
        margin: "2px 8px",
        transition: "background-color 0.15s ease-in-out",
        "&.Mui-selected": {
          backgroundColor: "rgba(59, 130, 246, 0.12)",
          "&:hover": {
            backgroundColor: "rgba(59, 130, 246, 0.16)",
          },
        },
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: "none",
        fontWeight: 500,
        minHeight: "48px",
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: "8px",
      },
      standardSuccess: {
        backgroundColor: "rgba(16, 185, 129, 0.12)",
      },
      standardError: {
        backgroundColor: "rgba(239, 68, 68, 0.12)",
      },
      standardWarning: {
        backgroundColor: "rgba(245, 158, 11, 0.12)",
      },
      standardInfo: {
        backgroundColor: "rgba(6, 182, 212, 0.12)",
      },
    },
  },
  MuiBadge: {
    styleOverrides: {
      badge: {
        fontWeight: 600,
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        "&:hover": {
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
          transform: "scale(1.05)",
        },
        transition: "all 0.2s ease-in-out",
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        padding: "8px",
      },
      track: {
        borderRadius: "14px",
        opacity: 0.3,
      },
      thumb: {
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: "4px",
        height: "6px",
      },
    },
  },
  MuiCircularProgress: {
    styleOverrides: {
      root: {
        strokeLinecap: "round",
      },
    },
  },
  MuiSkeleton: {
    styleOverrides: {
      root: {
        borderRadius: "8px",
      },
    },
  },
};
