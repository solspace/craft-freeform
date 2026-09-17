// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function NumberFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  return <input type="number" class={props.classNames.input} {...input} />;
}
