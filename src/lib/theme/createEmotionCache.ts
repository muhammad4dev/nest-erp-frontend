import createCache from "@emotion/cache";
import rtlPlugin from "@mui/stylis-plugin-rtl";

/**
 * Creates an Emotion cache for the specified direction.
 * RTL direction requires the stylis RTL plugin for proper CSS transformation.
 */
export function createEmotionCache(direction: "rtl" | "ltr") {
  return createCache({
    key: direction === "rtl" ? "muirtl" : "muiltr",
    stylisPlugins: direction === "rtl" ? [rtlPlugin] : [],
    prepend: true,
  });
}
