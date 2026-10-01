import type { ReactFieldRendererProps } from "../../types.js";

export function RatingFieldRenderer(props: ReactFieldRendererProps) {
  const value = String(props.value ?? "");
  const config = (props.field.frontend?.config ?? {}) as {
    colorIdle?: string;
    colorSelected?: string;
  };
  const idle = config.colorIdle || "#dddddd";
  const selected = config.colorSelected || "#ff7700";

  return (
    <div className={props.classNames.input} role="radiogroup">
      {(props.field.options ?? []).map((option) => {
        const active = Number(value) >= Number(option.value);
        return (
          <label
            key={option.value}
            className={props.classNames.optionLabel}
            style={{
              cursor: "pointer",
              color: active ? selected : idle,
              fontSize: "1.5rem",
              marginRight: "0.25rem",
            }}
          >
            <input
              type="radio"
              className={props.classNames.optionInput}
              name={props.field.handle}
              value={option.value}
              checked={value === option.value}
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
            <span className="ff-sr-only">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
