"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { joinClassNames } from "../theme/mergeClassNames.js";
import { resolveThemeClassNames } from "../theme/resolveThemeClassNames.js";
import { toBemModifier } from "../theme/toBemModifier.js";
import { builtinComponents } from "./builtin/index.js";
import { resolveFieldRenderer } from "./resolve.js";
export function FieldRenderer({ field, form, theme, renderers, allowRawHtml, }) {
    const strategy = theme.classNameStrategy ?? "merge";
    const errors = form.fieldErrors[field.handle] ?? [];
    const classNames = resolveThemeClassNames(theme, field, errors.length > 0);
    const components = { ...builtinComponents, ...theme.renderers?.components };
    const Renderer = resolveFieldRenderer(field, renderers, theme);
    const value = form.values[field.handle];
    const isCheckbox = field.type === "checkbox";
    const isPresentational = field.type === "html" ||
        field.type === "rich-text" ||
        field.type === "image";
    const isVisuallyHidden = field.type === "hidden" ||
        field.type === "mollie" ||
        field.frontend?.renderer === "payment.mollie" ||
        field.frontend?.extension === "payment.mollie";
    // Skip empty presentational fields so they don't leave blank bordered rows.
    if (isPresentational) {
        if (field.type === "image") {
            const config = (field.frontend?.config ?? {});
            const image = field.content?.image;
            if (!(image?.src || config.src)) {
                return null;
            }
        }
        else {
            const html = field.content?.rendered?.html?.trim();
            if (!(allowRawHtml && html) && !field.instructions) {
                return null;
            }
        }
    }
    const fieldClassName = joinClassNames(classNames.field, field.required ? classNames.fieldRequired : undefined, errors.length ? classNames.fieldHasErrors : undefined, !form.isFieldVisible(field.handle) || isVisuallyHidden
        ? classNames.fieldHidden
        : undefined, strategy === "merge" ? `ff-field--${toBemModifier(field.type)}` : undefined, strategy === "merge"
        ? `ff-field--${toBemModifier(field.handle)}`
        : undefined);
    const renderLabel = () => !isCheckbox &&
        !isPresentational &&
        !isVisuallyHidden &&
        theme.defaults?.renderLabels !== false ? (_jsx(components.Label, { field: field, className: classNames.label, requiredIndicator: theme.defaults?.requiredIndicator })) : null;
    const renderInstructions = () => !isPresentational &&
        !isVisuallyHidden &&
        theme.defaults?.renderInstructions !== false ? (_jsx(components.Instructions, { field: field, className: classNames.instructions })) : null;
    const renderErrors = () => theme.defaults?.renderErrors !== false ? (_jsx(components.Errors, { errors: errors, className: classNames.errors, errorClassName: classNames.error })) : null;
    if (isVisuallyHidden) {
        return (_jsx(components.FieldWrapper, { field: field, form: form, className: fieldClassName, children: _jsx(Renderer, { field: field, form: form, value: value, errors: errors, input: form.getFieldProps(field.handle), classNames: classNames, allowRawHtml: allowRawHtml, renderLabel: renderLabel, renderInstructions: renderInstructions, renderErrors: renderErrors }) }));
    }
    if (field.type === "group") {
        return (_jsxs(components.FieldWrapper, { field: field, form: form, className: fieldClassName, children: [renderLabel(), renderInstructions(), _jsx("div", { className: classNames.input, "data-freeform-group": field.handle, children: (field.layout?.rows ?? []).map((row) => (_jsx(components.Row, { className: joinClassNames(classNames.row, strategy === "merge"
                            ? `ff-row--${row.fields.length}-fields`
                            : undefined), children: row.fields.map((handle) => {
                            const child = form.manifest.fields[handle];
                            if (!child) {
                                return null;
                            }
                            return (_jsx(FieldRenderer, { field: child, form: form, theme: theme, renderers: renderers, allowRawHtml: allowRawHtml }, child.uid));
                        }) }, row.uid))) }), renderErrors()] }));
    }
    return (_jsxs(components.FieldWrapper, { field: field, form: form, className: fieldClassName, children: [renderLabel(), renderInstructions(), _jsx(Renderer, { field: field, form: form, value: value, errors: errors, input: form.getFieldProps(field.handle), classNames: classNames, allowRawHtml: allowRawHtml, renderLabel: renderLabel, renderInstructions: renderInstructions, renderErrors: renderErrors }), renderErrors()] }));
}
