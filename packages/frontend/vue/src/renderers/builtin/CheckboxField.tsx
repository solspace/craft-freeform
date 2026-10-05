// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function CheckboxFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const checked =
    input.value === "1" || props.value === true || input.value === "true";
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
            event.target.checked ? "1" : "",
          );
        }}
        onBlur={input.onBlur}
      />
      {props.allowRawHtml ? <span innerHTML={label} /> : <span>{label}</span>}
    </label>
  );
}
