import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function CheckboxFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const checked =
    input.value === "1" || props.value === true || input.value === "true";
  const label = props.field.label ?? "";

  return (
    <label className={props.classNames.optionLabel ?? props.classNames.input}>
      <input
        type="checkbox"
        className={props.classNames.optionInput}
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
      {props.allowRawHtml ? (
        <span dangerouslySetInnerHTML={{ __html: label }} />
      ) : (
        <span>{label}</span>
      )}
    </label>
  );
}
