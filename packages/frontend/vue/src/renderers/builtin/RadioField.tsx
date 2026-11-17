// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function RadioFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const value = String(props.value ?? "");

  return (
    <div class={props.classNames.input}>
      {(props.field.options ?? []).map((option) => (
        <label key={option.value} class={props.classNames.optionLabel}>
          <input
            type="radio"
            class={props.classNames.optionInput}
            name={props.field.handle}
            value={option.value}
            checked={value === option.value}
            aria-invalid={input["aria-invalid"]}
            aria-describedby={input["aria-describedby"]}
            required={props.field.required}
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
