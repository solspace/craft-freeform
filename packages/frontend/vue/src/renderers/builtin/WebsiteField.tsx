// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function WebsiteFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  return <input type="url" class={props.classNames.input} {...input} />;
}
