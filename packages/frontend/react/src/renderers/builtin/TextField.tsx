import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function TextFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <input type="text" className={props.classNames.input} {...input} />;
}
