import type { SearchableSelectConfig } from "@solspace/freeform-core";
import type { CSSProperties, ReactNode } from "react";
import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";
import { SearchableSelectWrapper } from "./SearchableSelect.js";

/** Inline styles so demos don't need to @source this package for TW utilities. */
const wrapStyle: CSSProperties = {
  marginTop: "0.25rem",
  display: "grid",
  gridTemplateColumns: "1fr",
};

const chevronStyle: CSSProperties = {
  gridColumnStart: 1,
  gridRowStart: 1,
  width: "1rem",
  height: "1rem",
  marginRight: "0.5rem",
  justifySelf: "end",
  alignSelf: "center",
  pointerEvents: "none",
  color: "#6b7280",
};

function SelectChevron() {
  return (
    <svg
      style={chevronStyle}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      data-slot="icon"
    >
      <path
        fillRule="evenodd"
        d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function withChevron(select: ReactNode) {
  return (
    <div style={wrapStyle}>
      {select}
      <SelectChevron />
    </div>
  );
}

export function SelectFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const value = String(input.value ?? "");

  const select = (
    <select className={props.classNames.input} {...input} value={value}>
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

  // Only add an SVG caret when the theme opts into `appearance-none`
  // (Tailwind). Bootstrap `form-select` and Default CSS already draw one.
  const inputClass = props.classNames.input ?? "";
  const needsChevron = /\bappearance-none\b/.test(inputClass);
  const wrapped = needsChevron ? withChevron(select) : select;

  return config?.enabled ? (
    <SearchableSelectWrapper config={{ ...config, label: props.field.label }}>
      {wrapped}
    </SearchableSelectWrapper>
  ) : (
    wrapped
  );
}
