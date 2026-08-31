import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import type {
  FreeformVueTheme,
  RendererOverrides,
  VueFieldRenderer,
} from "../types.js";
import { builtinRenderers } from "./builtin/index.js";

export function resolveFieldRenderer(
  field: ManifestFieldDefinition,
  userRenderers?: RendererOverrides,
  theme?: FreeformVueTheme,
): VueFieldRenderer {
  const frontendKey = field.frontend?.renderer ?? "";
  const candidates: Array<VueFieldRenderer | undefined> = [
    userRenderers?.handles?.[field.handle],
    frontendKey ? userRenderers?.frontend?.[frontendKey] : undefined,
    userRenderers?.types?.[field.type],
    theme?.renderers?.handles?.[field.handle],
    frontendKey ? theme?.renderers?.frontend?.[frontendKey] : undefined,
    theme?.renderers?.types?.[field.type],
    frontendKey ? builtinRenderers.frontend[frontendKey] : undefined,
    frontendKey ? builtinRenderers.types[frontendKey] : undefined,
    builtinRenderers.types[field.type],
  ];

  return (
    candidates.find((renderer): renderer is VueFieldRenderer => !!renderer) ??
    builtinRenderers.types._unsupported
  );
}
