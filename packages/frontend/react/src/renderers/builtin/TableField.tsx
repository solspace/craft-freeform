import {
  canAddTableRow,
  canRemoveTableRow,
  emptyTableRow,
  getTableConfig,
  normalizeTableOptions,
  normalizeTableRows,
  type TableCellValue,
  type TableRows,
} from "@solspace/freeform-core";
import { useEffect, useRef } from "react";
import type { ReactFieldRendererProps } from "../../types.js";

/**
 * Table field renderer backed by @solspace/freeform-core table helpers
 * (row limits, required columns, matrix value shape). Register `tableExtension`
 * from @solspace/freeform-extensions so manifests that require it resolve.
 */
export function TableFieldRenderer(props: ReactFieldRendererProps) {
  const config = getTableConfig(props.field);
  const columns = config.columns ?? [];
  const enabled = props.form.isFieldEnabled(props.field.handle);
  const seededRef = useRef(false);
  const rows = normalizeTableRows(props.value, columns, config);

  useEffect(() => {
    if (seededRef.current) {
      return;
    }
    if (!Array.isArray(props.value) || props.value.length === 0) {
      seededRef.current = true;
      props.form.setValue(
        props.field.handle,
        rows as unknown as Parameters<typeof props.form.setValue>[1],
      );
    }
  }, [props.field.handle, props.form, props.value, rows]);

  const setRows = (next: TableRows) => {
    props.form.setValue(
      props.field.handle,
      next as unknown as Parameters<typeof props.form.setValue>[1],
    );
  };

  const updateCell = (
    rowIndex: number,
    columnIndex: number,
    value: TableCellValue,
  ) => {
    const next = rows.map((row) => [...row]);
    next[rowIndex][columnIndex] = value;
    setRows(next);
  };

  const showAdd = canAddTableRow(rows, config);

  return (
    <div className={props.classNames.input} data-freeform-table="">
      <table className="ff-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.label}
                className={column.required ? "is-required" : undefined}
                data-column-required={column.required ? "true" : undefined}
              >
                {column.label}
              </th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {columns.map((column, colIndex) => {
                const cellValue = row[colIndex];
                const optionList = normalizeTableOptions(column.options);

                if (column.type === "checkbox") {
                  return (
                    <td key={column.label}>
                      <input
                        type="checkbox"
                        checked={Boolean(cellValue)}
                        disabled={!enabled}
                        required={column.required || undefined}
                        onChange={(event) => {
                          updateCell(
                            rowIndex,
                            colIndex,
                            event.target.checked ? "1" : "",
                          );
                        }}
                      />
                    </td>
                  );
                }

                if (column.type === "select" || column.type === "dropdown") {
                  return (
                    <td key={column.label}>
                      <select
                        value={String(cellValue ?? "")}
                        disabled={!enabled}
                        required={column.required || undefined}
                        onChange={(event) => {
                          updateCell(rowIndex, colIndex, event.target.value);
                        }}
                      >
                        <option value="">
                          {column.placeholder || "Select…"}
                        </option>
                        {optionList.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                }

                if (column.type === "radio") {
                  return (
                    <td key={column.label}>
                      <div className="ff-table__radios">
                        {optionList.map((option) => {
                          const id = `${props.field.handle}-${rowIndex}-${colIndex}-${option.value}`;
                          return (
                            <label key={option.value} htmlFor={id}>
                              <input
                                id={id}
                                type="radio"
                                name={`${props.field.handle}[${rowIndex}][${colIndex}]`}
                                value={option.value}
                                checked={
                                  String(cellValue ?? "") === option.value
                                }
                                disabled={!enabled}
                                onChange={() => {
                                  updateCell(rowIndex, colIndex, option.value);
                                }}
                              />{" "}
                              {option.label}
                            </label>
                          );
                        })}
                      </div>
                    </td>
                  );
                }

                if (column.type === "textarea") {
                  return (
                    <td key={column.label}>
                      <textarea
                        value={String(cellValue ?? "")}
                        placeholder={column.placeholder}
                        disabled={!enabled}
                        required={column.required || undefined}
                        onChange={(event) => {
                          updateCell(rowIndex, colIndex, event.target.value);
                        }}
                      />
                    </td>
                  );
                }

                if (column.type === "file") {
                  const selected = Array.isArray(cellValue)
                    ? (cellValue as File[])
                    : [];
                  const fileCount = Math.max(
                    1,
                    Number(column.metadata?.fileCount ?? 1),
                  );
                  return (
                    <td key={column.label}>
                      <input
                        type="file"
                        multiple={fileCount > 1}
                        disabled={!enabled}
                        onChange={(event) => {
                          const files = Array.from(event.target.files ?? []);
                          updateCell(
                            rowIndex,
                            colIndex,
                            fileCount > 1 ? files : files.slice(0, 1),
                          );
                        }}
                      />
                      {selected.length > 0 ? (
                        <div className="ff-table__file-names">
                          {selected.map((file) => (
                            <span key={`${file.name}-${file.size}`}>
                              {file.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </td>
                  );
                }

                return (
                  <td key={column.label}>
                    <input
                      type="text"
                      value={String(cellValue ?? "")}
                      placeholder={column.placeholder}
                      disabled={!enabled}
                      required={column.required || undefined}
                      onChange={(event) => {
                        updateCell(rowIndex, colIndex, event.target.value);
                      }}
                    />
                  </td>
                );
              })}
              <td>
                {canRemoveTableRow(rows, rowIndex, config) ? (
                  <button
                    type="button"
                    disabled={!enabled}
                    onClick={() => {
                      setRows(rows.filter((_, index) => index !== rowIndex));
                    }}
                  >
                    {config.removeButtonLabel || "Remove"}
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showAdd ? (
        <button
          type="button"
          disabled={!enabled}
          onClick={() => setRows([...rows, emptyTableRow(columns)])}
        >
          {config.addButtonLabel || "Add"}
        </button>
      ) : null}
    </div>
  );
}
