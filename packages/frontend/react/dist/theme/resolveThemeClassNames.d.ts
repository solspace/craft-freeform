import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import type { FreeformReactTheme, FreeformThemeClassNames } from "../types.js";
/**
 * Global classNames, then overlays for field type / frontend renderer / extension.
 * Error styles append `inputError` onto the control (`optionInput` for choice fields).
 */
export declare function resolveThemeClassNames(theme: FreeformReactTheme, field: ManifestFieldDefinition, hasErrors?: boolean): FreeformThemeClassNames;
//# sourceMappingURL=resolveThemeClassNames.d.ts.map