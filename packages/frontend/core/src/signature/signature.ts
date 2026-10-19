import type { ManifestFieldDefinition } from "../types/manifest.js";

export const SIGNATURE_PEN_CURSOR =
  'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M15%205l2-2a2.83%202.83%200%200%201%204%204L8%2020l-5%201%201-5Z%22%20fill%3D%22white%22%20stroke%3D%22white%22%20stroke-width%3D%223.5%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cg%20fill%3D%22white%22%20stroke%3D%22%23111827%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M15%205l2-2a2.83%202.83%200%200%201%204%204L8%2020l-5%201%201-5Z%22%2F%3E%3Cpath%20d%3D%22m15%205%204%204M4%2016l4%204%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E") 3 21, crosshair';

export type SignatureConfig = {
  customizeAppearance?: boolean;
  showPenCursor?: boolean;
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
  const config = (field.frontend?.config ?? {}) as SignatureConfig;
  return config.customizeAppearance === false
    ? {
        ...config,
        penColor: "#000000",
        backgroundColor: "rgba(0,0,0,0)",
        borderColor: "#999999",
        showPenCursor: true,
      }
    : config;
}

export function getSignatureDataUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const match = /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(
    trimmed,
  );
  if (!match) return null;

  try {
    const bytes = atob(match[2]);
    const supported =
      match[1] === "png"
        ? bytes.length >= 33 &&
          bytes.startsWith("\x89PNG\r\n\x1a\n") &&
          bytes.slice(12, 16) === "IHDR"
        : bytes.startsWith("\xff\xd8\xff") && bytes.includes("\xff\xd9");
    return supported ? trimmed : null;
  } catch {
    return null;
  }
}

export function isSignatureValueEmpty(value: unknown): boolean {
  // Stored bitmaps have no stroke metadata. Keep accepting legacy images;
  // the pad tracks drawing activity instead of guessing ink from file size.
  return getSignatureDataUrl(value) === null;
}

export type SignatureValidationIssue = {
  message: string;
};

export function validateSignatureValue(
  field: ManifestFieldDefinition,
  value: unknown,
): SignatureValidationIssue[] {
  const empty = value == null || (typeof value === "string" && !value.trim());
  if (!field.required && empty) {
    return [];
  }
  if (isSignatureValueEmpty(value)) {
    return [
      {
        message: field.required
          ? `${field.label} is required.`
          : `${field.label} must be a PNG or JPEG image.`,
      },
    ];
  }
  return [];
}
