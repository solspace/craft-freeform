// @ts-nocheck
import ExtensionHost from "../../components/ExtensionHost.vue";
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function DatetimeFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const config = (props.field.frontend?.config ?? {}) as {
    useNativeTypes?: boolean;
    nativeInputType?: string;
    useDatepicker?: boolean;
  };
  const inputType = config.useNativeTypes
    ? config.nativeInputType || "datetime-local"
    : "text";

  return (
    <ExtensionHost
      field={props.field}
      form={props.form}
      dataAttr="data-freeform-datetime"
    >
      <input
        type={inputType}
        class={props.classNames.input}
        data-datepicker=""
        data-datepicker-enabled={config.useDatepicker ? "1" : "0"}
        {...input}
      />
    </ExtensionHost>
  );
}
