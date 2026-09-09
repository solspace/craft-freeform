// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function PasswordFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  return <input type="password" class={props.classNames.input} {...input} />;
}
