export type CalculationConfig = {
    calculations?: string;
    decimalCount?: number | null;
    inputType?: "regularTextInput" | "plainText" | "hidden" | string;
};
export declare function extractCalculationHandles(calculations: string): string[];
/**
 * Evaluate a Freeform calculation formula against current field values.
 * Mirrors classic Freeform JS (`field:handle` → ExpressionLanguage).
 */
export declare function evaluateCalculation(calculations: string, values: Record<string, unknown>, decimalCount?: number | null): Promise<string | number | null>;
export declare function getCalculationConfig(config: Record<string, unknown> | undefined): CalculationConfig;
//# sourceMappingURL=evaluate.d.ts.map