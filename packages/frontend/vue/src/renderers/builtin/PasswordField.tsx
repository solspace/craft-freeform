// @ts-nocheck
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

export const PasswordFieldRenderer = defineComponent({
  name: "PasswordFieldRenderer",
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
    const visible = ref(false);
    const element = ref<HTMLInputElement>();
    const generatedId = useId();
    let form: HTMLFormElement | null | undefined;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (!event.defaultPrevented) visible.value = false;
      });
    onMounted(() => {
      form = element.value?.form;
      form?.addEventListener("reset", reset);
    });
    onBeforeUnmount(() => form?.removeEventListener("reset", reset));
    watch(
      () => [
        props.input.value,
        props.field.frontend?.config?.showPasswordToggle,
      ],
      ([value, enabled]) => {
        if (!value || !enabled) visible.value = false;
      },
    );
    return () => {
      const input = inputProps(props);
      const enabled = props.field.frontend?.config?.showPasswordToggle === true;
      const labels = props.field.frontend?.config?.passwordToggleLabels as
        | { show?: string; hide?: string }
        | undefined;
      const id = input.id ?? generatedId;
      return (
        <>
          <input
            class={props.classNames.input}
            {...input}
            id={id}
            ref={element}
            type={enabled && visible.value ? "text" : "password"}
          />
          {enabled && (
            <button
              type="button"
              class={props.classNames.passwordToggle}
              aria-controls={id}
              disabled={input.disabled}
              onClick={() => {
                visible.value = !visible.value;
              }}
              style={{
                display: "block",
                margin: ".25rem 0 0 auto",
                padding: "0 .125rem",
                minHeight: "24px",
                border: 0,
                background: "transparent",
                color: "inherit",
                font: "inherit",
                fontSize: ".8125rem",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              {visible.value
                ? (labels?.hide ?? "Hide password")
                : (labels?.show ?? "Show password")}
            </button>
          )}
        </>
      );
    };
  },
});
