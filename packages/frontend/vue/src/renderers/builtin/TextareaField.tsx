// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function TextareaFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  return <textarea class={props.classNames.input} rows={4} {...input} />;
}
