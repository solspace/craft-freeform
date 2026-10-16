// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

function resolveCheckedValue(props: VueFieldRendererProps): string {
  const config = (props.field.frontend?.config ?? {}) as {
    checkedValue?: string;
  };
  if (typeof config.checkedValue === "string" && config.checkedValue) {
    return config.checkedValue;
  }
  if (
    typeof props.field.defaultValue === "string" &&
    props.field.defaultValue
  ) {
    return props.field.defaultValue;
  }
  return "yes";
}

function isChecked(value: unknown, checkedValue: string): boolean {
  if (value === true) {
    return true;
  }
  if (typeof value !== "string" && typeof value !== "number") {
    return false;
  }
  const normalized = String(value);
  return (
    normalized === checkedValue || normalized === "1" || normalized === "true"
  );
}

export function CheckboxFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const checkedValue = resolveCheckedValue(props);
  const checked = isChecked(input.value ?? props.value, checkedValue);
  const label = props.field.label ?? "";

  return (
    <label class={props.classNames.optionLabel ?? props.classNames.input}>
      <input
        type="checkbox"
        class={props.classNames.optionInput}
        id={input.id}
        name={input.name}
        checked={checked}
        disabled={input.disabled}
        aria-invalid={input["aria-invalid"]}
        onChange={(event) => {
          props.form.setValue(
            props.field.handle,
            event.target.checked ? checkedValue : "",
          );
        }}
        onBlur={input.onBlur}
      />
      {props.allowRawHtml ? <span innerHTML={label} /> : <span>{label}</span>}
    </label>
  );
}
