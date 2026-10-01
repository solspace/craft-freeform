import { useFieldExtension } from "../../hooks/useFieldExtension.js";
import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function DatetimeFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const config = (props.field.frontend?.config ?? {}) as {
    useNativeTypes?: boolean;
    nativeInputType?: string;
    useDatepicker?: boolean;
  };
  const inputType = config.useNativeTypes
    ? config.nativeInputType || "datetime-local"
    : "text";
  const hostRef = useFieldExtension(props.field, props.form);

  return (
    <div ref={hostRef} data-freeform-datetime={props.field.handle}>
      <input
        type={inputType}
        className={props.classNames.input}
        data-datepicker=""
        data-datepicker-enabled={config.useDatepicker ? "1" : "0"}
        {...input}
      />
    </div>
  );
}
