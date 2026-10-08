// @ts-nocheck
import {
  type EmailSuggestionConfig,
  mountEmailSuggestions,
} from "@solspace/freeform-core";
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export const EmailFieldRenderer = defineComponent({
  name: "EmailFieldRenderer",
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
    let controller: ReturnType<typeof mountEmailSuggestions> | undefined;

    const syncSuggestions = () => {
      controller?.destroy();
      controller = undefined;

      const config = props.field.frontend?.config as
        | EmailSuggestionConfig
        | undefined;

      if (config?.suggestEmailCorrections !== true || !element.value) return;

      controller = mountEmailSuggestions(
        element.value,
        config.emailSuggestionLabels,
        (value) => props.form.setValue(props.field.handle, value),
      );
    };

    onMounted(syncSuggestions);

    // Vue's watch() rebuilds the controller when settings or labels change.
    // Run after the DOM update so the input ref and attributes are current.
    watch(() => JSON.stringify(props.field.frontend?.config), syncSuggestions, {
      flush: "post",
    });

    // Runtime updates and form resets must dismiss suggestions for old values.
    watch(
      () => props.input.value,
      () => controller?.clear(),
    );

    onBeforeUnmount(() => controller?.destroy());

    return () => (
      <input
        type="email"
        class={props.classNames.input}
        {...inputProps(props)}
        ref={element}
      />
    );
  },
});
