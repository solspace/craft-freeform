import type React from "react";
import type { InputHTMLAttributes } from "react";

import { CheckboxElement } from "./checkbox.styles";

type Props = InputHTMLAttributes<HTMLInputElement>;

export const Checkbox: React.FC<Props> = (props) => {
  return <CheckboxElement type="checkbox" {...props} />;
};
