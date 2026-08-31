import type { ManifestFieldDefinition } from "../types/manifest.js";
export type TableColumn = {
    label: string;
    type: string;
    value?: string;
    options?: string[] | Array<{
        label: string;
        value: string;
    }>;
    placeholder?: string;
    checked?: boolean;
    required?: boolean;
    metadata?: {
        fileCount?: number;
        assetSourceId?: number;
        uploadLocation?: string | null;
        [key: string]: unknown;
    } | null;
};
export type TableConfig = {
    columns?: TableColumn[];
    limitRows?: string | null;
    maxRows?: number | null;
    minRows?: number | null;
    exactRows?: number | null;
    addButtonLabel?: string;
    removeButtonLabel?: string;
    useScript?: boolean;
};
export type TableCellValue = string | number | boolean | null | File | File[] | string[];
export type TableRows = TableCellValue[][];
export declare function getTableConfig(field: ManifestFieldDefinition): TableConfig;
export declare function normalizeTableOptions(options?: TableColumn["options"]): Array<{
    label: string;
    value: string;
}>;
export declare function emptyTableRow(columns: TableColumn[]): TableCellValue[];
export declare function resolveInitialRowCount(config: TableConfig): number;
export declare function normalizeTableRows(value: unknown, columns: TableColumn[], config: TableConfig): TableRows;
export declare function canAddTableRow(rows: TableRows, config: TableConfig): boolean;
export declare function canRemoveTableRow(rows: TableRows, rowIndex: number, config: TableConfig): boolean;
export type TableValidationIssue = {
    rowIndex: number;
    columnIndex: number;
    columnLabel: string;
    message: string;
};
export declare function validateTableValue(field: ManifestFieldDefinition, value: unknown): TableValidationIssue[];
//# sourceMappingURL=table.d.ts.map