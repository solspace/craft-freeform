import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { canAddTableRow, canRemoveTableRow, emptyTableRow, getTableConfig, normalizeTableOptions, normalizeTableRows, } from "@solspace/freeform-core";
import { useEffect, useRef } from "react";
/**
 * Table field renderer backed by @solspace/freeform-core table helpers
 * (row limits, required columns, matrix value shape). Register `tableExtension`
 * from @solspace/freeform-extensions so manifests that require it resolve.
 */
export function TableFieldRenderer(props) {
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
            props.form.setValue(props.field.handle, rows);
        }
    }, [props.field.handle, props.form, props.value, rows]);
    const setRows = (next) => {
        props.form.setValue(props.field.handle, next);
    };
    const updateCell = (rowIndex, columnIndex, value) => {
        const next = rows.map((row) => [...row]);
        next[rowIndex][columnIndex] = value;
        setRows(next);
    };
    const showAdd = canAddTableRow(rows, config);
    return (_jsxs("div", { className: props.classNames.input, "data-freeform-table": "", children: [_jsxs("table", { className: "ff-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [columns.map((column) => (_jsx("th", { className: column.required ? "is-required" : undefined, "data-column-required": column.required ? "true" : undefined, children: column.label }, column.label))), _jsx("th", {})] }) }), _jsx("tbody", { children: rows.map((row, rowIndex) => (_jsxs("tr", { children: [columns.map((column, colIndex) => {
                                    const cellValue = row[colIndex];
                                    const optionList = normalizeTableOptions(column.options);
                                    if (column.type === "checkbox") {
                                        return (_jsx("td", { children: _jsx("input", { type: "checkbox", checked: Boolean(cellValue), disabled: !enabled, required: column.required || undefined, onChange: (event) => {
                                                    updateCell(rowIndex, colIndex, event.target.checked ? "1" : "");
                                                } }) }, column.label));
                                    }
                                    if (column.type === "select" || column.type === "dropdown") {
                                        return (_jsx("td", { children: _jsxs("select", { value: String(cellValue ?? ""), disabled: !enabled, required: column.required || undefined, onChange: (event) => {
                                                    updateCell(rowIndex, colIndex, event.target.value);
                                                }, children: [_jsx("option", { value: "", children: column.placeholder || "Select…" }), optionList.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }) }, column.label));
                                    }
                                    if (column.type === "radio") {
                                        return (_jsx("td", { children: _jsx("div", { className: "ff-table__radios", children: optionList.map((option) => {
                                                    const id = `${props.field.handle}-${rowIndex}-${colIndex}-${option.value}`;
                                                    return (_jsxs("label", { htmlFor: id, children: [_jsx("input", { id: id, type: "radio", name: `${props.field.handle}[${rowIndex}][${colIndex}]`, value: option.value, checked: String(cellValue ?? "") === option.value, disabled: !enabled, onChange: () => {
                                                                    updateCell(rowIndex, colIndex, option.value);
                                                                } }), " ", option.label] }, option.value));
                                                }) }) }, column.label));
                                    }
                                    if (column.type === "textarea") {
                                        return (_jsx("td", { children: _jsx("textarea", { value: String(cellValue ?? ""), placeholder: column.placeholder, disabled: !enabled, required: column.required || undefined, onChange: (event) => {
                                                    updateCell(rowIndex, colIndex, event.target.value);
                                                } }) }, column.label));
                                    }
                                    if (column.type === "file") {
                                        const selected = Array.isArray(cellValue)
                                            ? cellValue
                                            : [];
                                        const fileCount = Math.max(1, Number(column.metadata?.fileCount ?? 1));
                                        return (_jsxs("td", { children: [_jsx("input", { type: "file", multiple: fileCount > 1, disabled: !enabled, onChange: (event) => {
                                                        const files = Array.from(event.target.files ?? []);
                                                        updateCell(rowIndex, colIndex, fileCount > 1 ? files : files.slice(0, 1));
                                                    } }), selected.length > 0 ? (_jsx("div", { className: "ff-table__file-names", children: selected.map((file) => (_jsx("span", { children: file.name }, `${file.name}-${file.size}`))) })) : null] }, column.label));
                                    }
                                    return (_jsx("td", { children: _jsx("input", { type: "text", value: String(cellValue ?? ""), placeholder: column.placeholder, disabled: !enabled, required: column.required || undefined, onChange: (event) => {
                                                updateCell(rowIndex, colIndex, event.target.value);
                                            } }) }, column.label));
                                }), _jsx("td", { children: canRemoveTableRow(rows, rowIndex, config) ? (_jsx("button", { type: "button", disabled: !enabled, onClick: () => {
                                            setRows(rows.filter((_, index) => index !== rowIndex));
                                        }, children: config.removeButtonLabel || "Remove" })) : null })] }, `row-${rowIndex}`))) })] }), showAdd ? (_jsx("button", { type: "button", disabled: !enabled, onClick: () => setRows([...rows, emptyTableRow(columns)]), children: config.addButtonLabel || "Add" })) : null] }));
}
