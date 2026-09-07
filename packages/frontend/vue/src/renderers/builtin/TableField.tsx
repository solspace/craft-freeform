// @ts-nocheck
import {
  canAddTableRow,
  canRemoveTableRow,
  emptyTableRow,
  getTableConfig,
  normalizeTableRows,
  resolveTableColumnOptions,
  type TableCellValue,
  type TableRows,
} from "@solspace/freeform-core";
import { computed, defineComponent, shallowRef, watch } from "vue";
import type { VueFieldRendererProps } from "../../types.js";

export const TableFieldRenderer = defineComponent({
  name: "TableFieldRenderer",
  props: {
    field: { type: Object, required: true },
    form: { type: Object, required: true },
    value: { required: true },
    classNames: { type: Object, required: true },
  },
  setup(props: VueFieldRendererProps) {
    const config = computed(() => getTableConfig(props.field));
    const columns = computed(() => config.value.columns ?? []);
    const enabled = computed(() =>
      props.form.isFieldEnabled(props.field.handle),
    );
    const rows = computed(() =>
      normalizeTableRows(props.value, columns.value, config.value),
    );
    const seededRef = shallowRef(false);

    watch(
      () => [props.field.handle, props.value] as const,
      () => {
        if (seededRef.value) {
          return;
        }
        if (!Array.isArray(props.value) || props.value.length === 0) {
          seededRef.value = true;
          props.form.setValue(
            props.field.handle,
            rows.value as unknown as Parameters<typeof props.form.setValue>[1],
          );
        }
      },
      { immediate: true },
    );

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
      const next = rows.value.map((row) => [...row]);
      next[rowIndex][columnIndex] = value;
      setRows(next);
    };

    return () => {
      const currentRows = rows.value;
      const currentColumns = columns.value;
      const currentConfig = config.value;
      const isEnabled = enabled.value;
      const showAdd = canAddTableRow(currentRows, currentConfig);

      return (
        <div class={props.classNames.input} data-freeform-table="">
          <table class="ff-table">
            <thead>
              <tr>
                {currentColumns.map((column, colIndex) => (
                  <th
                    key={`${column.label}-${colIndex}`}
                    class={column.required ? "is-required" : undefined}
                    data-column-required={column.required ? "true" : undefined}
                  >
                    {column.label}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {currentColumns.map((column, colIndex) => {
                    const cellValue = row[colIndex];
                    const optionList = resolveTableColumnOptions(column);
                    const cellKey = `${rowIndex}-${colIndex}`;

                    if (column.type === "checkbox") {
                      return (
                        <td key={cellKey}>
                          <input
                            type="checkbox"
                            checked={Boolean(cellValue)}
                            disabled={!isEnabled}
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

                    if (
                      column.type === "select" ||
                      column.type === "dropdown"
                    ) {
                      return (
                        <td key={cellKey}>
                          <select
                            value={String(cellValue ?? "")}
                            disabled={!isEnabled}
                            required={column.required || undefined}
                            onChange={(event) => {
                              updateCell(
                                rowIndex,
                                colIndex,
                                event.target.value,
                              );
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
                        <td key={cellKey}>
                          <div class="ff-table__radios">
                            {optionList.map((option) => {
                              const id = `${props.field.handle}-${rowIndex}-${colIndex}-${option.value}`;
                              return (
                                <label key={option.value} for={id}>
                                  <input
                                    id={id}
                                    type="radio"
                                    name={`${props.field.handle}[${rowIndex}][${colIndex}]`}
                                    value={option.value}
                                    checked={
                                      String(cellValue ?? "") === option.value
                                    }
                                    disabled={!isEnabled}
                                    onChange={() => {
                                      updateCell(
                                        rowIndex,
                                        colIndex,
                                        option.value,
                                      );
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
                        <td key={cellKey}>
                          <textarea
                            value={String(cellValue ?? "")}
                            placeholder={column.placeholder}
                            disabled={!isEnabled}
                            required={column.required || undefined}
                            onInput={(event) => {
                              updateCell(
                                rowIndex,
                                colIndex,
                                event.target.value,
                              );
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
                        Number(
                          (column.metadata as { fileCount?: number } | null)
                            ?.fileCount ?? 1,
                        ),
                      );
                      return (
                        <td key={cellKey}>
                          <input
                            type="file"
                            multiple={fileCount > 1}
                            disabled={!isEnabled}
                            onChange={(event) => {
                              const files = Array.from(
                                event.target.files ?? [],
                              );
                              updateCell(
                                rowIndex,
                                colIndex,
                                fileCount > 1 ? files : files.slice(0, 1),
                              );
                            }}
                          />
                          {selected.length > 0 ? (
                            <div class="ff-table__file-names">
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
                      <td key={cellKey}>
                        <input
                          type={column.type === "number" ? "number" : "text"}
                          value={String(cellValue ?? "")}
                          placeholder={column.placeholder}
                          disabled={!isEnabled}
                          required={column.required || undefined}
                          onInput={(event) => {
                            updateCell(rowIndex, colIndex, event.target.value);
                          }}
                        />
                      </td>
                    );
                  })}
                  <td>
                    {canRemoveTableRow(currentRows, rowIndex, currentConfig) ? (
                      <button
                        type="button"
                        disabled={!isEnabled}
                        onClick={() => {
                          setRows(
                            currentRows.filter(
                              (_, index) => index !== rowIndex,
                            ),
                          );
                        }}
                      >
                        {currentConfig.removeButtonLabel || "Remove"}
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
              disabled={!isEnabled}
              onClick={() =>
                setRows([...currentRows, emptyTableRow(currentColumns)])
              }
            >
              {currentConfig.addButtonLabel || "Add"}
            </button>
          ) : null}
        </div>
      );
    };
  },
});
