import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function HiddenFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <input type="hidden" {...input} />;
}
