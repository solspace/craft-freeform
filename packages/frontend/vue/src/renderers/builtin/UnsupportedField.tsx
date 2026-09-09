// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";

export function UnsupportedFieldRenderer(props: VueFieldRendererProps) {
  return (
    <div class={props.classNames.input} role="alert">
      Unsupported field type: {props.field.type}
    </div>
  );
}
