import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function PhoneFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <input type="tel" className={props.classNames.input} {...input} />;
}
