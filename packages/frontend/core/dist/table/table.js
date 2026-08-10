export function getTableConfig(field) {
    return (field.frontend?.config ?? {});
}
export function normalizeTableOptions(options = []) {
    return options.map((option) => typeof option === "string" ? { label: option, value: option } : option);
}
export function emptyTableRow(columns) {
    return columns.map((column) => {
        if (column.type === "checkbox") {
            return column.checked ? "1" : "";
        }
        if (column.type === "file") {
            return [];
        }
        return column.value ?? "";
    });
}
export function resolveInitialRowCount(config) {
    if (config.limitRows === "exact" &&
        config.exactRows &&
        config.exactRows > 0) {
        return config.exactRows;
    }
    if ((config.limitRows === "min" || config.limitRows === "range") &&
        config.minRows &&
        config.minRows > 0) {
        return Math.max(1, config.minRows);
    }
    return 1;
}
export function normalizeTableRows(value, columns, config) {
    const fallback = () => {
        const count = resolveInitialRowCount(config);
        return Array.from({ length: count }, () => emptyTableRow(columns));
    };
    if (!Array.isArray(value) || value.length === 0) {
        return fallback();
    }
    const rows = value.map((row) => {
        if (!Array.isArray(row)) {
            return emptyTableRow(columns);
        }
        return columns.map((column, index) => {
            if (!(index in row)) {
                return emptyTableRow([column])[0];
            }
            const cell = row[index];
            if (column.type === "file") {
                if (Array.isArray(cell)) {
                    return cell;
                }
                if (cell instanceof File) {
                    return [cell];
                }
                return [];
            }
            if (column.type === "checkbox") {
                return cell === true || cell === "1" || cell === 1 ? "1" : "";
            }
            return cell ?? column.value ?? "";
        });
    });
    const minCount = resolveInitialRowCount(config);
    while (rows.length < minCount) {
        rows.push(emptyTableRow(columns));
    }
    if (config.limitRows === "exact" &&
        config.exactRows &&
        config.exactRows > 0) {
        return rows.slice(0, config.exactRows);
    }
    if (config.maxRows && config.maxRows > 0 && rows.length > config.maxRows) {
        return rows.slice(0, config.maxRows);
    }
    return rows;
}
export function canAddTableRow(rows, config) {
    if (config.limitRows === "exact") {
        return false;
    }
    if (!config.maxRows || config.maxRows <= 0) {
        return true;
    }
    return rows.length < config.maxRows;
}
export function canRemoveTableRow(rows, rowIndex, config) {
    if (config.limitRows === "exact") {
        return false;
    }
    const min = config.limitRows === "min" || config.limitRows === "range"
        ? Math.max(1, config.minRows ?? 1)
        : 1;
    if (rows.length <= min) {
        return false;
    }
    // Classic Freeform only allows removing rows at/after the min threshold index.
    if ((config.limitRows === "min" || config.limitRows === "range") &&
        config.minRows &&
        rowIndex < config.minRows) {
        return false;
    }
    return true;
}
function isCellEmpty(value, type) {
    if (type === "checkbox") {
        return !(value === true || value === "1" || value === 1);
    }
    if (type === "file") {
        return !Array.isArray(value) || value.length === 0;
    }
    if (value === null || value === undefined) {
        return true;
    }
    return String(value).trim() === "";
}
export function validateTableValue(field, value) {
    const config = getTableConfig(field);
    const columns = config.columns ?? [];
    const rows = normalizeTableRows(value, columns, config);
    const issues = [];
    if (config.limitRows === "exact" &&
        config.exactRows &&
        config.exactRows > 0) {
        if (rows.length !== config.exactRows) {
            issues.push({
                rowIndex: -1,
                columnIndex: -1,
                columnLabel: field.label,
                message: `${field.label} must have exactly ${config.exactRows} rows.`,
            });
        }
    }
    if ((config.limitRows === "min" || config.limitRows === "range") &&
        config.minRows &&
        rows.length < config.minRows) {
        issues.push({
            rowIndex: -1,
            columnIndex: -1,
            columnLabel: field.label,
            message: `${field.label} must have at least ${config.minRows} rows.`,
        });
    }
    if ((config.limitRows === "max" ||
        config.limitRows === "range" ||
        !config.limitRows) &&
        config.maxRows &&
        rows.length > config.maxRows) {
        issues.push({
            rowIndex: -1,
            columnIndex: -1,
            columnLabel: field.label,
            message: `${field.label} cannot have more than ${config.maxRows} rows.`,
        });
    }
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
            const column = columns[columnIndex];
            if (!column.required) {
                continue;
            }
            if (isCellEmpty(row[columnIndex], column.type)) {
                issues.push({
                    rowIndex,
                    columnIndex,
                    columnLabel: column.label,
                    message: `${column.label} is required (row ${rowIndex + 1}).`,
                });
            }
        }
    }
    return issues;
}
