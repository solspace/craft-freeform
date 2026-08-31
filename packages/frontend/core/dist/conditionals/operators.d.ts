import type { ConditionalOperator } from "../types/manifest.js";
export type TableFieldValue = Array<Array<string | number | boolean | null | File | File[] | string>>;
export type FieldValue = string | number | boolean | string[] | TableFieldValue | File | File[] | Blob | Blob[] | null | undefined;
export type FieldVisibilityMap = Record<string, boolean>;
export declare function evaluateCondition(values: Record<string, FieldValue>, hiddenFields: Set<string>, condition: {
    field: string;
    operator: ConditionalOperator | string;
    value?: string;
}): boolean;
//# sourceMappingURL=operators.d.ts.map