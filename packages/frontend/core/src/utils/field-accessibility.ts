import type { ManifestFieldDefinition } from "../types/manifest.js";

const groupedTypes = new Set([
  "radio",
  "radios",
  "radiobox",
  "checkboxes",
  "multiple-select",
  "opinion-scale",
  "rating",
  "cards",
  "group",
  "signature",
]);

export function isGroupedField(field: ManifestFieldDefinition): boolean {
  return (
    groupedTypes.has(field.type) ||
    groupedTypes.has(field.frontend?.renderer ?? "")
  );
}

export function fieldId(field: ManifestFieldDefinition): string {
  return field.attributes?.input?.id ?? `freeform-${field.handle}`;
}

export function fieldAccessibility(
  field: ManifestFieldDefinition,
  errors: string[],
  renderInstructions = true,
  renderErrors = true,
  renderLabels = true,
) {
  const id = fieldId(field);
  const descriptions = [
    renderInstructions && field.instructions ? `${id}-instructions` : "",
    renderErrors && errors.length ? `${id}-error` : "",
  ].filter(Boolean);
  return {
    "aria-invalid": errors.length > 0,
    "aria-describedby": descriptions.join(" ") || undefined,
    "aria-labelledby":
      (field.frontend?.renderer ?? field.type) === "multiple-select" &&
      field.label &&
      renderLabels
        ? `${id}-legend`
        : undefined,
  };
}
