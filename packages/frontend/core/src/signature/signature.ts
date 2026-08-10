import type { ManifestFieldDefinition } from "../types/manifest.js";

export type SignatureConfig = {
  width?: number;
  height?: number;
  showClearButton?: boolean;
  borderColor?: string;
  backgroundColor?: string;
  penColor?: string;
  penDotSize?: number;
};

export function getSignatureConfig(
  field: ManifestFieldDefinition,
): SignatureConfig {
  return (field.frontend?.config ?? {}) as SignatureConfig;
}

export function isSignatureValueEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value !== "string") {
    return true;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }
  // Empty canvas PNG data URLs are still "data:image/..." — treat missing ink
  // as empty when the field is required by checking for a non-trivial payload.
  if (!trimmed.startsWith("data:image/")) {
    return true;
  }
  // Very small data URLs are effectively blank canvases.
  return trimmed.length < 100;
}

export type SignatureValidationIssue = {
  message: string;
};

export function validateSignatureValue(
  field: ManifestFieldDefinition,
  value: unknown,
): SignatureValidationIssue[] {
  if (!field.required) {
    return [];
  }
  if (isSignatureValueEmpty(value)) {
    return [
      {
        message: `${field.label} is required.`,
      },
    ];
  }
  return [];
}
