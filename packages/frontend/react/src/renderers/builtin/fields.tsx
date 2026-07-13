import type { ChangeEvent } from "react";
import type { ReactFieldRendererProps } from "../../types.js";

function inputProps(props: ReactFieldRendererProps) {
  const raw = props.input as {
    id?: string;
    name?: string;
    value?: string;
    onChange?: (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
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

export function TextFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <input type="text" className={props.classNames.input} {...input} />;
}

export function EmailFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <input type="email" className={props.classNames.input} {...input} />;
}

export function NumberFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <input type="number" className={props.classNames.input} {...input} />;
}

export function PhoneFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <input type="tel" className={props.classNames.input} {...input} />;
}

export function HiddenFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <input type="hidden" {...input} />;
}

export function TextareaFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  return <textarea className={props.classNames.input} rows={4} {...input} />;
}

export function SelectFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const value = String(input.value ?? "");

  return (
    <select className={props.classNames.input} {...input} value={value}>
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

export function CheckboxFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const checked =
    input.value === "1" || props.value === true || input.value === "true";

  return (
    <label className={props.classNames.input}>
      <input
        type="checkbox"
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

export function CheckboxesFieldRenderer(props: ReactFieldRendererProps) {
  const selected = Array.isArray(props.value)
    ? props.value.map(String)
    : props.value
      ? [String(props.value)]
      : [];

  return (
    <div className={props.classNames.input}>
      {(props.field.options ?? []).map((option) => (
        <label key={option.value}>
          <input
            type="checkbox"
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

export function RadioFieldRenderer(props: ReactFieldRendererProps) {
  const value = String(props.value ?? "");

  return (
    <div className={props.classNames.input}>
      {(props.field.options ?? []).map((option) => (
        <label key={option.value}>
          <input
            type="radio"
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

export function FileFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);

  return (
    <input
      type="file"
      className={props.classNames.input}
      id={input.id}
      name={input.name}
      disabled={input.disabled}
      aria-invalid={input["aria-invalid"]}
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

export function HtmlFieldRenderer(props: ReactFieldRendererProps) {
  if (props.allowRawHtml && props.field.content?.rendered?.html) {
    return (
      <div
        className={props.classNames.input}
        dangerouslySetInnerHTML={{ __html: props.field.content.rendered.html }}
      />
    );
  }

  return (
    <div className={props.classNames.input} role="note">
      {props.field.instructions ?? props.field.label}
    </div>
  );
}

export function UnsupportedFieldRenderer(props: ReactFieldRendererProps) {
  return (
    <div className={props.classNames.input} role="alert">
      Unsupported field type: {props.field.type}
    </div>
  );
}
