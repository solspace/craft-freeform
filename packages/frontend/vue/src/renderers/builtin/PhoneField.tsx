// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function PhoneFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  return <input type="tel" class={props.classNames.input} {...input} />;
}
