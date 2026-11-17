// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function RatingFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const value = String(props.value ?? "");
  const config = (props.field.frontend?.config ?? {}) as {
    colorIdle?: string;
    colorSelected?: string;
  };
  const idle = config.colorIdle || "#dddddd";
  const selected = config.colorSelected || "#ff7700";

  return (
    <div class={props.classNames.input}>
      {(props.field.options ?? []).map((option) => {
        const active = Number(value) >= Number(option.value);
        return (
          <label
            key={option.value}
            class={props.classNames.optionLabel}
            style={{
              cursor: "pointer",
              color: active ? selected : idle,
              fontSize: "1.5rem",
              marginRight: "0.25rem",
            }}
          >
            <input
              type="radio"
              class={props.classNames.optionInput}
              name={props.field.handle}
              value={option.value}
              checked={value === option.value}
              aria-invalid={input["aria-invalid"]}
              aria-describedby={input["aria-describedby"]}
              required={props.field.required}
              disabled={!props.form.isFieldEnabled(props.field.handle)}
              onChange={() =>
                props.form.setValue(props.field.handle, option.value)
              }
              style={{
                position: "absolute",
                opacity: 0,
                pointerEvents: "none",
              }}
            />
            <span aria-hidden="true">★</span>
            <span class="ff-sr-only">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
