import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function ConfirmFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const targetType = props.field.frontend?.config?.targetType as
    | string
    | undefined;
  const type = targetType === "password" ? "password" : "text";

  return <input type={type} className={props.classNames.input} {...input} />;
}
