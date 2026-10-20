import type { ReactFieldRendererProps } from "../../types.js";

export function OpinionScaleFieldRenderer(props: ReactFieldRendererProps) {
  const value = String(props.value ?? "");
  const legends = (props.field.frontend?.config?.legends as string[]) ?? [];

  const useFallbackLayout = !props.classNames.optionLabel;

  return (
    <div>
      <div
        role="radiogroup"
        className={props.classNames.input}
        style={
          useFallbackLayout
            ? {
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                width: "100%",
              }
            : undefined
        }
      >
        {(props.field.options ?? []).map((option) => (
          <label
            key={option.value}
            className={props.classNames.optionLabel}
            style={
              useFallbackLayout
                ? {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "1 1 0%",
                    minWidth: "2.75rem",
                  }
                : undefined
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
            marginTop: "0.25rem",
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
