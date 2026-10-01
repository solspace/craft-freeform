// @ts-nocheck
import type { SearchableSelectConfig } from "@solspace/freeform-core";
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";
import { SearchableSelectWrapper } from "./SearchableSelect.js";

export function MultipleSelectFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const selected = Array.isArray(props.value)
    ? props.value.map(String)
    : props.value
      ? [String(props.value)]
      : [];

  const select = (
    <select
      class={props.classNames.input}
      id={input.id}
      name={input.name}
      multiple
      required={input.required}
      disabled={input.disabled}
      aria-invalid={input["aria-invalid"]}
      aria-describedby={input["aria-describedby"]}
      onChange={(event) => {
        const next = Array.from(event.target.selectedOptions).map(
          (option) => option.value,
        );
        props.form.setValue(props.field.handle, next);
      }}
      onBlur={input.onBlur}
    >
      {(props.field.options ?? []).map((option) => (
        <option
          key={option.value}
          value={option.value}
          selected={selected.includes(option.value)}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
  const config = props.field.frontend?.config?.searchable as
    | SearchableSelectConfig
    | undefined;
  return config?.enabled ? (
    <SearchableSelectWrapper config={{ ...config, label: props.field.label }}>
      {select}
    </SearchableSelectWrapper>
  ) : (
    select
  );
}
