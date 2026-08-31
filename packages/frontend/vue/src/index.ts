/**
 * @solspace/freeform-vue
 *
 * Vue adapter for Freeform headless forms.
 */

export type {
  FieldValue,
  FreeformManifest,
  ManifestFieldDefinition,
  SubmitIntent,
  SubmitResponse,
} from "@solspace/freeform-core";
export { default as FormLoader } from "./components/FormLoader.vue";
export { default as Freeform } from "./components/Freeform.vue";
export { default as FreeformView } from "./components/FreeformView.vue";
export { useFieldExtension } from "./composables/useFieldExtension.js";
export { useFreeform } from "./composables/useFreeform.js";
export {
  builtinComponents,
  builtinRenderers,
} from "./renderers/builtin/index.js";
export { resolveFieldRenderer } from "./renderers/resolve.js";
export { createTheme, defaultTheme } from "./theme/defaultTheme.js";
export { joinClassNames, mergeClassNames } from "./theme/mergeClassNames.js";
export { resolveThemeClassNames } from "./theme/resolveThemeClassNames.js";
export { toBemModifier } from "./theme/toBemModifier.js";
export type {
  FreeformProps,
  FreeformRuntime,
  FreeformThemeClassNames,
  FreeformVueTheme,
  RendererOverrides,
  UseFreeformOptions,
  UseFreeformResult,
  VueFieldRenderer,
  VueFieldRendererProps,
} from "./types.js";
export { CLIENT_NAME, PACKAGE_VERSION } from "./types.js";
