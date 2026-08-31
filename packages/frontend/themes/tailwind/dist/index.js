/**
 * Official Tailwind starter theme for Freeform (React & Vue).
 * Does not ship CSS — add this package to your Tailwind `@source`.
 */
import { createTheme as createReactTheme, } from "@solspace/freeform-react";
import { darkClassNames, darkClassNamesByType, lightClassNames, lightClassNamesByType, } from "./classNames.js";
function mergeClassNamesByType(base, overlay) {
    const keys = new Set([
        ...Object.keys(base ?? {}),
        ...Object.keys(overlay ?? {}),
    ]);
    const merged = {};
    for (const key of keys) {
        merged[key] = { ...base?.[key], ...overlay?.[key] };
    }
    return merged;
}
function buildTheme(name, classNames, classNamesByType, colorScheme, overrides = {}) {
    return createReactTheme({
        name,
        classNameStrategy: "replace",
        classNames: {
            ...classNames,
            ...overrides.classNames,
        },
        classNamesByType: mergeClassNamesByType(classNamesByType, overrides.classNamesByType),
        defaults: {
            colorScheme,
            ...overrides.defaults,
        },
        renderers: overrides.renderers,
    });
}
/** Light Tailwind 4 map (classic `tailwind-4-light`). */
export const tailwindTheme = buildTheme("tailwind", lightClassNames, lightClassNamesByType(), "light");
export const tailwindLightTheme = tailwindTheme;
/** Dark Tailwind 4 map (classic `tailwind-4-dark`). */
export const tailwindDarkTheme = buildTheme("tailwind-dark", darkClassNames, darkClassNamesByType(), "dark");
/** Customize the light map. Pass `defaults.colorScheme: "dark"` to start from dark. */
export function createTheme(overrides = {}) {
    const dark = overrides.defaults?.colorScheme === "dark";
    return buildTheme(overrides.name ?? (dark ? "tailwind-dark" : "tailwind"), dark ? darkClassNames : lightClassNames, dark ? darkClassNamesByType() : lightClassNamesByType(), dark ? "dark" : "light", overrides);
}
