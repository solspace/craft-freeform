const FIELD_VARIABLE_PATTERN = /field:([a-zA-Z0-9_]+)/g;
let expressionLanguage = null;
async function getExpressionLanguage() {
    if (expressionLanguage) {
        return expressionLanguage;
    }
    const mod = await import("expression-language");
    const ExpressionLanguageCtor = mod
        .ExpressionLanguage ??
        mod.default;
    const Ctor = typeof ExpressionLanguageCtor === "function"
        ? ExpressionLanguageCtor
        : ExpressionLanguageCtor?.ExpressionLanguage;
    if (typeof Ctor !== "function") {
        throw new Error("expression-language ExpressionLanguage export not found.");
    }
    const instance = new Ctor();
    instance.register("sqrt", (value) => `Math.sqrt(${String(value)})`, (_values, value) => {
        if (typeof value !== "number") {
            return value;
        }
        return Math.sqrt(value);
    });
    expressionLanguage = instance;
    return instance;
}
export function extractCalculationHandles(calculations) {
    const handles = [];
    for (const match of calculations.matchAll(new RegExp(FIELD_VARIABLE_PATTERN.source, "g"))) {
        if (!handles.includes(match[1])) {
            handles.push(match[1]);
        }
    }
    return handles;
}
function coerceOperand(value) {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === "boolean" || typeof value === "number") {
        return value;
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return null;
        }
        return coerceOperand(value[0]);
    }
    const raw = String(value).trim();
    if (raw === "") {
        return null;
    }
    const lower = raw.toLowerCase();
    if (lower === "true") {
        return true;
    }
    if (lower === "false") {
        return false;
    }
    const normalized = raw.replace(",", ".");
    const asNumber = Number(normalized);
    if (!Number.isNaN(asNumber) && normalized !== "") {
        return asNumber;
    }
    return raw;
}
/**
 * Evaluate a Freeform calculation formula against current field values.
 * Mirrors classic Freeform JS (`field:handle` → ExpressionLanguage).
 */
export async function evaluateCalculation(calculations, values, decimalCount) {
    if (!calculations.trim()) {
        return null;
    }
    const handles = extractCalculationHandles(calculations);
    const variables = {};
    for (const handle of handles) {
        const coerced = coerceOperand(values[handle]);
        if (coerced === null) {
            return null;
        }
        variables[handle] = coerced;
    }
    const expression = calculations.replace(FIELD_VARIABLE_PATTERN, (_full, handle) => handle);
    const language = await getExpressionLanguage();
    const result = language.evaluate(expression, variables);
    if (typeof result === "number" && decimalCount != null) {
        return result.toFixed(decimalCount);
    }
    if (result === null || result === undefined) {
        return null;
    }
    return result;
}
export function getCalculationConfig(config) {
    return (config ?? {});
}
