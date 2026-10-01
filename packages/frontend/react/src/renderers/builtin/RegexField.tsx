import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function RegexFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const pattern =
    (props.field.validation?.pattern as string | undefined) ||
    ((props.field.frontend?.config?.pattern as string | undefined) ??
      undefined);

  return (
    <input
      type="text"
      className={props.classNames.input}
      pattern={pattern || undefined}
      {...input}
    />
  );
}
