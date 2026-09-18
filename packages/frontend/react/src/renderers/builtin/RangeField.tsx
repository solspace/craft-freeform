import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function RangeFieldRenderer(props: ReactFieldRendererProps) {
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
    <div className="ff-range">
      <input
        {...input}
        type="range"
        className={[props.classNames.input, "ff-range-input"]
          .filter(Boolean)
          .join(" ")}
        min={min}
        max={max}
        step={step}
        value={value}
      />
      <div className="ff-range-values">
        <span aria-hidden="true">{min}</span>
        <output htmlFor={input.id} className="ff-range-value" aria-live="off">
          {value}
        </output>
        <span aria-hidden="true">{max}</span>
      </div>
    </div>
  );
}
