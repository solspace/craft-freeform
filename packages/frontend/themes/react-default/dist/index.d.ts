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

import type { FreeformReactTheme } from "@solspace/freeform-react";
import { createTheme } from "@solspace/freeform-react";

export type { FreeformReactTheme };
export { createTheme };
/** Default theme — follows the visitor’s OS light/dark preference. */
export declare const defaultTheme: FreeformReactTheme;
/** Always use the light palette. */
export declare const lightTheme: FreeformReactTheme;
/** Always use the dark palette. */
export declare const darkTheme: FreeformReactTheme;
/** Alias of defaultTheme (system preference). */
export declare const systemTheme: FreeformReactTheme;
//# sourceMappingURL=index.d.ts.map
