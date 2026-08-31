import {
  getSignatureConfig,
  isSignatureValueEmpty,
} from "@solspace/freeform-core";
import {
  defineComponent,
  onMounted,
  onUnmounted,
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
  },
  setup(props: VueFieldRendererProps) {
    const canvasRef = shallowRef<HTMLCanvasElement | null>(null);
    const drawing = shallowRef(false);
    const hasInk = ref(!isSignatureValueEmpty(props.value));
    const config = getSignatureConfig(props.field);
    const width = config.width ?? 400;
    const height = config.height ?? 100;
    const enabled = props.form.isFieldEnabled(props.field.handle);
    const penColor = config.penColor || "#000000";
    const backgroundColor = config.backgroundColor || "rgba(0,0,0,0)";
    const borderColor = config.borderColor || "#999999";
    const penSize = config.penDotSize ?? 2.5;

    function paintBackground(context: CanvasRenderingContext2D) {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, width, height);
    }

    function commit() {
      const canvas = canvasRef.value;
      if (!canvas) {
        return;
      }
      props.form.setValue(props.field.handle, canvas.toDataURL("image/png"));
    }

    function clear() {
      const canvas = canvasRef.value;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) {
        return;
      }
      context.clearRect(0, 0, width, height);
      paintBackground(context);
      hasInk.value = false;
      props.form.setValue(props.field.handle, "");
    }

    function initCanvas() {
      const canvas = canvasRef.value;
      if (!canvas) {
        return;
      }

      const ratio =
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      paintBackground(context);
      context.strokeStyle = penColor;
      context.lineWidth = penSize;
      context.lineCap = "round";
      context.lineJoin = "round";

      if (typeof props.value === "string" && props.value.startsWith("data:")) {
        const image = new Image();
        image.onload = () => {
          context.drawImage(image, 0, 0, width, height);
          hasInk.value = !isSignatureValueEmpty(props.value);
        };
        image.src = props.value;
      } else {
        hasInk.value = false;
      }
    }

    onMounted(initCanvas);
    watch(() => [width, height], initCanvas);

    onUnmounted(() => {
      drawing.value = false;
    });

    function point(event: PointerEvent) {
      const canvas = canvasRef.value;
      if (!canvas) {
        return { x: 0, y: 0 };
      }
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * width,
        y: ((event.clientY - rect.top) / rect.height) * height,
      };
    }

    function endStroke() {
      if (!drawing.value) {
        return;
      }
      drawing.value = false;
      commit();
    }

    return () => (
      <div class={props.classNames.input} data-freeform-signature="">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            width: "100%",
            maxWidth: width,
            height,
            border: `1px solid ${borderColor}`,
            touchAction: "none",
            cursor: enabled ? "crosshair" : "not-allowed",
            display: "block",
            backgroundColor,
          }}
          aria-label={props.field.label}
          onPointerdown={(event: PointerEvent) => {
            if (!enabled) {
              return;
            }
            const canvas = canvasRef.value;
            const context = canvas?.getContext("2d");
            if (!context || !canvas) {
              return;
            }
            drawing.value = true;
            canvas.setPointerCapture(event.pointerId);
            context.strokeStyle = penColor;
            context.lineWidth = penSize;
            context.lineCap = "round";
            context.lineJoin = "round";
            const { x, y } = point(event);
            context.beginPath();
            context.moveTo(x, y);
          }}
          onPointermove={(event: PointerEvent) => {
            if (!drawing.value) {
              return;
            }
            const context = canvasRef.value?.getContext("2d");
            if (!context) {
              return;
            }
            const { x, y } = point(event);
            context.lineTo(x, y);
            context.stroke();
            hasInk.value = true;
          }}
          onPointerup={endStroke}
          onPointercancel={endStroke}
          onPointerleave={endStroke}
        />
        {config.showClearButton !== false ? (
          <button type="button" disabled={!hasInk.value || !enabled} onClick={clear}>
            Clear
          </button>
        ) : null}
      </div>
    );
  },
});
