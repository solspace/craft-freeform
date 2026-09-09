import type { ReactFieldRendererProps } from "../../types.js";

export function UnsupportedFieldRenderer(props: ReactFieldRendererProps) {
  return (
    <div className={props.classNames.input} role="alert">
      Unsupported field type: {props.field.type}
    </div>
  );
}
