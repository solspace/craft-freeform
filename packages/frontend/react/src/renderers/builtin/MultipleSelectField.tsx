import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function MultipleSelectFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const selected = Array.isArray(props.value)
    ? props.value.map(String)
    : props.value
      ? [String(props.value)]
      : [];

  return (
    <select
      className={props.classNames.input}
      id={input.id}
      name={input.name}
      multiple
      disabled={input.disabled}
      aria-invalid={input["aria-invalid"]}
      value={selected}
      onChange={(event) => {
        const next = Array.from(event.target.selectedOptions).map(
          (option) => option.value,
        );
        props.form.setValue(props.field.handle, next);
      }}
      onBlur={input.onBlur}
    >
      {(props.field.options ?? []).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
