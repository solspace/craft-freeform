import config from "@config/freeform/freeform.config";
import {
  type ChangeEvent,
  createElement,
  type FC,
  type InputHTMLAttributes,
} from "react";

import { CheckboxElement } from "./checkbox.styles";

type Props = InputHTMLAttributes<HTMLInputElement> & { label?: string };

export const Checkbox: FC<Props> = ({ label, onChange, ...props }) => {
  if (config.metadata.craft.is.atLeast("6.0.0")) {
    return createElement(
      "craft-checkbox",
      {
        disabled: props.disabled || undefined,
        // Craft handles label/keyboard activation and emits a native change.
        onchange: (event: Event) => {
          if (event.target instanceof HTMLInputElement) {
            onChange?.(event as unknown as ChangeEvent<HTMLInputElement>);
          }
        },
      },
      <input type="checkbox" {...props} slot="input" onChange={() => {}} />,
      label && (
        <label slot="label" htmlFor={props.id}>
          {label}
        </label>
      ),
    );
  }

  return (
    <>
      <CheckboxElement type="checkbox" {...props} onChange={onChange} />
      {label && <label htmlFor={props.id}>{label}</label>}
    </>
  );
};
