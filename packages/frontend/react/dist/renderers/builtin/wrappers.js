import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CalculationFieldRenderer } from "./CalculationField.js";
import { CardsFieldRenderer, CheckboxesFieldRenderer, CheckboxFieldRenderer, ConfirmFieldRenderer, DatetimeFieldRenderer, EmailFieldRenderer, FileDndFieldRenderer, FileFieldRenderer, HiddenFieldRenderer, HtmlFieldRenderer, ImageFieldRenderer, MultipleSelectFieldRenderer, NumberFieldRenderer, OpinionScaleFieldRenderer, PasswordFieldRenderer, PhoneFieldRenderer, RadioFieldRenderer, RatingFieldRenderer, RegexFieldRenderer, SelectFieldRenderer, SignatureFieldRenderer, TableFieldRenderer, TextareaFieldRenderer, TextFieldRenderer, UnsupportedFieldRenderer, WebsiteFieldRenderer, } from "./fields.js";
export function DefaultForm({ className, children, onSubmit, }) {
    return (_jsx("form", { className: className, onSubmit: onSubmit, noValidate: true, children: children }));
}
export function DefaultPage({ className, children }) {
    return _jsx("div", { className: className, children: children });
}
export function DefaultRow({ className, children }) {
    return _jsx("div", { className: className, children: children });
}
export function DefaultFieldWrapper({ field, form, className, children, }) {
    if (!form.isFieldVisible(field.handle) && field.type !== "hidden") {
        return null;
    }
    return (_jsx("div", { className: className, "data-freeform-field": field.handle, "data-field-container": field.handle, "data-field-type": field.type, hidden: !form.isFieldVisible(field.handle), children: children }));
}
export function DefaultLabel({ field, className, requiredIndicator = "*", }) {
    if (!field.label) {
        return null;
    }
    return (_jsxs("label", { className: className, htmlFor: `freeform-${field.handle}`, children: [field.label, field.required ? (_jsxs("span", { "aria-hidden": "true", children: [" ", requiredIndicator] })) : null] }));
}
export function DefaultInstructions({ field, className, }) {
    if (!field.instructions) {
        return null;
    }
    return _jsx("div", { className: className, children: field.instructions });
}
export function DefaultErrors({ errors, className, errorClassName, }) {
    if (!errors.length) {
        return null;
    }
    return (_jsx("div", { className: className, role: "alert", children: errors.map((error) => (_jsx("div", { className: errorClassName, children: error }, error))) }));
}
export function DefaultButtonRow({ className, children, }) {
    return _jsx("div", { className: className, children: children });
}
export function DefaultSubmitButton({ label, className, disabled, type = "submit", onClick, }) {
    return (_jsx("button", { type: type, className: className, disabled: disabled, onClick: onClick, children: label }));
}
export function DefaultNextButton(props) {
    return _jsx(DefaultSubmitButton, { ...props, type: "button" });
}
export function DefaultBackButton(props) {
    return _jsx(DefaultSubmitButton, { ...props, type: "button" });
}
export function DefaultSaveButton(props) {
    return _jsx(DefaultSubmitButton, { ...props, type: "button" });
}
export function DefaultSuccessMessage({ message, className, }) {
    return (_jsx("div", { className: className, role: "status", children: message }));
}
export const builtinRenderers = {
    frontend: {
        text: TextFieldRenderer,
        textarea: TextareaFieldRenderer,
        email: EmailFieldRenderer,
        number: NumberFieldRenderer,
        phone: PhoneFieldRenderer,
        website: WebsiteFieldRenderer,
        regex: RegexFieldRenderer,
        password: PasswordFieldRenderer,
        confirm: ConfirmFieldRenderer,
        hidden: HiddenFieldRenderer,
        dropdown: SelectFieldRenderer,
        select: SelectFieldRenderer,
        "multiple-select": MultipleSelectFieldRenderer,
        checkbox: CheckboxFieldRenderer,
        checkboxes: CheckboxesFieldRenderer,
        radios: RadioFieldRenderer,
        radio: RadioFieldRenderer,
        "opinion-scale": OpinionScaleFieldRenderer,
        rating: RatingFieldRenderer,
        cards: CardsFieldRenderer,
        datetime: DatetimeFieldRenderer,
        file: FileFieldRenderer,
        "file-upload": FileFieldRenderer,
        "file-dnd": FileDndFieldRenderer,
        html: HtmlFieldRenderer,
        "rich-text": HtmlFieldRenderer,
        image: ImageFieldRenderer,
        table: TableFieldRenderer,
        signature: SignatureFieldRenderer,
        calculation: CalculationFieldRenderer,
    },
    types: {
        text: TextFieldRenderer,
        textarea: TextareaFieldRenderer,
        email: EmailFieldRenderer,
        number: NumberFieldRenderer,
        phone: PhoneFieldRenderer,
        website: WebsiteFieldRenderer,
        regex: RegexFieldRenderer,
        password: PasswordFieldRenderer,
        confirm: ConfirmFieldRenderer,
        hidden: HiddenFieldRenderer,
        select: SelectFieldRenderer,
        dropdown: SelectFieldRenderer,
        "multiple-select": MultipleSelectFieldRenderer,
        checkbox: CheckboxFieldRenderer,
        checkboxes: CheckboxesFieldRenderer,
        radio: RadioFieldRenderer,
        radios: RadioFieldRenderer,
        radiobox: RadioFieldRenderer,
        "opinion-scale": OpinionScaleFieldRenderer,
        rating: RatingFieldRenderer,
        cards: CardsFieldRenderer,
        datetime: DatetimeFieldRenderer,
        file: FileFieldRenderer,
        "file-upload": FileFieldRenderer,
        "file-dnd": FileDndFieldRenderer,
        html: HtmlFieldRenderer,
        "rich-text": HtmlFieldRenderer,
        image: ImageFieldRenderer,
        table: TableFieldRenderer,
        signature: SignatureFieldRenderer,
        calculation: CalculationFieldRenderer,
        _unsupported: UnsupportedFieldRenderer,
    },
};
export const builtinComponents = {
    Form: DefaultForm,
    Page: DefaultPage,
    Row: DefaultRow,
    FieldWrapper: DefaultFieldWrapper,
    Label: DefaultLabel,
    Instructions: DefaultInstructions,
    Errors: DefaultErrors,
    ButtonRow: DefaultButtonRow,
    SubmitButton: DefaultSubmitButton,
    NextButton: DefaultNextButton,
    BackButton: DefaultBackButton,
    SaveButton: DefaultSaveButton,
    SuccessMessage: DefaultSuccessMessage,
    UnsupportedField: UnsupportedFieldRenderer,
};
