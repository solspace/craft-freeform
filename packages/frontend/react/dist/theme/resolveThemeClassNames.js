import { joinClassNames } from "./mergeClassNames.js";
const CHOICE_TYPES = new Set([
    "checkbox",
    "checkboxes",
    "radio",
    "radios",
    "radiobox",
    "rating",
    "opinion-scale",
    "cards",
]);
function overlay(base, extra) {
    if (!extra) {
        return base;
    }
    return { ...base, ...extra };
}
/**
 * Global classNames, then overlays for field type / frontend renderer / extension.
 * Error styles append `inputError` onto the control (`optionInput` for choice fields).
 */
export function resolveThemeClassNames(theme, field, hasErrors = false) {
    const byType = theme.classNamesByType;
    let classNames = overlay({}, theme.classNames);
    classNames = overlay(classNames, byType?.[field.type]);
    const renderer = field.frontend?.renderer;
    if (renderer) {
        classNames = overlay(classNames, byType?.[renderer]);
    }
    const extension = field.frontend?.extension;
    if (extension) {
        classNames = overlay(classNames, byType?.[extension]);
    }
    if (hasErrors && classNames.inputError) {
        if (CHOICE_TYPES.has(field.type)) {
            classNames = {
                ...classNames,
                optionInput: joinClassNames(classNames.optionInput, classNames.inputError),
            };
        }
        else {
            classNames = {
                ...classNames,
                input: joinClassNames(classNames.input, classNames.inputError),
            };
        }
    }
    return classNames;
}
