/**
 * @solspace/freeform-react
 *
 * React adapter for Freeform headless forms.
 *
 * Next.js App Router: import from this package in a Client Component file
 * (add `"use client"` in your page/component or use a dedicated client wrapper).
 *
 * @example
 * ```tsx
 * "use client";
 *
 * import { Freeform } from "@solspace/freeform-react";
 *
 * export function ContactForm() {
 *   return (
 *     <Freeform
 *       handle="contactForm"
 *       baseUrl={process.env.NEXT_PUBLIC_CRAFT_URL!}
 *     />
 *   );
 * }
 * ```
 */

export type {
  FieldValue,
  FreeformManifest,
  ManifestFieldDefinition,
  SubmitIntent,
  SubmitResponse,
} from "@solspace/freeform-core";
export type { FormLoaderProps } from "./components/FormLoader.js";
export { FormLoader } from "./components/FormLoader.js";
export { Freeform } from "./components/Freeform.js";
export { FreeformView } from "./components/FreeformView.js";
export { useFieldExtension } from "./hooks/useFieldExtension.js";
export { useFreeform } from "./hooks/useFreeform.js";
export {
  builtinComponents,
  builtinRenderers,
} from "./renderers/builtin/index.js";
export { FieldRenderer } from "./renderers/FieldRenderer.js";
export { resolveFieldRenderer } from "./renderers/resolve.js";
export { createTheme, defaultTheme } from "./theme/defaultTheme.js";
export { joinClassNames, mergeClassNames } from "./theme/mergeClassNames.js";
export { resolveThemeClassNames } from "./theme/resolveThemeClassNames.js";
export { toBemModifier } from "./theme/toBemModifier.js";
export type {
  FreeformProps,
  FreeformReactTheme,
  FreeformRuntime,
  FreeformThemeClassNames,
  ReactFieldRenderer,
  ReactFieldRendererProps,
  RendererOverrides,
  UseFreeformOptions,
  UseFreeformResult,
} from "./types.js";
export {
  CLIENT_NAME,
  PACKAGE_VERSION,
} from "./types.js";
