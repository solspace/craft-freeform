import config from "@config/freeform/freeform.config";
import {
  type ChangeEvent,
  createElement,
  type FC,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

import { CheckboxElement } from "./checkbox.styles";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  ref?: Ref<HTMLInputElement>;
};

export const Checkbox: FC<Props> = ({ label, onChange, ...props }) => {
  if (config.metadata.craft.is.atLeast("6.0.0")) {
    return createElement(
      "craft-checkbox",
      {
        disabled: props.disabled || undefined,
        // React handles input/label clicks first. Craft can also emit change
        // after updating the input directly (for example, Select All).
        onchange: (event: Event) => {
          if (
            event.target instanceof HTMLInputElement &&
            event.target.checked !== props.checked
          ) {
            onChange?.(event as unknown as ChangeEvent<HTMLInputElement>);
          }
        },
      },
      <input
        type="checkbox"
        {...props}
        slot="input"
        onChange={props.checked === undefined ? () => {} : onChange}
      />,
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
