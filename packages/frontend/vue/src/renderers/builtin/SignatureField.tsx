import {
  fieldId,
  getSignatureConfig,
  isSignatureValueEmpty,
  mountSignaturePad,
  SIGNATURE_PEN_CURSOR,
  type SignaturePadController,
} from "@solspace/freeform-core";
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from "vue";
import type { VueFieldRendererProps } from "../../types.js";

export const SignatureFieldRenderer = defineComponent({
  name: "SignatureFieldRenderer",
  props: {
    field: { type: Object, required: true },
    form: { type: Object, required: true },
    value: { required: true },
    classNames: { type: Object, required: true },
    input: { type: Object, default: () => ({}) },
  },
  setup(props: VueFieldRendererProps) {
    const canvasRef = shallowRef<HTMLCanvasElement | null>(null);
    const typed = ref("");
    const hasInk = ref(!isSignatureValueEmpty(props.value));
    const config = computed(() => getSignatureConfig(props.field));
    const width = computed(() => config.value.width ?? 400);
    const height = computed(() => config.value.height ?? 100);
    const penColor = computed(() => config.value.penColor || "#000000");
    const backgroundColor = computed(
      () => config.value.backgroundColor || "rgba(0,0,0,0)",
    );
    const penSize = computed(() => config.value.penDotSize ?? 2.5);
    const enabled = () => props.form.isFieldEnabled(props.field.handle);
    let controller: SignaturePadController | undefined;

    function initCanvas() {
      controller?.destroy();
      const canvas = canvasRef.value;
      if (!canvas) return;
      controller = mountSignaturePad(
        canvas,
        {
          width: width.value,
          height: height.value,
          penColor: penColor.value,
          backgroundColor: backgroundColor.value,
          penDotSize: penSize.value,
        },
        {
          onChange: (value) => props.form.setValue(props.field.handle, value),
          onInkChange: (value) => {
            hasInk.value = value;
          },
          isEnabled: enabled,
          onDrawStart: () => {
            typed.value = "";
          },
        },
      );
      controller.update(props.value);
    }

    onMounted(initCanvas);
    watch([width, height, penColor, backgroundColor, penSize], initCanvas, {
      flush: "post",
    });
    watch(
      [() => props.value, () => props.form.resetVersion] as const,
      ([value, version], [, previousVersion]) => {
        if (!value) typed.value = "";
        controller?.update(value, version !== previousVersion);
      },
      { flush: "post" },
    );
    onBeforeUnmount(() => controller?.destroy());

    return () => (
      <div class={props.classNames.input} data-freeform-signature="">
        {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: Vue uses lowercase tabindex to exclude the drawing canvas from keyboard focus. */}
        <canvas
          ref={canvasRef}
          width={width.value}
          height={height.value}
          style={{
            width: "100%",
            maxWidth: width.value,
            height: height.value,
            border: `1px solid ${config.value.borderColor || "#999999"}`,
            touchAction: "none",
            cursor: enabled()
              ? config.value.showPenCursor !== false
                ? SIGNATURE_PEN_CURSOR
                : "crosshair"
              : "not-allowed",
            display: "block",
            backgroundColor:
              config.value.customizeAppearance === false
                ? "#fff"
                : backgroundColor.value,
          }}
          tabindex={-1}
          aria-hidden="true"
        />
        {config.value.allowTypedSignature === true && (
          <div class="freeform-signature-type">
            <label
              class={props.classNames.label}
              for={`${fieldId(props.field)}-typed`}
            >
              {config.value.typedLabel ?? "Or type your signature"}
            </label>
            <input
              class={props.classNames.input}
              id={`${fieldId(props.field)}-typed`}
              type="text"
              autocomplete="off"
              maxlength={200}
              disabled={!enabled()}
              value={typed.value}
              aria-describedby={
                props.input["aria-describedby"] as string | undefined
              }
              aria-invalid={props.input["aria-invalid"] as boolean | undefined}
              onInput={(event) => {
                typed.value = (event.target as HTMLInputElement).value;
                controller?.type(typed.value);
              }}
            />
          </div>
        )}
        <button
          type="button"
          disabled={
            (!hasInk.value && !props.value && !typed.value) || !enabled()
          }
          onClick={() => {
            typed.value = "";
            controller?.clear();
          }}
        >
          {config.value.clearLabel ?? "Clear"}
        </button>
      </div>
    );
  },
});
