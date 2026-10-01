import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function WebsiteFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <input type="url" className={props.classNames.input} {...input} />;
}
