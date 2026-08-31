/**
 * Official Tailwind starter theme for Freeform (React & Vue).
 * Does not ship CSS — add this package to your Tailwind `@source`.
 */
import { type FreeformReactTheme, type FreeformThemeClassNames } from "@solspace/freeform-react";
export type { FreeformReactTheme, FreeformThemeClassNames };
/** Light Tailwind 4 map (classic `tailwind-4-light`). */
export declare const tailwindTheme: FreeformReactTheme;
export declare const tailwindLightTheme: FreeformReactTheme;
/** Dark Tailwind 4 map (classic `tailwind-4-dark`). */
export declare const tailwindDarkTheme: FreeformReactTheme;
/** Customize the light map. Pass `defaults.colorScheme: "dark"` to start from dark. */
export declare function createTheme(overrides?: Partial<FreeformReactTheme>): FreeformReactTheme;
//# sourceMappingURL=index.d.ts.map