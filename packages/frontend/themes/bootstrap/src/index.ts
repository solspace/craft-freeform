/**
 * Official Bootstrap 5 starter theme for Freeform (React & Vue).
 * Does not ship Bootstrap CSS — load Bootstrap 5 in your app.
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
import { BootstrapDarkForm, BootstrapLightForm } from "./components.js";

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

function bootstrapFormRenderer(dark: boolean) {
  return {
    components: {
      Form: dark ? BootstrapDarkForm : BootstrapLightForm,
    },
  };
}

function buildTheme(
  name: string,
  classNames: FreeformThemeClassNames,
  classNamesByType: FreeformReactTheme["classNamesByType"],
  colorScheme: "light" | "dark",
  overrides: Partial<FreeformReactTheme> = {},
): FreeformReactTheme {
  const dark = colorScheme === "dark";

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
    renderers: {
      ...bootstrapFormRenderer(dark),
      ...overrides.renderers,
      components: {
        ...bootstrapFormRenderer(dark).components,
        ...overrides.renderers?.components,
      },
    },
  });
}

/** Light Bootstrap 5 map (classic `bootstrap-5`). */
export const bootstrapTheme: FreeformReactTheme = buildTheme(
  "bootstrap",
  lightClassNames,
  lightClassNamesByType(),
  "light",
);

export const bootstrapLightTheme: FreeformReactTheme = bootstrapTheme;

/** Dark Bootstrap 5 map (classic `bootstrap-5-dark`). */
export const bootstrapDarkTheme: FreeformReactTheme = buildTheme(
  "bootstrap-dark",
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
    overrides.name ?? (dark ? "bootstrap-dark" : "bootstrap"),
    dark ? darkClassNames : lightClassNames,
    dark ? darkClassNamesByType() : lightClassNamesByType(),
    dark ? "dark" : "light",
    overrides,
  );
}
