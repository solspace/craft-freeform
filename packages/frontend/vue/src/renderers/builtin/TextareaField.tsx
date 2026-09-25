// @ts-nocheck
import {
  getCharacterCount,
  mountTextareaAutoGrow,
} from "@solspace/freeform-core";
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

function textareaRows(props) {
  const rows = props.field.frontend?.config?.rows;
  return typeof rows === "number" && rows > 0 ? rows : 4;
}

function autoGrowMaxHeight(props) {
  const max = props.field.frontend?.config?.autoGrowMaxHeight;
  return typeof max === "number" && max > 0 ? max : undefined;
}

export const TextareaFieldRenderer = defineComponent({
  name: "TextareaFieldRenderer",
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
    const element = ref();
    let controller: ReturnType<typeof mountTextareaAutoGrow> | undefined;

    const syncAutoGrow = () => {
      controller?.destroy();
      controller = undefined;
      if (props.field.frontend?.config?.autoGrow !== true || !element.value) {
        return;
      }
      controller = mountTextareaAutoGrow(element.value, {
        autoGrowMaxHeight: autoGrowMaxHeight(props),
      });
    };

    onMounted(syncAutoGrow);
    watch(
      () =>
        JSON.stringify({
          autoGrow: props.field.frontend?.config?.autoGrow,
          autoGrowMaxHeight: props.field.frontend?.config?.autoGrowMaxHeight,
        }),
      syncAutoGrow,
      { flush: "post" },
    );
    watch(
      () => props.input.value,
      () => controller?.update(),
    );
    onBeforeUnmount(() => controller?.destroy());

    return () => {
      const input = inputProps(props);
      const counter = getCharacterCount(
        props.field,
        input.value ?? props.value,
      );
      const rows = textareaRows(props);
      const counterId = `${input.id ?? props.field.uid}-character-count`;
      const descriptions = counter
        ? [input["aria-describedby"], counterId].filter(Boolean).join(" ")
        : input["aria-describedby"];

      const textarea = (
        <textarea
          rows={rows}
          class={props.classNames.input}
          {...input}
          ref={element}
          maxLength={counter?.limit}
          aria-describedby={descriptions}
          onInput={input.onChange}
        />
      );

      if (!counter) {
        return textarea;
      }

      return (
        <>
          {textarea}
          <div
            id={counterId}
            aria-live="off"
            class={
              counter.overLimit
                ? props.classNames.characterCountError
                : props.classNames.characterCount
            }
            style={{
              marginTop: "0.25rem",
              fontSize: "0.75rem",
              lineHeight: "1.5",
              textAlign: "end",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {counter.text}
          </div>
        </>
      );
    };
  },
});
