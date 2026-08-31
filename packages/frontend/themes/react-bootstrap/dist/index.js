/**
 * Official Bootstrap 5 starter theme for Freeform React.
 * Does not ship Bootstrap CSS — load Bootstrap 5 in your app.
 */
import { createTheme as createReactTheme, } from "@solspace/freeform-react";
import { darkClassNames, darkClassNamesByType, lightClassNames, lightClassNamesByType, } from "./classNames.js";
import { BootstrapDarkForm, BootstrapLightForm } from "./components.js";
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
function bootstrapFormRenderer(dark) {
    return {
        components: {
            Form: dark ? BootstrapDarkForm : BootstrapLightForm,
        },
    };
}
function buildTheme(name, classNames, classNamesByType, colorScheme, overrides = {}) {
    const dark = colorScheme === "dark";
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
export const bootstrapTheme = buildTheme("bootstrap", lightClassNames, lightClassNamesByType(), "light");
export const bootstrapLightTheme = bootstrapTheme;
/** Dark Bootstrap 5 map (classic `bootstrap-5-dark`). */
export const bootstrapDarkTheme = buildTheme("bootstrap-dark", darkClassNames, darkClassNamesByType(), "dark");
/** Customize the light map. Pass `defaults.colorScheme: "dark"` to start from dark. */
export function createTheme(overrides = {}) {
    const dark = overrides.defaults?.colorScheme === "dark";
    return buildTheme(overrides.name ?? (dark ? "bootstrap-dark" : "bootstrap"), dark ? darkClassNames : lightClassNames, dark ? darkClassNamesByType() : lightClassNamesByType(), dark ? "dark" : "light", overrides);
}
