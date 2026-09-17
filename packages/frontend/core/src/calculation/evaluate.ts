const FIELD_VARIABLE_PATTERN = /field:([a-zA-Z0-9_]+)/g;

export type CalculationConfig = {
  calculations?: string;
  decimalCount?: number | null;
  inputType?: "regularTextInput" | "plainText" | "hidden" | string;
};

type ExpressionLanguageLike = {
  register: (
    name: string,
    compiler: (...args: unknown[]) => string,
    evaluator: (values: Record<string, unknown>, ...args: unknown[]) => unknown,
  ) => void;
  evaluate: (expression: string, values?: Record<string, unknown>) => unknown;
};

let expressionLanguage: ExpressionLanguageLike | null = null;

async function getExpressionLanguage(): Promise<ExpressionLanguageLike> {
  if (expressionLanguage) {
    return expressionLanguage;
  }

  const mod = await import("expression-language");
  const ExpressionLanguageCtor =
    (mod as { ExpressionLanguage?: new () => ExpressionLanguageLike })
      .ExpressionLanguage ??
    (
      mod as {
        default?:
          | (new () => ExpressionLanguageLike)
          | { ExpressionLanguage?: new () => ExpressionLanguageLike };
      }
    ).default;

  const Ctor =
    typeof ExpressionLanguageCtor === "function"
      ? ExpressionLanguageCtor
      : ExpressionLanguageCtor?.ExpressionLanguage;

  if (typeof Ctor !== "function") {
    throw new Error("expression-language ExpressionLanguage export not found.");
  }

  const instance = new Ctor();
  instance.register(
    "sqrt",
    (value: unknown) => `Math.sqrt(${String(value)})`,
    (_values: Record<string, unknown>, value: unknown) => {
      if (typeof value !== "number") {
        return value;
      }
      return Math.sqrt(value);
    },
  );

  expressionLanguage = instance;
  return instance;
}

export function extractCalculationHandles(calculations: string): string[] {
  const handles: string[] = [];
  for (const match of calculations.matchAll(
    new RegExp(FIELD_VARIABLE_PATTERN.source, "g"),
  )) {
    if (!handles.includes(match[1])) {
      handles.push(match[1]);
    }
  }
  return handles;
}

function coerceOperand(value: unknown): string | number | boolean | null {
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
export async function evaluateCalculation(
  calculations: string,
  values: Record<string, unknown>,
  decimalCount?: number | null,
): Promise<string | number | null> {
  if (!calculations.trim()) {
    return null;
  }

  const handles = extractCalculationHandles(calculations);
  const variables: Record<string, string | number | boolean> = {};

  for (const handle of handles) {
    const coerced = coerceOperand(values[handle]);
    if (coerced === null) {
      return null;
    }
    variables[handle] = coerced;
  }

  const expression = calculations.replace(
    FIELD_VARIABLE_PATTERN,
    (_full, handle: string) => handle,
  );

  const language = await getExpressionLanguage();
  const result: unknown = language.evaluate(expression, variables);

  if (typeof result === "number" && decimalCount != null) {
    return result.toFixed(decimalCount);
  }

  if (result === null || result === undefined) {
    return null;
  }

  return result as string | number;
}

export function getCalculationConfig(
  config: Record<string, unknown> | undefined,
): CalculationConfig {
  return (config ?? {}) as CalculationConfig;
}
