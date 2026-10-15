import type { ManifestFieldDefinition } from "../types/manifest.js";

/** Counts the same UTF-16 units as native maxlength, with textarea newlines normalized. */
export function getCharacterCount(
  field: ManifestFieldDefinition,
  value: unknown,
) {
  const config = field.frontend?.config;
  if (
    config?.showCharacterCount !== true ||
    !["text", "textarea"].includes(field.type)
  )
    return undefined;
  const count = String(value ?? "").replace(/\r\n?/g, "\n").length;
  const max = field.validation?.maxLength;
  const limit =
    typeof max === "number" && Number.isInteger(max) && max > 0
      ? max
      : undefined;
  const messages = config.characterCountMessages as
    | { count?: string; limit?: string }
    | undefined;
  const template =
    limit === undefined
      ? (messages?.count ?? "{count} characters")
      : (messages?.limit ?? "{count} / {limit} characters");
  return {
    count,
    limit,
    overLimit: limit !== undefined && count > limit,
    text: template.replace(/\{count\}|\{limit\}/g, (token) =>
      String(token === "{count}" ? count : (limit ?? "")),
    ),
  };
}
