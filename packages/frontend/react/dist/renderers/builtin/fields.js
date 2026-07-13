import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";

function inputProps(props) {
  const raw = props.input;
  return {
    ...raw,
    placeholder: raw.placeholder ?? undefined,
  };
}
export function TextFieldRenderer(props) {
  const input = inputProps(props);
  return _jsx("input", {
    type: "text",
    className: props.classNames.input,
    ...input,
  });
}
export function EmailFieldRenderer(props) {
  const input = inputProps(props);
  return _jsx("input", {
    type: "email",
    className: props.classNames.input,
    ...input,
  });
}
export function NumberFieldRenderer(props) {
  const input = inputProps(props);
  return _jsx("input", {
    type: "number",
    className: props.classNames.input,
    ...input,
  });
}
export function PhoneFieldRenderer(props) {
  const input = inputProps(props);
  return _jsx("input", {
    type: "tel",
    className: props.classNames.input,
    ...input,
  });
}
export function HiddenFieldRenderer(props) {
  const input = inputProps(props);
  return _jsx("input", { type: "hidden", ...input });
}
export function TextareaFieldRenderer(props) {
  const input = inputProps(props);
  return _jsx("textarea", {
    className: props.classNames.input,
    rows: 4,
    ...input,
  });
}
export function SelectFieldRenderer(props) {
  const input = inputProps(props);
  const value = String(input.value ?? "");
  return _jsxs("select", {
    className: props.classNames.input,
    ...input,
    value: value,
    children: [
      props.field.placeholder
        ? _jsx("option", { value: "", children: props.field.placeholder })
        : null,
      (props.field.options ?? []).map((option) =>
        _jsx(
          "option",
          { value: option.value, children: option.label },
          option.value,
        ),
      ),
    ],
  });
}
export function CheckboxFieldRenderer(props) {
  const input = inputProps(props);
  const checked =
    input.value === "1" || props.value === true || input.value === "true";
  return _jsxs("label", {
    className: props.classNames.input,
    children: [
      _jsx("input", {
        type: "checkbox",
        id: input.id,
        name: input.name,
        checked: checked,
        disabled: input.disabled,
        "aria-invalid": input["aria-invalid"],
        onChange: (event) => {
          props.form.setValue(
            props.field.handle,
            event.target.checked ? "1" : "",
          );
        },
        onBlur: input.onBlur,
      }),
      _jsx("span", { children: props.field.label }),
    ],
  });
}
export function CheckboxesFieldRenderer(props) {
  const selected = Array.isArray(props.value)
    ? props.value.map(String)
    : props.value
      ? [String(props.value)]
      : [];
  return _jsx("div", {
    className: props.classNames.input,
    children: (props.field.options ?? []).map((option) =>
      _jsxs(
        "label",
        {
          children: [
            _jsx("input", {
              type: "checkbox",
              name: `${props.field.handle}[]`,
              value: option.value,
              checked: selected.includes(option.value),
              disabled: !props.form.isFieldEnabled(props.field.handle),
              onChange: (event) => {
                const next = new Set(selected);
                if (event.target.checked) {
                  next.add(option.value);
                } else {
                  next.delete(option.value);
                }
                props.form.setValue(props.field.handle, [...next]);
              },
            }),
            _jsx("span", { children: option.label }),
          ],
        },
        option.value,
      ),
    ),
  });
}
export function RadioFieldRenderer(props) {
  const value = String(props.value ?? "");
  return _jsx("div", {
    className: props.classNames.input,
    children: (props.field.options ?? []).map((option) =>
      _jsxs(
        "label",
        {
          children: [
            _jsx("input", {
              type: "radio",
              name: props.field.handle,
              value: option.value,
              checked: value === option.value,
              disabled: !props.form.isFieldEnabled(props.field.handle),
              onChange: () =>
                props.form.setValue(props.field.handle, option.value),
            }),
            _jsx("span", { children: option.label }),
          ],
        },
        option.value,
      ),
    ),
  });
}
export function FileFieldRenderer(props) {
  const input = inputProps(props);
  return _jsx("input", {
    type: "file",
    className: props.classNames.input,
    id: input.id,
    name: input.name,
    disabled: input.disabled,
    "aria-invalid": input["aria-invalid"],
    onChange: (event) => {
      const files = event.target.files;
      if (!files || files.length === 0) {
        props.form.setValue(props.field.handle, null);
        return;
      }
      props.form.setValue(
        props.field.handle,
        files.length === 1 ? files[0] : Array.from(files),
      );
    },
    onBlur: input.onBlur,
  });
}
export function HtmlFieldRenderer(props) {
  if (props.allowRawHtml && props.field.content?.rendered?.html) {
    return _jsx("div", {
      className: props.classNames.input,
      dangerouslySetInnerHTML: { __html: props.field.content.rendered.html },
    });
  }
  return _jsx("div", {
    className: props.classNames.input,
    role: "note",
    children: props.field.instructions ?? props.field.label,
  });
}
export function UnsupportedFieldRenderer(props) {
  return _jsxs("div", {
    className: props.classNames.input,
    role: "alert",
    children: ["Unsupported field type: ", props.field.type],
  });
}
