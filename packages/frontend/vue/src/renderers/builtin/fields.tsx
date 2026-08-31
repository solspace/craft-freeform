
// @ts-nocheck
import ExtensionHost from "../../components/ExtensionHost.vue";
import type { VueFieldRendererProps } from "../../types.js";

function inputProps(props: VueFieldRendererProps) {
  const raw = props.input as {
    id?: string;
    name?: string;
    value?: string;
    onChange?: (
      event: Event,
    ) => void;
    onBlur?: () => void;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string | null;
    "aria-invalid"?: boolean;
  };

  return {
    ...raw,
    placeholder: raw.placeholder ?? undefined,
  };
}

export function TextFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  return <input type="text" class={props.classNames.input} {...input} />;
}

export function WebsiteFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  return <input type="url" class={props.classNames.input} {...input} />;
}

export function RegexFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const pattern =
    (props.field.validation?.pattern as string | undefined) ||
    ((props.field.frontend?.config?.pattern as string | undefined) ??
      undefined);

  return (
    <input
      type="text"
      class={props.classNames.input}
      pattern={pattern || undefined}
      {...input}
    />
  );
}

export function PasswordFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  return (
    <input type="password" class={props.classNames.input} {...input} />
  );
}

export function ConfirmFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const targetType = props.field.frontend?.config?.targetType as
    | string
    | undefined;
  const type = targetType === "password" ? "password" : "text";

  return <input type={type} class={props.classNames.input} {...input} />;
}

export function EmailFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  return <input type="email" class={props.classNames.input} {...input} />;
}

export function NumberFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  return <input type="number" class={props.classNames.input} {...input} />;
}

export function PhoneFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  return <input type="tel" class={props.classNames.input} {...input} />;
}

export function HiddenFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  return <input type="hidden" {...input} />;
}

export function TextareaFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  return <textarea class={props.classNames.input} rows={4} {...input} />;
}

export function SelectFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const value = String(input.value ?? "");

  return (
    <select class={props.classNames.input} {...input} value={value}>
      {props.field.placeholder ? (
        <option value="">{props.field.placeholder}</option>
      ) : null}
      {(props.field.options ?? []).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function MultipleSelectFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const selected = Array.isArray(props.value)
    ? props.value.map(String)
    : props.value
      ? [String(props.value)]
      : [];

  return (
    <select
      class={props.classNames.input}
      id={input.id}
      name={input.name}
      multiple
      disabled={input.disabled}
      aria-invalid={input["aria-invalid"]}
      value={selected}
      onChange={(event) => {
        const next = Array.from(event.target.selectedOptions).map(
          (option) => option.value,
        );
        props.form.setValue(props.field.handle, next);
      }}
      onBlur={input.onBlur}
    >
      {(props.field.options ?? []).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function CheckboxFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const checked =
    input.value === "1" || props.value === true || input.value === "true";

  return (
    <label class={props.classNames.optionLabel ?? props.classNames.input}>
      <input
        type="checkbox"
        class={props.classNames.optionInput}
        id={input.id}
        name={input.name}
        checked={checked}
        disabled={input.disabled}
        aria-invalid={input["aria-invalid"]}
        onChange={(event) => {
          props.form.setValue(
            props.field.handle,
            event.target.checked ? "1" : "",
          );
        }}
        onBlur={input.onBlur}
      />
      <span>{props.field.label}</span>
    </label>
  );
}

export function CheckboxesFieldRenderer(props: VueFieldRendererProps) {
  const selected = Array.isArray(props.value)
    ? props.value.map(String)
    : props.value
      ? [String(props.value)]
      : [];

  return (
    <div class={props.classNames.input}>
      {(props.field.options ?? []).map((option) => (
        <label key={option.value} class={props.classNames.optionLabel}>
          <input
            type="checkbox"
            class={props.classNames.optionInput}
            name={`${props.field.handle}[]`}
            value={option.value}
            checked={selected.includes(option.value)}
            disabled={!props.form.isFieldEnabled(props.field.handle)}
            onChange={(event) => {
              const next = new Set(selected);
              if (event.target.checked) {
                next.add(option.value);
              } else {
                next.delete(option.value);
              }
              props.form.setValue(props.field.handle, [...next]);
            }}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

export function RadioFieldRenderer(props: VueFieldRendererProps) {
  const value = String(props.value ?? "");

  return (
    <div class={props.classNames.input} role="radiogroup">
      {(props.field.options ?? []).map((option) => (
        <label key={option.value} class={props.classNames.optionLabel}>
          <input
            type="radio"
            class={props.classNames.optionInput}
            name={props.field.handle}
            value={option.value}
            checked={value === option.value}
            disabled={!props.form.isFieldEnabled(props.field.handle)}
            onChange={() =>
              props.form.setValue(props.field.handle, option.value)
            }
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

export function OpinionScaleFieldRenderer(props: VueFieldRendererProps) {
  const value = String(props.value ?? "");
  const legends = (props.field.frontend?.config?.legends as string[]) ?? [];

  return (
    <div class={props.classNames.input}>
      <div role="radiogroup" style={{ display: "flex", gap: "0.75rem" }}>
        {(props.field.options ?? []).map((option) => (
          <label
            key={option.value}
            class={props.classNames.optionLabel}
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
              class={props.classNames.optionInput}
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

export function RatingFieldRenderer(props: VueFieldRendererProps) {
  const value = String(props.value ?? "");
  const config = (props.field.frontend?.config ?? {}) as {
    colorIdle?: string;
    colorSelected?: string;
  };
  const idle = config.colorIdle || "#dddddd";
  const selected = config.colorSelected || "#ff7700";

  return (
    <div class={props.classNames.input} role="radiogroup">
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

export function FileFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const config = (props.field.frontend?.config ?? {}) as {
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
  };

  return (
    <input
      type="file"
      class={props.classNames.input}
      id={input.id}
      name={input.name}
      disabled={input.disabled}
      aria-invalid={input["aria-invalid"]}
      accept={config.accept || undefined}
      multiple={Boolean(config.multiple ?? (config.maxFiles ?? 1) > 1)}
      onChange={(event) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
          props.form.setValue(props.field.handle, null);
          return;
        }

        props.form.setValue(
          props.field.handle,
          files.length === 1 ? files[0] : Array.from(files),
        );
      }}
      onBlur={input.onBlur}
    />
  );
}

export function FileDndFieldRenderer(props: VueFieldRendererProps) {
  return (
    <ExtensionHost
      field={props.field}
      form={props.form}
      class={props.classNames.input}
      dataAttr="data-freeform-file-dnd"
    />
  );
}

export function StripePaymentFieldRenderer(props: VueFieldRendererProps) {
  return (
    <ExtensionHost
      field={props.field}
      form={props.form}
      class={props.classNames.input}
      dataAttr="data-freeform-stripe"
    />
  );
}

export function SquarePaymentFieldRenderer(props: VueFieldRendererProps) {
  return (
    <ExtensionHost
      field={props.field}
      form={props.form}
      class={props.classNames.input}
      dataAttr="data-freeform-square"
    />
  );
}

export function PayPalPaymentFieldRenderer(props: VueFieldRendererProps) {
  return (
    <ExtensionHost
      field={props.field}
      form={props.form}
      class={props.classNames.input}
      dataAttr="data-freeform-paypal"
    />
  );
}

export function MolliePaymentFieldRenderer(props: VueFieldRendererProps) {
  return (
    <ExtensionHost
      field={props.field}
      form={props.form}
      class={props.classNames.input}
      dataAttr="data-freeform-mollie"
      hidden
    />
  );
}

export function HtmlFieldRenderer(props: VueFieldRendererProps) {
  const contentClass =
    props.classNames.content ?? props.classNames.input ?? "ff-field__content";
  const html = props.field.content?.rendered?.html?.trim();

  if (props.allowRawHtml && html) {
    return (
      <div
        class={contentClass}
        innerHTML={html}
      />
    );
  }

  // Empty rich-text / html with no renderable content — don't invent a second row.
  if (!props.field.instructions) {
    return null;
  }

  return (
    <div class={contentClass} role="note">
      {props.field.instructions}
    </div>
  );
}

export function ImageFieldRenderer(props: VueFieldRendererProps) {
  const contentClass =
    props.classNames.content ?? props.classNames.input ?? "ff-field__content";
  const config = (props.field.frontend?.config ?? {}) as {
    src?: string | null;
    srcset?: string | null;
    alt?: string | null;
  };
  const image = (
    props.field.content as
      | {
          image?: {
            src?: string | null;
            srcset?: string | null;
            alt?: string | null;
          };
        }
      | undefined
  )?.image;
  const src = image?.src || config.src;
  const srcset = image?.srcset || config.srcset;
  const alt = image?.alt || config.alt || props.field.label || "";

  if (!src) {
    return null;
  }

  return (
    <img
      class={contentClass}
      src={src}
      srcset={srcset || undefined}
      alt={alt}
    />
  );
}

export function DatetimeFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const config = (props.field.frontend?.config ?? {}) as {
    useNativeTypes?: boolean;
    nativeInputType?: string;
    useDatepicker?: boolean;
  };
  const inputType = config.useNativeTypes
    ? config.nativeInputType || "datetime-local"
    : "text";

  return (
    <ExtensionHost
      field={props.field}
      form={props.form}
      dataAttr="data-freeform-datetime"
    >
      <input
        type={inputType}
        class={props.classNames.input}
        data-datepicker=""
        data-datepicker-enabled={config.useDatepicker ? "1" : "0"}
        {...input}
      />
    </ExtensionHost>
  );
}

export function UnsupportedFieldRenderer(props: VueFieldRendererProps) {
  return (
    <div class={props.classNames.input} role="alert">
      Unsupported field type: {props.field.type}
    </div>
  );
}
