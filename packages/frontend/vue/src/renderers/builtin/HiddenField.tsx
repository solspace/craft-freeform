// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function HiddenFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  return <input type="hidden" {...input} />;
}
