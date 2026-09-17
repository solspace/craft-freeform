import type { ReactFieldRendererProps } from "../../types.js";

export function OpinionScaleFieldRenderer(props: ReactFieldRendererProps) {
  const value = String(props.value ?? "");
  const legends = (props.field.frontend?.config?.legends as string[]) ?? [];

  return (
    <div className={props.classNames.input}>
      <div role="radiogroup" style={{ display: "flex", gap: "0.75rem" }}>
        {(props.field.options ?? []).map((option) => (
          <label
            key={option.value}
            className={props.classNames.optionLabel}
            style={
              props.classNames.optionLabel
                ? undefined
                : {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }
            }
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
            />
            <span>{option.label || option.value}</span>
          </label>
        ))}
      </div>
      {legends.length > 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          {legends.map((legend) => (
            <span key={legend}>{legend}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
