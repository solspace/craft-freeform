import type { FreeformExtension, ManifestFieldDefinition } from "@solspace/freeform-core";
export declare function supportsSignature(field: ManifestFieldDefinition): boolean;
/**
 * Signature field extension — registers the required extension name and
 * validates required signatures before submit. Canvas rendering lives in
 * @solspace/freeform-react.
 */
export declare function createSignatureExtension(): FreeformExtension;
export declare const signatureExtension: FreeformExtension;
//# sourceMappingURL=index.d.ts.map