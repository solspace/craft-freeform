import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function TextareaFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <textarea className={props.classNames.input} rows={4} {...input} />;
}
