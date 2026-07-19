"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { mergeClassNames } from "../theme/mergeClassNames.js";
import { toBemModifier } from "../theme/toBemModifier.js";
import { builtinComponents } from "./builtin/index.js";
import { resolveFieldRenderer } from "./resolve.js";
export function FieldRenderer({ field, form, theme, renderers, allowRawHtml, }) {
    const classNames = theme.classNames ?? {};
    const strategy = theme.classNameStrategy ?? "merge";
    const components = { ...builtinComponents, ...theme.renderers?.components };
    const Renderer = resolveFieldRenderer(field, renderers, theme);
    const errors = form.fieldErrors[field.handle] ?? [];
    const value = form.values[field.handle];
    const isCheckbox = field.type === "checkbox";
    const isPresentational = field.type === "html" ||
        field.type === "rich-text" ||
        field.type === "image";
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
    const fieldClassName = mergeClassNames(strategy, classNames.field, [
        `ff-field--${toBemModifier(field.type)}`,
        `ff-field--${toBemModifier(field.handle)}`,
        field.required ? classNames.fieldRequired : "",
        errors.length ? classNames.fieldHasErrors : "",
        !form.isFieldVisible(field.handle) ? classNames.fieldHidden : "",
    ]
        .filter(Boolean)
        .join(" "));
    const renderLabel = () => !isCheckbox &&
        !isPresentational &&
        theme.defaults?.renderLabels !== false ? (_jsx(components.Label, { field: field, className: classNames.label, requiredIndicator: theme.defaults?.requiredIndicator })) : null;
    const renderInstructions = () => !isPresentational && theme.defaults?.renderInstructions !== false ? (_jsx(components.Instructions, { field: field, className: classNames.instructions })) : null;
    const renderErrors = () => theme.defaults?.renderErrors !== false ? (_jsx(components.Errors, { errors: errors, className: classNames.errors, errorClassName: classNames.error })) : null;
    if (field.type === "hidden") {
        return (_jsx(components.FieldWrapper, { field: field, form: form, className: fieldClassName, children: _jsx(Renderer, { field: field, form: form, value: value, errors: errors, input: form.getFieldProps(field.handle), classNames: classNames, allowRawHtml: allowRawHtml, renderLabel: renderLabel, renderInstructions: renderInstructions, renderErrors: renderErrors }) }));
    }
    if (field.type === "group") {
        return (_jsxs(components.FieldWrapper, { field: field, form: form, className: fieldClassName, children: [renderLabel(), renderInstructions(), _jsx("div", { className: classNames.input, "data-freeform-group": field.handle, children: (field.layout?.rows ?? []).map((row) => (_jsx(components.Row, { className: mergeClassNames(strategy, classNames.row, `ff-row--${row.fields.length}-fields`), children: row.fields.map((handle) => {
                            const child = form.manifest.fields[handle];
                            if (!child) {
                                return null;
                            }
                            return (_jsx(FieldRenderer, { field: child, form: form, theme: theme, renderers: renderers, allowRawHtml: allowRawHtml }, child.uid));
                        }) }, row.uid))) }), renderErrors()] }));
    }
    return (_jsxs(components.FieldWrapper, { field: field, form: form, className: fieldClassName, children: [renderLabel(), renderInstructions(), _jsx(Renderer, { field: field, form: form, value: value, errors: errors, input: form.getFieldProps(field.handle), classNames: classNames, allowRawHtml: allowRawHtml, renderLabel: renderLabel, renderInstructions: renderInstructions, renderErrors: renderErrors }), renderErrors()] }));
}
