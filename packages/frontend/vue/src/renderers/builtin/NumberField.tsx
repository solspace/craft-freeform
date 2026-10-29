// @ts-nocheck
import {
  mountNumber,
  type NumberConfig,
  numberInputAttributes,
} from "@solspace/freeform-core";
import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch,
} from "vue";
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export const NumberFieldRenderer = defineComponent({
  name: "NumberFieldRenderer",
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
    const error = ref("");
    const errorId = useId();
    let controller: ReturnType<typeof mountNumber> | undefined;
    const mount = () => {
      controller?.destroy();
      if (element.value)
        controller = mountNumber(
          element.value,
          props.field.frontend?.config as NumberConfig,
          (text) => {
            error.value = text;
          },
        );
    };
    onMounted(mount);
    watch(() => JSON.stringify(props.field.frontend?.config), mount, {
      flush: "post",
    });
    watch(
      () => [
        props.input.value,
        props.input.disabled,
        props.form.resetVersion,
        JSON.stringify(props.errors ?? []),
      ],
      () => controller?.clear(),
    );
    onBeforeUnmount(() => controller?.destroy());
    return () => {
      const input = inputProps(props);
      const visibleError = props.errors?.length ? "" : error.value;
      return (
        <>
          <input
            type="number"
            class={props.classNames.input}
            {...numberInputAttributes(
              props.field.frontend?.config as NumberConfig,
            )}
            {...input}
            ref={element}
            onInput={input.onChange}
            aria-invalid={!!visibleError || input["aria-invalid"]}
            aria-describedby={
              [input["aria-describedby"], visibleError ? errorId : undefined]
                .filter(Boolean)
                .join(" ") || undefined
            }
          />
          {visibleError && (
            <div
              id={errorId}
              class={props.classNames.errors}
              role="status"
              aria-live="polite"
            >
              <div class={props.classNames.error}>{visibleError}</div>
            </div>
          )}
        </>
      );
    };
  },
});
