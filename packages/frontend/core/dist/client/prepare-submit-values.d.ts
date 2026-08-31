import type { ManifestFieldDefinition } from "../types/manifest.js";
import type { SubmitFileMap } from "../types/submit.js";
export type PreparedSubmitValues = {
    values: Record<string, unknown>;
    files: SubmitFileMap;
};
/** Encode a table cell file path for multipart (`handle::row::col`). */
export declare function tableCellFileKey(handle: string, rowIndex: number, columnIndex: number): string;
export declare function parseTableCellFileKey(key: string): {
    handle: string;
    rowIndex: number;
    columnIndex: number;
} | null;
/**
 * Split form values into JSON-safe values + multipart file map.
 * Table file cells become `handle::row::col` entries.
 */
export declare function prepareSubmitValues(rawValues: Record<string, unknown>, fields?: Record<string, ManifestFieldDefinition>): PreparedSubmitValues;
//# sourceMappingURL=prepare-submit-values.d.ts.map