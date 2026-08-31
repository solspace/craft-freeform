import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import type { FreeformVueTheme, FreeformThemeClassNames } from "../types.js";
/**
 * Global classNames, then overlays for field type / frontend renderer / extension.
 * Error styles append `inputError` onto the control (`optionInput` for choice fields).
 */
export declare function resolveThemeClassNames(theme: FreeformVueTheme, field: ManifestFieldDefinition, hasErrors?: boolean): FreeformThemeClassNames;
