import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import type {
  FreeformReactTheme,
  ReactFieldRenderer,
  RendererOverrides,
} from "../types.js";
import { builtinRenderers } from "./builtin/index.js";

export function resolveFieldRenderer(
  field: ManifestFieldDefinition,
  userRenderers?: RendererOverrides,
  theme?: FreeformReactTheme,
): ReactFieldRenderer {
  const frontendKey = field.frontend?.renderer ?? "";
  const candidates: Array<ReactFieldRenderer | undefined> = [
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
    candidates.find((renderer): renderer is ReactFieldRenderer => !!renderer) ??
    builtinRenderers.types._unsupported
  );
}
