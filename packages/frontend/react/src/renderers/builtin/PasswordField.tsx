import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function PasswordFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return (
    <input type="password" className={props.classNames.input} {...input} />
  );
}
