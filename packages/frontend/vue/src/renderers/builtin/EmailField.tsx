// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function EmailFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  return <input type="email" class={props.classNames.input} {...input} />;
}
