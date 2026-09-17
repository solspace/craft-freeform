// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function SelectFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const value = String(input.value ?? "");

  return (
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
}
