// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function TextFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  return <input type="text" class={props.classNames.input} {...input} />;
}
