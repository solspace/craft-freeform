"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { builtinComponents } from "../renderers/builtin/index.js";
import { FieldRenderer } from "../renderers/FieldRenderer.js";
import { mergeClassNames } from "../theme/mergeClassNames.js";

function asRuntime(form) {
  return form;
}
export function FreeformView({ form, className }) {
  const runtime = asRuntime(form);
  const { manifest, theme, renderers, allowRawHtml } = form;
  const components = { ...builtinComponents, ...theme.renderers?.components };
  const strategy = theme.classNameStrategy ?? "merge";
  const formClassName = mergeClassNames(
    strategy,
    theme.classNames?.form,
    className,
  );
  const pages = manifest.layout.pages;
  const currentPage = pages[form.currentPageIndex] ??
    pages[0] ?? { rows: [], buttons: {} };
  const isLastPage =
    pages.length === 0 || form.currentPageIndex >= pages.length - 1;
  const isFirstPage = form.currentPageIndex === 0;
  if (form.isComplete && form.successMessage) {
    return _jsx(components.SuccessMessage, {
      message: form.successMessage,
      className: theme.classNames?.success,
    });
  }
  return _jsxs(components.Form, {
    form: runtime,
    className: formClassName,
    onSubmit: form.handleSubmit,
    children: [
      form.formErrors.length > 0
        ? _jsx(components.Errors, {
            errors: form.formErrors,
            className: theme.classNames?.errors,
            errorClassName: theme.classNames?.error,
          })
        : null,
      _jsx(components.Page, {
        form: runtime,
        pageIndex: form.currentPageIndex,
        className: theme.classNames?.page,
        children: currentPage.rows.map((row) =>
          _jsx(
            components.Row,
            {
              className: theme.classNames?.row,
              children: row.fields.map((handle) => {
                const field = manifest.fields[handle];
                if (!field) {
                  return null;
                }
                return _jsx(
                  FieldRenderer,
                  {
                    field: field,
                    form: runtime,
                    theme: theme,
                    renderers: renderers,
                    allowRawHtml: allowRawHtml,
                  },
                  field.uid,
                );
              }),
            },
            row.uid,
          ),
        ),
      }),
      _jsxs(components.ButtonRow, {
        className: theme.classNames?.buttons,
        children: [
          !isFirstPage && currentPage.buttons?.back
            ? _jsx(components.BackButton, {
                label: currentPage.buttons.back.label,
                className: theme.classNames?.backButton,
                disabled: form.isSubmitting,
                onClick: () => void form.goBack(),
              })
            : null,
          manifest.settings.multiPage &&
          !isLastPage &&
          currentPage.buttons?.submit
            ? _jsx(components.NextButton, {
                label: currentPage.buttons.submit.label,
                className: theme.classNames?.nextButton,
                disabled: form.isSubmitting,
                onClick: () => void form.goNext(),
              })
            : null,
          (!manifest.settings.multiPage || isLastPage) &&
          currentPage.buttons?.submit
            ? _jsx(components.SubmitButton, {
                label: currentPage.buttons.submit.label,
                className: theme.classNames?.submitButton,
                disabled: form.isSubmitting,
              })
            : null,
        ],
      }),
    ],
  });
}
