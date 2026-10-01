// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";

export function RadioFieldRenderer(props: VueFieldRendererProps) {
  const value = String(props.value ?? "");

  return (
    <div class={props.classNames.input} role="radiogroup">
      {(props.field.options ?? []).map((option) => (
        <label key={option.value} class={props.classNames.optionLabel}>
          <input
            type="radio"
            class={props.classNames.optionInput}
            name={props.field.handle}
            value={option.value}
            checked={value === option.value}
            disabled={!props.form.isFieldEnabled(props.field.handle)}
            onChange={() =>
              props.form.setValue(props.field.handle, option.value)
            }
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
