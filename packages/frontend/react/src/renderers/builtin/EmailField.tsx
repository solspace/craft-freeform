import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function EmailFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <input type="email" className={props.classNames.input} {...input} />;
}
