import type { FreeformExtension, ManifestFieldDefinition } from "@solspace/freeform-core";
export declare function supportsTable(field: ManifestFieldDefinition): boolean;
/**
 * Table field extension — registers the required extension name and validates
 * row limits / required columns before submit. Rendering lives in
 * @solspace/freeform-react.
 */
export declare function createTableExtension(): FreeformExtension;
export declare const tableExtension: FreeformExtension;
//# sourceMappingURL=index.d.ts.map