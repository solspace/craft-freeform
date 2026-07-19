function toComparableNumber(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}
function normalizeScalar(value) {
    if (value === null || value === undefined) {
        return "";
    }
    if (typeof value === "boolean") {
        return value ? "1" : "";
    }
    if (typeof value === "number") {
        return String(value);
    }
    return String(value);
}
function getFieldValue(values, field, hiddenFields) {
    if (hiddenFields.has(field)) {
        return null;
    }
    const raw = values[field];
    if (Array.isArray(raw)) {
        return raw.map((item) => String(item));
    }
    return normalizeScalar(raw);
}
function evaluateArrayCondition(currentValue, operator, compareValue) {
    switch (operator) {
        case "equals":
            return currentValue.length === 1 && currentValue[0] === compareValue;
        case "notEquals":
            return !(currentValue.length === 1 && currentValue[0] === compareValue);
        case "contains":
            return compareValue ? currentValue.includes(compareValue) : false;
        case "notContains":
            return compareValue ? !currentValue.includes(compareValue) : true;
        case "isEmpty":
            return currentValue.length === 0;
        case "isNotEmpty":
            return currentValue.length > 0;
        case "isOneOf":
        case "isNotOneOf": {
            const positive = operator === "isOneOf";
            let parsed = [];
            try {
                parsed = compareValue ? JSON.parse(compareValue) : [];
            }
            catch {
                parsed = [];
            }
            const lowered = parsed.map((item) => item.toLowerCase());
            const hasCommon = currentValue.some((value) => lowered.includes(value.toLowerCase()));
            if (lowered.length === 0) {
                return positive ? currentValue.length !== 0 : currentValue.length === 0;
            }
            return positive ? hasCommon : !hasCommon;
        }
        default:
            return false;
    }
}
function evaluateScalarCondition(currentValue, operator, compareValue) {
    const left = currentValue ?? "";
    switch (operator) {
        case "equals":
            return left.toLowerCase() === String(compareValue ?? "").toLowerCase();
        case "notEquals":
            return left.toLowerCase() !== String(compareValue ?? "").toLowerCase();
        case "greaterThan": {
            const a = toComparableNumber(left);
            const b = toComparableNumber(compareValue);
            return a !== null && b !== null && a > b;
        }
        case "greaterThanOrEquals": {
            const a = toComparableNumber(left);
            const b = toComparableNumber(compareValue);
            return a !== null && b !== null && a >= b;
        }
        case "lessThan": {
            const a = toComparableNumber(left);
            const b = toComparableNumber(compareValue);
            return a !== null && b !== null && a < b;
        }
        case "lessThanOrEquals": {
            const a = toComparableNumber(left);
            const b = toComparableNumber(compareValue);
            return a !== null && b !== null && a <= b;
        }
        case "contains":
            return left
                .toLowerCase()
                .includes(String(compareValue ?? "").toLowerCase());
        case "notContains":
            return !left
                .toLowerCase()
                .includes(String(compareValue ?? "").toLowerCase());
        case "startsWith":
            return left
                .toLowerCase()
                .startsWith(String(compareValue ?? "").toLowerCase());
        case "endsWith":
            return left
                .toLowerCase()
                .endsWith(String(compareValue ?? "").toLowerCase());
        case "isEmpty":
            return left.length === 0;
        case "isNotEmpty":
            return left.length > 0;
        case "isOneOf":
        case "isNotOneOf": {
            const positive = operator === "isOneOf";
            let parsed = [];
            try {
                parsed = compareValue ? JSON.parse(compareValue) : [];
            }
            catch {
                parsed = [];
            }
            const lowered = parsed.map((item) => item.toLowerCase());
            const match = lowered.includes(left.toLowerCase());
            if (lowered.length === 0) {
                return positive ? left.length !== 0 : left.length === 0;
            }
            return positive ? match : !match;
        }
        default:
            return false;
    }
}
export function evaluateCondition(values, hiddenFields, condition) {
    const currentValue = getFieldValue(values, condition.field, hiddenFields);
    if (Array.isArray(currentValue)) {
        return evaluateArrayCondition(currentValue, condition.operator, condition.value);
    }
    return evaluateScalarCondition(currentValue, condition.operator, condition.value);
}
