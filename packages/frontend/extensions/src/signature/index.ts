import type {
  FreeformExtension,
  ManifestFieldDefinition,
} from "@solspace/freeform-core";
import { validateSignatureValue } from "@solspace/freeform-core";
import { PACKAGE_VERSION } from "../version.js";

export function supportsSignature(field: ManifestFieldDefinition): boolean {
  return (
    field.type === "signature" ||
    field.frontend?.extension === "signature" ||
    field.frontend?.renderer === "signature"
  );
}

/**
 * Signature field extension — registers the required extension name and
 * validates required signatures before submit. Canvas rendering lives in
 * @solspace/freeform-react.
 */
export function createSignatureExtension(): FreeformExtension {
  return {
    name: "signature",
    version: PACKAGE_VERSION,
    supports: supportsSignature,

    async beforeSubmit({ intent, values, manifest }) {
      if (intent === "back" || intent === "validate") {
        return;
      }

      for (const field of Object.values(manifest.fields)) {
        if (!supportsSignature(field)) {
          continue;
        }
        const issues = validateSignatureValue(field, values[field.handle]);
        if (issues.length > 0) {
          throw new Error(issues[0].message);
        }
      }
    },
  };
}

export const signatureExtension = createSignatureExtension();
