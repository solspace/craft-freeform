import {
  evaluateCalculation,
  getCalculationConfig,
} from "@solspace/freeform-core";
import { useEffect, useRef } from "react";

import type { ReactFieldRendererProps } from "../../types.js";

/**
 * Live calculation field — recomputes when operand values change.
 * Matches classic Freeform ExpressionLanguage + field:handle formulas.
 */
export function CalculationFieldRenderer(props: ReactFieldRendererProps) {
  const { field, form, classNames, value } = props;
  const config = getCalculationConfig(field.frontend?.config);
  const inputType = config.inputType ?? "regularTextInput";
  const setValueRef = useRef(form.setValue);
  setValueRef.current = form.setValue;

  const _operandKey = extractOperandSnapshot(
    config.calculations ?? "",
    form.values,
  );

  useEffect(() => {
    let cancelled = false;
    const formula = config.calculations ?? "";

    void (async () => {
      const result = await evaluateCalculation(
        formula,
        form.values,
        config.decimalCount,
      );

      if (cancelled) {
        return;
      }

      const next = result == null ? "" : String(result);
      const current = form.getValue(field.handle);
      if (String(current ?? "") !== next) {
        setValueRef.current(field.handle, next);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Re-run when operand values change (snapshot string), not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional operandKey
  }, [
    field.handle,
    config.calculations,
    config.decimalCount,
    form.values,
    form.getValue,
  ]);

  const display = value == null || value === "" ? "" : String(value);

  if (inputType === "hidden") {
    return <input type="hidden" name={field.handle} value={display} readOnly />;
  }

  if (inputType === "plainText") {
    return (
      <div className={classNames.input}>
        <input type="hidden" name={field.handle} value={display} readOnly />
        <p className="ff-field__calculation-plain" data-freeform-calculation="">
          {display}
        </p>
      </div>
    );
  }

  return (
    <input
      className={classNames.input}
      type="text"
      name={field.handle}
      id={`freeform-${field.handle}`}
      value={display}
      readOnly
      aria-readonly="true"
    />
  );
}

function extractOperandSnapshot(
  calculations: string,
  values: Record<string, unknown>,
): string {
  const handles: string[] = [];
  for (const match of calculations.matchAll(/field:([a-zA-Z0-9_]+)/g)) {
    if (!handles.includes(match[1])) {
      handles.push(match[1]);
    }
  }

  return handles
    .map((handle) => `${handle}:${String(values[handle] ?? "")}`)
    .join("|");
}
