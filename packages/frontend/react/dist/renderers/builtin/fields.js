import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFieldExtension } from "../../hooks/useFieldExtension.js";
function inputProps(props) {
    const raw = props.input;
    return {
        ...raw,
        placeholder: raw.placeholder ?? undefined,
    };
}
export function TextFieldRenderer(props) {
    const input = inputProps(props);
    return _jsx("input", { type: "text", className: props.classNames.input, ...input });
}
export function WebsiteFieldRenderer(props) {
    const input = inputProps(props);
    return _jsx("input", { type: "url", className: props.classNames.input, ...input });
}
export function RegexFieldRenderer(props) {
    const input = inputProps(props);
    const pattern = props.field.validation?.pattern ||
        (props.field.frontend?.config?.pattern ??
            undefined);
    return (_jsx("input", { type: "text", className: props.classNames.input, pattern: pattern || undefined, ...input }));
}
export function PasswordFieldRenderer(props) {
    const input = inputProps(props);
    return (_jsx("input", { type: "password", className: props.classNames.input, ...input }));
}
export function ConfirmFieldRenderer(props) {
    const input = inputProps(props);
    const targetType = props.field.frontend?.config?.targetType;
    const type = targetType === "password" ? "password" : "text";
    return _jsx("input", { type: type, className: props.classNames.input, ...input });
}
export function EmailFieldRenderer(props) {
    const input = inputProps(props);
    return _jsx("input", { type: "email", className: props.classNames.input, ...input });
}
export function NumberFieldRenderer(props) {
    const input = inputProps(props);
    return _jsx("input", { type: "number", className: props.classNames.input, ...input });
}
export function PhoneFieldRenderer(props) {
    const input = inputProps(props);
    return _jsx("input", { type: "tel", className: props.classNames.input, ...input });
}
export function HiddenFieldRenderer(props) {
    const input = inputProps(props);
    return _jsx("input", { type: "hidden", ...input });
}
export function TextareaFieldRenderer(props) {
    const input = inputProps(props);
    return _jsx("textarea", { className: props.classNames.input, rows: 4, ...input });
}
export function SelectFieldRenderer(props) {
    const input = inputProps(props);
    const value = String(input.value ?? "");
    return (_jsxs("select", { className: props.classNames.input, ...input, value: value, children: [props.field.placeholder ? (_jsx("option", { value: "", children: props.field.placeholder })) : null, (props.field.options ?? []).map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }));
}
export function MultipleSelectFieldRenderer(props) {
    const input = inputProps(props);
    const selected = Array.isArray(props.value)
        ? props.value.map(String)
        : props.value
            ? [String(props.value)]
            : [];
    return (_jsx("select", { className: props.classNames.input, id: input.id, name: input.name, multiple: true, disabled: input.disabled, "aria-invalid": input["aria-invalid"], value: selected, onChange: (event) => {
            const next = Array.from(event.target.selectedOptions).map((option) => option.value);
            props.form.setValue(props.field.handle, next);
        }, onBlur: input.onBlur, children: (props.field.options ?? []).map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) }));
}
export function CheckboxFieldRenderer(props) {
    const input = inputProps(props);
    const checked = input.value === "1" || props.value === true || input.value === "true";
    return (_jsxs("label", { className: props.classNames.input, children: [_jsx("input", { type: "checkbox", id: input.id, name: input.name, checked: checked, disabled: input.disabled, "aria-invalid": input["aria-invalid"], onChange: (event) => {
                    props.form.setValue(props.field.handle, event.target.checked ? "1" : "");
                }, onBlur: input.onBlur }), _jsx("span", { children: props.field.label })] }));
}
export function CheckboxesFieldRenderer(props) {
    const selected = Array.isArray(props.value)
        ? props.value.map(String)
        : props.value
            ? [String(props.value)]
            : [];
    return (_jsx("div", { className: props.classNames.input, children: (props.field.options ?? []).map((option) => (_jsxs("label", { children: [_jsx("input", { type: "checkbox", name: `${props.field.handle}[]`, value: option.value, checked: selected.includes(option.value), disabled: !props.form.isFieldEnabled(props.field.handle), onChange: (event) => {
                        const next = new Set(selected);
                        if (event.target.checked) {
                            next.add(option.value);
                        }
                        else {
                            next.delete(option.value);
                        }
                        props.form.setValue(props.field.handle, [...next]);
                    } }), _jsx("span", { children: option.label })] }, option.value))) }));
}
export function RadioFieldRenderer(props) {
    const value = String(props.value ?? "");
    return (_jsx("div", { className: props.classNames.input, role: "radiogroup", children: (props.field.options ?? []).map((option) => (_jsxs("label", { children: [_jsx("input", { type: "radio", name: props.field.handle, value: option.value, checked: value === option.value, disabled: !props.form.isFieldEnabled(props.field.handle), onChange: () => props.form.setValue(props.field.handle, option.value) }), _jsx("span", { children: option.label })] }, option.value))) }));
}
export function OpinionScaleFieldRenderer(props) {
    const value = String(props.value ?? "");
    const legends = props.field.frontend?.config?.legends ?? [];
    return (_jsxs("div", { className: props.classNames.input, children: [_jsx("div", { role: "radiogroup", style: { display: "flex", gap: "0.75rem" }, children: (props.field.options ?? []).map((option) => (_jsxs("label", { style: {
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }, children: [_jsx("input", { type: "radio", name: props.field.handle, value: option.value, checked: value === option.value, disabled: !props.form.isFieldEnabled(props.field.handle), onChange: () => props.form.setValue(props.field.handle, option.value) }), _jsx("span", { children: option.label || option.value })] }, option.value))) }), legends.length > 0 ? (_jsx("div", { style: {
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "0.5rem",
                    fontSize: "0.875rem",
                }, children: legends.map((legend) => (_jsx("span", { children: legend }, legend))) })) : null] }));
}
export function RatingFieldRenderer(props) {
    const value = String(props.value ?? "");
    const config = (props.field.frontend?.config ?? {});
    const idle = config.colorIdle || "#dddddd";
    const selected = config.colorSelected || "#ff7700";
    return (_jsx("div", { className: props.classNames.input, role: "radiogroup", children: (props.field.options ?? []).map((option) => {
            const active = Number(value) >= Number(option.value);
            return (_jsxs("label", { style: {
                    cursor: "pointer",
                    color: active ? selected : idle,
                    fontSize: "1.5rem",
                    marginRight: "0.25rem",
                }, children: [_jsx("input", { type: "radio", name: props.field.handle, value: option.value, checked: value === option.value, disabled: !props.form.isFieldEnabled(props.field.handle), onChange: () => props.form.setValue(props.field.handle, option.value), style: {
                            position: "absolute",
                            opacity: 0,
                            pointerEvents: "none",
                        } }), _jsx("span", { "aria-hidden": "true", children: "\u2605" }), _jsx("span", { className: "ff-sr-only", children: option.label })] }, option.value));
        }) }));
}
export function CardsFieldRenderer(props) {
    const cards = (props.field.frontend?.config?.cards ??
        []) ||
        [];
    const maxSelected = Number(props.field.frontend?.config?.maxSelectedValues ?? 0);
    const selected = Array.isArray(props.value)
        ? props.value.map(String)
        : props.value
            ? [String(props.value)]
            : [];
    const singleSelect = maxSelected === 1;
    return (_jsx("div", { className: props.classNames.input, style: {
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: `repeat(${Math.min(Number(props.field.frontend?.config?.cardsPerRow ?? 3) || 3, 4)}, minmax(0, 1fr))`,
        }, children: cards.map((card) => {
            const checked = selected.includes(card.value);
            return (_jsxs("label", { style: {
                    border: checked ? "2px solid currentColor" : "1px solid #ccc",
                    borderRadius: "0.5rem",
                    padding: "0.75rem",
                    cursor: "pointer",
                }, children: [_jsx("input", { type: singleSelect ? "radio" : "checkbox", name: `${props.field.handle}${singleSelect ? "" : "[]"}`, value: card.value, checked: checked, disabled: !props.form.isFieldEnabled(props.field.handle), onChange: (event) => {
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
                            }
                            else {
                                next.delete(card.value);
                            }
                            props.form.setValue(props.field.handle, [...next]);
                        } }), card.imageUrl ? (_jsx("img", { src: card.imageUrl, alt: "", style: {
                            width: "100%",
                            height: "auto",
                            display: "block",
                            marginBottom: "0.5rem",
                        } })) : null, _jsx("strong", { children: card.label }), card.description ? _jsx("div", { children: card.description }) : null] }, card.value));
        }) }));
}
export function FileFieldRenderer(props) {
    const input = inputProps(props);
    const config = (props.field.frontend?.config ?? {});
    return (_jsx("input", { type: "file", className: props.classNames.input, id: input.id, name: input.name, disabled: input.disabled, "aria-invalid": input["aria-invalid"], accept: config.accept || undefined, multiple: Boolean(config.multiple ?? (config.maxFiles ?? 1) > 1), onChange: (event) => {
            const files = event.target.files;
            if (!files || files.length === 0) {
                props.form.setValue(props.field.handle, null);
                return;
            }
            props.form.setValue(props.field.handle, files.length === 1 ? files[0] : Array.from(files));
        }, onBlur: input.onBlur }));
}
export function FileDndFieldRenderer(props) {
    const hostRef = useFieldExtension(props.field, props.form);
    return (_jsx("div", { ref: hostRef, className: props.classNames.input, "data-freeform-file-dnd": props.field.handle }));
}
export function HtmlFieldRenderer(props) {
    const contentClass = props.classNames.content ?? props.classNames.input ?? "ff-field__content";
    const html = props.field.content?.rendered?.html?.trim();
    if (props.allowRawHtml && html) {
        return (_jsx("div", { className: contentClass, dangerouslySetInnerHTML: { __html: html } }));
    }
    // Empty rich-text / html with no renderable content — don't invent a second row.
    if (!props.field.instructions) {
        return null;
    }
    return (_jsx("div", { className: contentClass, role: "note", children: props.field.instructions }));
}
export function ImageFieldRenderer(props) {
    const contentClass = props.classNames.content ?? props.classNames.input ?? "ff-field__content";
    const config = (props.field.frontend?.config ?? {});
    const image = props.field.content?.image;
    const src = image?.src || config.src;
    const srcset = image?.srcset || config.srcset;
    const alt = image?.alt || config.alt || props.field.label || "";
    if (!src) {
        return null;
    }
    return (_jsx("img", { className: contentClass, src: src, srcSet: srcset || undefined, alt: alt }));
}
export function DatetimeFieldRenderer(props) {
    const input = inputProps(props);
    const config = (props.field.frontend?.config ?? {});
    const inputType = config.useNativeTypes
        ? config.nativeInputType || "datetime-local"
        : "text";
    const hostRef = useFieldExtension(props.field, props.form);
    return (_jsx("div", { ref: hostRef, "data-freeform-datetime": props.field.handle, children: _jsx("input", { type: inputType, className: props.classNames.input, "data-datepicker": "", "data-datepicker-enabled": config.useDatepicker ? "1" : "0", ...input }) }));
}
export function UnsupportedFieldRenderer(props) {
    return (_jsxs("div", { className: props.classNames.input, role: "alert", children: ["Unsupported field type: ", props.field.type] }));
}
