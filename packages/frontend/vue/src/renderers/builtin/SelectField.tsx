// @ts-nocheck
import type { SearchableSelectConfig } from "@solspace/freeform-core";
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";
import { SearchableSelectWrapper } from "./SearchableSelect.js";

export function SelectFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const value = String(input.value ?? "");

  const select = (
    <select class={props.classNames.input} {...input} value={value}>
      {props.field.placeholder ? (
        <option value="">{props.field.placeholder}</option>
      ) : null}
      {(props.field.options ?? []).map((option) => (
        <option key={option.value} value={option.value}>
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
