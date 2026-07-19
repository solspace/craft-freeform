/**
 * @solspace/freeform-react-theme-default
 *
 * Import the CSS once in your app entry:
 *
 *   import "@solspace/freeform-react-theme-default/styles.css";
 *
 * Color schemes:
 * - system (default) — follows prefers-color-scheme
 * - light / dark — force a palette via theme.defaults.colorScheme
 */
import {
  createTheme,
  defaultTheme as reactDefaultTheme,
} from "@solspace/freeform-react";

export { createTheme };
/** Default theme — follows the visitor’s OS light/dark preference. */
export const defaultTheme = createTheme({
  ...reactDefaultTheme,
  defaults: {
    ...reactDefaultTheme.defaults,
    colorScheme: "system",
  },
});
/** Always use the light palette. */
export const lightTheme = createTheme({
  defaults: { colorScheme: "light" },
});
/** Always use the dark palette. */
export const darkTheme = createTheme({
  defaults: { colorScheme: "dark" },
});
/** Alias of defaultTheme (system preference). */
export const systemTheme = defaultTheme;
