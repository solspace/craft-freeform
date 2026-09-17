import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function NumberFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <input type="number" className={props.classNames.input} {...input} />;
}
