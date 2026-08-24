/**
 * Official Tailwind starter theme for Freeform React.
 * Does not ship CSS — add this package to your Tailwind `@source`.
 */

import {
  createTheme as createReactTheme,
  type FreeformReactTheme,
  type FreeformThemeClassNames,
} from "@solspace/freeform-react";
import {
  darkClassNames,
  darkClassNamesByType,
  lightClassNames,
  lightClassNamesByType,
} from "./classNames.js";

export type { FreeformReactTheme, FreeformThemeClassNames };

function mergeClassNamesByType(
  base: FreeformReactTheme["classNamesByType"],
  overlay: FreeformReactTheme["classNamesByType"],
): FreeformReactTheme["classNamesByType"] {
  const keys = new Set([
    ...Object.keys(base ?? {}),
    ...Object.keys(overlay ?? {}),
  ]);
  const merged: Record<string, Partial<FreeformThemeClassNames>> = {};
  for (const key of keys) {
    merged[key] = { ...base?.[key], ...overlay?.[key] };
  }
  return merged;
}

function buildTheme(
  name: string,
  classNames: FreeformThemeClassNames,
  classNamesByType: FreeformReactTheme["classNamesByType"],
  colorScheme: "light" | "dark",
  overrides: Partial<FreeformReactTheme> = {},
): FreeformReactTheme {
  return createReactTheme({
    name,
    classNameStrategy: "replace",
    classNames: {
      ...classNames,
      ...overrides.classNames,
    },
    classNamesByType: mergeClassNamesByType(
      classNamesByType,
      overrides.classNamesByType,
    ),
    defaults: {
      colorScheme,
      ...overrides.defaults,
    },
    renderers: overrides.renderers,
  });
}

/** Light Tailwind 4 map (classic `tailwind-4-light`). */
export const tailwindTheme: FreeformReactTheme = buildTheme(
  "tailwind",
  lightClassNames,
  lightClassNamesByType(),
  "light",
);

export const tailwindLightTheme: FreeformReactTheme = tailwindTheme;

/** Dark Tailwind 4 map (classic `tailwind-4-dark`). */
export const tailwindDarkTheme: FreeformReactTheme = buildTheme(
  "tailwind-dark",
  darkClassNames,
  darkClassNamesByType(),
  "dark",
);

/** Customize the light map. Pass `defaults.colorScheme: "dark"` to start from dark. */
export function createTheme(
  overrides: Partial<FreeformReactTheme> = {},
): FreeformReactTheme {
  const dark = overrides.defaults?.colorScheme === "dark";
  return buildTheme(
    overrides.name ?? (dark ? "tailwind-dark" : "tailwind"),
    dark ? darkClassNames : lightClassNames,
    dark ? darkClassNamesByType() : lightClassNamesByType(),
    dark ? "dark" : "light",
    overrides,
  );
}
