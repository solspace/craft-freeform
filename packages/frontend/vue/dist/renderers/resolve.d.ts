import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import type { FreeformVueTheme, VueFieldRenderer, RendererOverrides } from "../types.js";
export declare function resolveFieldRenderer(field: ManifestFieldDefinition, userRenderers?: RendererOverrides, theme?: FreeformVueTheme): VueFieldRenderer;
