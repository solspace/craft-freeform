"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { builtinComponents } from "../renderers/builtin/index.js";
import { FieldRenderer } from "../renderers/FieldRenderer.js";
import { mergeClassNames } from "../theme/mergeClassNames.js";
import { toBemModifier } from "../theme/toBemModifier.js";
import { CaptchaHost } from "./CaptchaHost.js";
function asRuntime(form) {
    return form;
}
function hasPresentationalContent(field, allowRawHtml) {
    if (field.type === "image") {
        const config = (field.frontend?.config ?? {});
        const image = field.content?.image;
        return Boolean(image?.src || config.src);
    }
    if (field.type === "html" || field.type === "rich-text") {
        const html = field.content?.rendered?.html?.trim();
        return Boolean((allowRawHtml && html) || field.instructions);
    }
    return true;
}
export function FreeformView({ form, className }) {
    const runtime = asRuntime(form);
    const { manifest, theme, renderers, allowRawHtml } = form;
    const components = { ...builtinComponents, ...theme.renderers?.components };
    const strategy = theme.classNameStrategy ?? "merge";
    const colorScheme = theme.defaults?.colorScheme ?? "system";
    const colorSchemeClass = colorScheme === "light" || colorScheme === "dark"
        ? `ff-form--${colorScheme}`
        : undefined;
    const formHandleClass = `ff-form--${toBemModifier(manifest.form.handle)}`;
    const formClassName = mergeClassNames(strategy, mergeClassNames(strategy, mergeClassNames(strategy, theme.classNames?.form, formHandleClass), colorSchemeClass), className);
    const pages = manifest.layout.pages;
    const currentPage = pages[form.currentPageIndex] ??
        pages[0] ?? { rows: [], buttons: {} };
    const isLastPage = pages.length === 0 || form.currentPageIndex >= pages.length - 1;
    const isFirstPage = form.currentPageIndex === 0;
    if (form.isComplete && form.successMessage) {
        return (_jsx(components.SuccessMessage, { message: form.successMessage, className: theme.classNames?.success }));
    }
    return (_jsxs(components.Form, { form: runtime, className: formClassName, onSubmit: form.handleSubmit, children: [form.formErrors.length > 0 ? (_jsx(components.Errors, { errors: form.formErrors, className: theme.classNames?.errors, errorClassName: theme.classNames?.error })) : null, _jsx(components.Page, { form: runtime, pageIndex: form.currentPageIndex, className: mergeClassNames(strategy, theme.classNames?.page, `ff-page--${form.currentPageIndex}`), children: currentPage.rows.map((row) => {
                    const visibleHandles = row.fields.filter((handle) => {
                        const field = manifest.fields[handle];
                        return field
                            ? hasPresentationalContent(field, allowRawHtml)
                            : false;
                    });
                    if (visibleHandles.length === 0) {
                        return null;
                    }
                    return (_jsx(components.Row, { className: mergeClassNames(strategy, theme.classNames?.row, `ff-row--${visibleHandles.length}-fields`), children: visibleHandles.map((handle) => {
                            const field = manifest.fields[handle];
                            if (!field) {
                                return null;
                            }
                            return (_jsx(FieldRenderer, { field: field, form: runtime, theme: theme, renderers: renderers, allowRawHtml: allowRawHtml }, field.uid));
                        }) }, row.uid));
                }) }), (manifest.security.captchas ?? []).map((captcha) => (_jsx(CaptchaHost, { form: runtime, captcha: captcha }, captcha.name))), _jsxs(components.ButtonRow, { className: theme.classNames?.buttons, children: [!isFirstPage && currentPage.buttons?.back ? (_jsx(components.BackButton, { label: currentPage.buttons.back.label, className: theme.classNames?.backButton, disabled: form.isSubmitting, onClick: () => void form.goBack() })) : null, manifest.settings.multiPage &&
                        !isLastPage &&
                        currentPage.buttons?.submit ? (_jsx(components.NextButton, { label: currentPage.buttons.submit.label, className: theme.classNames?.nextButton, disabled: form.isSubmitting, onClick: () => void form.goNext() })) : null, (!manifest.settings.multiPage || isLastPage) &&
                        currentPage.buttons?.submit ? (_jsx(components.SubmitButton, { label: currentPage.buttons.submit.label, className: theme.classNames?.submitButton, disabled: form.isSubmitting })) : null, currentPage.buttons?.save ? (_jsx(components.SaveButton, { label: currentPage.buttons.save.label, className: theme.classNames?.saveButton, disabled: form.isSubmitting, onClick: () => void form.saveDraft() })) : null] })] }));
}
