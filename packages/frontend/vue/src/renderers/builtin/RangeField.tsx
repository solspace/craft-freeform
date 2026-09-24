// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function RangeFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const config = (props.field.frontend?.config ?? {}) as {
    min?: number;
    max?: number;
    step?: number;
  };
  const min = config.min ?? 0;
  const max = config.max ?? 100;
  const step = config.step ?? 1;
  const value = String(props.value ?? props.field.defaultValue ?? min);
  return (
    <div
      class={["ff-range", props.classNames.content].filter(Boolean).join(" ")}
      style={{ width: "100%", minWidth: 0 }}
    >
      <input
        {...input}
        type="range"
        class={[props.classNames.input, "ff-range-input"]
          .filter(Boolean)
          .join(" ")}
        style={{
          display: "block",
          width: "100%",
          height: "1.75rem",
          minHeight: 0,
          padding: 0,
          margin: 0,
          cursor: input.disabled ? "not-allowed" : "pointer",
          opacity: input.disabled ? 0.5 : undefined,
        }}
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={input.onChange}
      />
      <div
        class="ff-range-values"
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginTop: "0.25rem",
          fontSize: "0.875em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span aria-hidden="true" style={{ opacity: 0.7 }}>
          {min}
        </span>
        <output
          for={input.id}
          class="ff-range-value"
          aria-live="off"
          style={{
            display: "inline",
            padding: 0,
            margin: 0,
            fontWeight: 600,
            color: "inherit",
          }}
        >
          {value}
        </output>
        <span aria-hidden="true" style={{ opacity: 0.7 }}>
          {max}
        </span>
      </div>
    </div>
  );
}
