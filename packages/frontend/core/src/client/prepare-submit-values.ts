import type { ManifestFieldDefinition } from "../types/manifest.js";
import type { SubmitFileMap } from "../types/submit.js";

export type PreparedSubmitValues = {
  values: Record<string, unknown>;
  files: SubmitFileMap;
};

/** Encode a table cell file path for multipart (`handle::row::col`). */
export function tableCellFileKey(
  handle: string,
  rowIndex: number,
  columnIndex: number,
): string {
  return `${handle}::${rowIndex}::${columnIndex}`;
}

export function parseTableCellFileKey(
  key: string,
): { handle: string; rowIndex: number; columnIndex: number } | null {
  const match = /^(.+)::(\d+)::(\d+)$/.exec(key);
  if (!match) {
    return null;
  }
  return {
    handle: match[1],
    rowIndex: Number(match[2]),
    columnIndex: Number(match[3]),
  };
}

function isFileLike(value: unknown): value is File | Blob {
  return (
    (typeof File !== "undefined" && value instanceof File) ||
    (typeof Blob !== "undefined" && value instanceof Blob)
  );
}

function isFileArray(value: unknown): value is Array<File | Blob> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => isFileLike(item))
  );
}

function isTableMatrix(value: unknown): value is unknown[][] {
  return Array.isArray(value) && value.every((row) => Array.isArray(row));
}

/**
 * Split form values into JSON-safe values + multipart file map.
 * Table file cells become `handle::row::col` entries.
 */
export function prepareSubmitValues(
  rawValues: Record<string, unknown>,
  fields?: Record<string, ManifestFieldDefinition>,
): PreparedSubmitValues {
  const values: Record<string, unknown> = {};
  const files: SubmitFileMap = {};

  for (const [handle, value] of Object.entries(rawValues)) {
    const field = fields?.[handle];
    const isTable =
      field?.type === "table" ||
      field?.frontend?.renderer === "table" ||
      field?.frontend?.extension === "table";

    if (isTable && isTableMatrix(value)) {
      const cleanedRows: unknown[][] = [];
      for (let rowIndex = 0; rowIndex < value.length; rowIndex++) {
        const row = value[rowIndex];
        const cleanedRow: unknown[] = [];
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
          const cell = row[colIndex];
          if (isFileLike(cell)) {
            files[tableCellFileKey(handle, rowIndex, colIndex)] = cell;
            cleanedRow.push([]);
            continue;
          }
          if (isFileArray(cell)) {
            files[tableCellFileKey(handle, rowIndex, colIndex)] = cell;
            cleanedRow.push([]);
            continue;
          }
          cleanedRow.push(cell);
        }
        cleanedRows.push(cleanedRow);
      }
      values[handle] = cleanedRows;
      continue;
    }

    if (isFileLike(value)) {
      files[handle] = value;
      continue;
    }

    if (isFileArray(value)) {
      files[handle] = value;
      continue;
    }

    values[handle] = value;
  }

  return { values, files };
}
