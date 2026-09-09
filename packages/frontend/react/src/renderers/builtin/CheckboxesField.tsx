import type { ReactFieldRendererProps } from "../../types.js";

export function CheckboxesFieldRenderer(props: ReactFieldRendererProps) {
  const selected = Array.isArray(props.value)
    ? props.value.map(String)
    : props.value
      ? [String(props.value)]
      : [];

  return (
    <div className={props.classNames.input}>
      {(props.field.options ?? []).map((option) => (
        <label key={option.value} className={props.classNames.optionLabel}>
          <input
            type="checkbox"
            className={props.classNames.optionInput}
            name={`${props.field.handle}[]`}
            value={option.value}
            checked={selected.includes(option.value)}
            disabled={!props.form.isFieldEnabled(props.field.handle)}
            onChange={(event) => {
              const next = new Set(selected);
              if (event.target.checked) {
                next.add(option.value);
              } else {
                next.delete(option.value);
              }
              props.form.setValue(props.field.handle, [...next]);
            }}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
