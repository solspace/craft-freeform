import { ButtonGroup } from "@components/elements/button-group/button-group";
import translate from "@ff-client/utils/translations";
import type { ReactNode } from "react";
import type { Choice } from "./choice-buttons";

const icons: Record<string, ReactNode> = {
  regularTextInput: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M8 9v6M6 9h4M6 15h4M13 12h4" />
    </>
  ),
  plainText: <path d="M4 6h16M4 12h16M4 18h10" />,
  hidden: (
    <>
      <path d="m3 3 18 18M10.5 10.5a2 2 0 0 0 3 3M9 5.5c1-.3 2-.5 3-.5 6 0 10 7 10 7a20 20 0 0 1-3 3.5M6 6.5A23 23 0 0 0 2 12s4 7 10 7c1.7 0 3.3-.6 4.7-1.4" />
    </>
  ),
};

export function CalculationInputType({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: unknown;
  options: Choice[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <ButtonGroup
      label={label}
      value={typeof value === "string" ? value : ""}
      disabled={disabled}
      stacked
      options={options.map((option) => ({
        ...option,
        label:
          option.value === "regularTextInput"
            ? translate("Text input")
            : option.label,
      }))}
      renderIcon={(value) => (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icons[value]}
        </svg>
      )}
      onClick={onChange}
    />
  );
}
