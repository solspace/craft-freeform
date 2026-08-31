/**
 * Official Bootstrap 5 starter theme for Freeform React.
 * Does not ship Bootstrap CSS — load Bootstrap 5 in your app.
 */
import { type FreeformReactTheme, type FreeformThemeClassNames } from "@solspace/freeform-react";
export type { FreeformReactTheme, FreeformThemeClassNames };
/** Light Bootstrap 5 map (classic `bootstrap-5`). */
export declare const bootstrapTheme: FreeformReactTheme;
export declare const bootstrapLightTheme: FreeformReactTheme;
/** Dark Bootstrap 5 map (classic `bootstrap-5-dark`). */
export declare const bootstrapDarkTheme: FreeformReactTheme;
/** Customize the light map. Pass `defaults.colorScheme: "dark"` to start from dark. */
export declare function createTheme(overrides?: Partial<FreeformReactTheme>): FreeformReactTheme;
//# sourceMappingURL=index.d.ts.map