// @ts-nocheck
import ExtensionHost from "../../components/ExtensionHost.vue";
import type { VueFieldRendererProps } from "../../types.js";

export function FileDndFieldRenderer(props: VueFieldRendererProps) {
  return (
    <ExtensionHost
      field={props.field}
      form={props.form}
      class={props.classNames.input}
      dataAttr="data-freeform-file-dnd"
    />
  );
}
