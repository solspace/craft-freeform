import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function FileFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const config = (props.field.frontend?.config ?? {}) as {
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
  };

  return (
    <input
      type="file"
      className={props.classNames.input}
      id={input.id}
      name={input.name}
      disabled={input.disabled}
      aria-invalid={input["aria-invalid"]}
      accept={config.accept || undefined}
      multiple={Boolean(config.multiple ?? (config.maxFiles ?? 1) > 1)}
      onChange={(event) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
          props.form.setValue(props.field.handle, null);
          return;
        }

        props.form.setValue(
          props.field.handle,
          files.length === 1 ? files[0] : Array.from(files),
        );
      }}
      onBlur={input.onBlur}
    />
  );
}
