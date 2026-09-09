// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function ConfirmFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const targetType = props.field.frontend?.config?.targetType as
    | string
    | undefined;
  const type = targetType === "password" ? "password" : "text";

  return <input type={type} class={props.classNames.input} {...input} />;
}
