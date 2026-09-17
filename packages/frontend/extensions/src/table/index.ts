import type {
  FreeformExtension,
  ManifestFieldDefinition,
} from "@solspace/freeform-core";
import { validateTableValue } from "@solspace/freeform-core";
import { PACKAGE_VERSION } from "../version.js";

export function supportsTable(field: ManifestFieldDefinition): boolean {
  return (
    field.type === "table" ||
    field.frontend?.extension === "table" ||
    field.frontend?.renderer === "table"
  );
}

/**
 * Table field extension — registers the required extension name and validates
 * row limits / required columns before submit. Rendering lives in
 * @solspace/freeform-react.
 */
export function createTableExtension(): FreeformExtension {
  return {
    name: "table",
    version: PACKAGE_VERSION,
    supports: supportsTable,

    async beforeSubmit({ intent, values, manifest }) {
      if (intent === "back" || intent === "validate") {
        return;
      }

      for (const field of Object.values(manifest.fields)) {
        if (!supportsTable(field)) {
          continue;
        }
        const issues = validateTableValue(field, values[field.handle]);
        if (issues.length > 0) {
          throw new Error(issues[0].message);
        }
      }
    },
  };
}

export const tableExtension = createTableExtension();
