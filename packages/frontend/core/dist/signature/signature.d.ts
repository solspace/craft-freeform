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
export declare function getSignatureConfig(field: ManifestFieldDefinition): SignatureConfig;
export declare function isSignatureValueEmpty(value: unknown): boolean;
export type SignatureValidationIssue = {
    message: string;
};
export declare function validateSignatureValue(field: ManifestFieldDefinition, value: unknown): SignatureValidationIssue[];
//# sourceMappingURL=signature.d.ts.map