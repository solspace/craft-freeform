import { builtinRenderers } from "./builtin/index.js";
export function resolveFieldRenderer(field, userRenderers, theme) {
  const frontendKey = field.frontend?.renderer ?? "";
  const candidates = [
    userRenderers?.handles?.[field.handle],
    frontendKey ? userRenderers?.frontend?.[frontendKey] : undefined,
    userRenderers?.types?.[field.type],
    theme?.renderers?.handles?.[field.handle],
    frontendKey ? theme?.renderers?.frontend?.[frontendKey] : undefined,
    theme?.renderers?.types?.[field.type],
    frontendKey ? builtinRenderers.frontend[frontendKey] : undefined,
    builtinRenderers.types[field.type],
  ];
  return (
    candidates.find((renderer) => !!renderer) ??
    builtinRenderers.types._unsupported
  );
}
