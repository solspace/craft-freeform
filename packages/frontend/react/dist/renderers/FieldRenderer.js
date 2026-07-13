"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { mergeClassNames } from "../theme/mergeClassNames.js";
import { builtinComponents } from "./builtin/index.js";
import { resolveFieldRenderer } from "./resolve.js";
export function FieldRenderer({ field, form, theme, renderers, allowRawHtml }) {
  const classNames = theme.classNames ?? {};
  const strategy = theme.classNameStrategy ?? "merge";
  const components = { ...builtinComponents, ...theme.renderers?.components };
  const Renderer = resolveFieldRenderer(field, renderers, theme);
  const errors = form.fieldErrors[field.handle] ?? [];
  const value = form.values[field.handle];
  const isCheckbox = field.type === "checkbox";
  const fieldClassName = mergeClassNames(
    strategy,
    classNames.field,
    [
      field.required ? classNames.fieldRequired : "",
      errors.length ? classNames.fieldHasErrors : "",
      !form.isFieldVisible(field.handle) ? classNames.fieldHidden : "",
    ]
      .filter(Boolean)
      .join(" "),
  );
  const renderLabel = () =>
    !isCheckbox && theme.defaults?.renderLabels !== false
      ? _jsx(components.Label, {
          field: field,
          className: classNames.label,
          requiredIndicator: theme.defaults?.requiredIndicator,
        })
      : null;
  const renderInstructions = () =>
    theme.defaults?.renderInstructions !== false
      ? _jsx(components.Instructions, {
          field: field,
          className: classNames.instructions,
        })
      : null;
  const renderErrors = () =>
    theme.defaults?.renderErrors !== false
      ? _jsx(components.Errors, {
          errors: errors,
          className: classNames.errors,
          errorClassName: classNames.error,
        })
      : null;
  if (field.type === "hidden") {
    return _jsx(components.FieldWrapper, {
      field: field,
      form: form,
      className: fieldClassName,
      children: _jsx(Renderer, {
        field: field,
        form: form,
        value: value,
        errors: errors,
        input: form.getFieldProps(field.handle),
        classNames: classNames,
        allowRawHtml: allowRawHtml,
        renderLabel: renderLabel,
        renderInstructions: renderInstructions,
        renderErrors: renderErrors,
      }),
    });
  }
  return _jsxs(components.FieldWrapper, {
    field: field,
    form: form,
    className: fieldClassName,
    children: [
      renderLabel(),
      renderInstructions(),
      _jsx(Renderer, {
        field: field,
        form: form,
        value: value,
        errors: errors,
        input: form.getFieldProps(field.handle),
        classNames: classNames,
        allowRawHtml: allowRawHtml,
        renderLabel: renderLabel,
        renderInstructions: renderInstructions,
        renderErrors: renderErrors,
      }),
      renderErrors(),
    ],
  });
}
