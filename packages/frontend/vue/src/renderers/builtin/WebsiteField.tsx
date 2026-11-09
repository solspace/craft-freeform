// @ts-nocheck
import { mountWebsite } from "@solspace/freeform-core";
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export const WebsiteFieldRenderer = defineComponent({
  name: "WebsiteFieldRenderer",
  props: [
    "field",
    "form",
    "value",
    "errors",
    "input",
    "classNames",
    "renderLabel",
    "renderInstructions",
    "renderErrors",
    "allowRawHtml",
  ],
  setup(props: VueFieldRendererProps) {
    const element = ref<HTMLInputElement>();
    let controller: ReturnType<typeof mountWebsite> | undefined;

    onMounted(() => {
      controller = mountWebsite(element.value!, (value) =>
        props.form.setValue(props.field.handle, value),
      );
    });
    onBeforeUnmount(() => controller?.destroy());
    watch(
      () => props.input.value,
      () => controller?.clear(),
    );

    return () => (
      <input
        type="url"
        class={props.classNames.input}
        {...inputProps(props)}
        ref={element}
      />
    );
  },
});
