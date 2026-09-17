// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function RegexFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const pattern =
    (props.field.validation?.pattern as string | undefined) ||
    ((props.field.frontend?.config?.pattern as string | undefined) ??
      undefined);

  return (
    <input
      type="text"
      class={props.classNames.input}
      pattern={pattern || undefined}
      {...input}
    />
  );
}
