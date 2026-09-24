// @ts-nocheck
import {
  type InternationalPhoneConfig,
  mountInternationalPhone,
} from "@solspace/freeform-core";
import {
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";
export const PhoneFieldRenderer = defineComponent({
  name: "PhoneFieldRenderer",
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
    let controller: ReturnType<typeof mountInternationalPhone> | undefined;
    const setup = () => {
      controller?.destroy();
      controller = undefined;
      const config = props.field.frontend?.config as
        | InternationalPhoneConfig
        | undefined;
      if (!config?.international || !element.value) return;
      element.value.value = String(props.input.value ?? "");
      controller = mountInternationalPhone(element.value, config, (next) =>
        props.form.setValue(props.field.handle, next),
      );
    };
    onMounted(setup);
    watch(
      () => JSON.stringify(props.field.frontend?.config),
      async () => {
        await nextTick();
        setup();
      },
    );
    watch(
      () => props.input.value,
      (value) => controller?.update(String(value ?? "")),
    );
    onBeforeUnmount(() => controller?.destroy());
    return () => {
      const input = inputProps(props);
      if (props.field.frontend?.config?.international !== true)
        return <input type="tel" class={props.classNames.input} {...input} />;
      const { value, onChange, ...attributes } = input;
      return (
        <input
          type="tel"
          class={props.classNames.input}
          {...attributes}
          ref={element}
        />
      );
    };
  },
});
