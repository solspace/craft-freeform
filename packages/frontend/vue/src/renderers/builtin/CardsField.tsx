// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";

export function CardsFieldRenderer(props: VueFieldRendererProps) {
  const cards =
    ((props.field.frontend?.config?.cards as Array<{
      label: string;
      value: string;
      description?: string;
      imageUrl?: string | null;
    }>) ??
      []) ||
    [];
  const maxSelected = Number(
    props.field.frontend?.config?.maxSelectedValues ?? 0,
  );
  const selected = Array.isArray(props.value)
    ? props.value.map(String)
    : props.value
      ? [String(props.value)]
      : [];
  const singleSelect = maxSelected === 1;

  return (
    <div
      class={props.classNames.input}
      style={{
        display: "grid",
        gap: "0.75rem",
        gridTemplateColumns: `repeat(${Math.min(
          Number(props.field.frontend?.config?.cardsPerRow ?? 3) || 3,
          4,
        )}, minmax(0, 1fr))`,
      }}
    >
      {cards.map((card) => {
        const checked = selected.includes(card.value);
        return (
          <label
            key={card.value}
            class={props.classNames.optionLabel}
            style={
              props.classNames.optionLabel
                ? undefined
                : {
                    border: checked
                      ? "2px solid currentColor"
                      : "1px solid #ccc",
                    borderRadius: "0.5rem",
                    padding: "0.75rem",
                    cursor: "pointer",
                  }
            }
          >
            <input
              type={singleSelect ? "radio" : "checkbox"}
              class={props.classNames.optionInput}
              name={`${props.field.handle}${singleSelect ? "" : "[]"}`}
              value={card.value}
              checked={checked}
              disabled={!props.form.isFieldEnabled(props.field.handle)}
              onChange={(event) => {
                if (singleSelect) {
                  props.form.setValue(props.field.handle, [card.value]);
                  return;
                }

                const next = new Set(selected);
                if (event.target.checked) {
                  if (maxSelected > 0 && next.size >= maxSelected) {
                    return;
                  }
                  next.add(card.value);
                } else {
                  next.delete(card.value);
                }
                props.form.setValue(props.field.handle, [...next]);
              }}
            />
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt=""
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              />
            ) : null}
            <strong>{card.label}</strong>
            {card.description ? <div>{card.description}</div> : null}
          </label>
        );
      })}
    </div>
  );
}
