import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState, } from "react";
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
function emptyTableRow(columns) {
    return columns.map((column) => {
        if (column.type === "checkbox") {
            return column.checked ? "1" : "";
        }
        if (column.type === "file") {
            return [];
        }
        return column.value ?? "";
    });
}
export function TableFieldRenderer(props) {
    const config = (props.field.frontend?.config ?? {});
    const columns = config.columns ?? [];
    const rows = Array.isArray(props.value)
        ? props.value
        : [emptyTableRow(columns)];
    const setRows = (next) => {
        props.form.setValue(props.field.handle, next);
    };
    const canAdd = !config.maxRows || rows.length < config.maxRows;
    return (_jsxs("div", { className: props.classNames.input, children: [_jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [_jsx("thead", { children: _jsxs("tr", { children: [columns.map((column) => (_jsx("th", { style: { textAlign: "left" }, children: column.label }, column.label))), _jsx("th", {})] }) }), _jsx("tbody", { children: rows.map((row, rowIndex) => (_jsxs("tr", { children: [columns.map((column, colIndex) => {
                                    const cellValue = row[colIndex];
                                    const optionList = (column.options ?? []).map((option) => typeof option === "string"
                                        ? { label: option, value: option }
                                        : option);
                                    if (column.type === "checkbox") {
                                        return (_jsx("td", { children: _jsx("input", { type: "checkbox", checked: Boolean(cellValue), disabled: !props.form.isFieldEnabled(props.field.handle), onChange: (event) => {
                                                    const next = rows.map((item) => [...item]);
                                                    next[rowIndex][colIndex] = event.target.checked
                                                        ? "1"
                                                        : "";
                                                    setRows(next);
                                                } }) }, column.label));
                                    }
                                    if (column.type === "select") {
                                        return (_jsx("td", { children: _jsxs("select", { value: String(cellValue ?? ""), disabled: !props.form.isFieldEnabled(props.field.handle), onChange: (event) => {
                                                    const next = rows.map((item) => [...item]);
                                                    next[rowIndex][colIndex] = event.target.value;
                                                    setRows(next);
                                                }, children: [_jsx("option", { value: "", children: column.placeholder || "Select…" }), optionList.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }) }, column.label));
                                    }
                                    if (column.type === "textarea") {
                                        return (_jsx("td", { children: _jsx("textarea", { value: String(cellValue ?? ""), placeholder: column.placeholder, disabled: !props.form.isFieldEnabled(props.field.handle), onChange: (event) => {
                                                    const next = rows.map((item) => [...item]);
                                                    next[rowIndex][colIndex] = event.target.value;
                                                    setRows(next);
                                                } }) }, column.label));
                                    }
                                    return (_jsx("td", { children: _jsx("input", { type: column.type === "radio" ? "text" : "text", value: String(cellValue ?? ""), placeholder: column.placeholder, disabled: !props.form.isFieldEnabled(props.field.handle), onChange: (event) => {
                                                const next = rows.map((item) => [...item]);
                                                next[rowIndex][colIndex] = event.target.value;
                                                setRows(next);
                                            } }) }, column.label));
                                }), _jsx("td", { children: _jsx("button", { type: "button", disabled: !props.form.isFieldEnabled(props.field.handle) ||
                                            rows.length <= (config.minRows ?? 1), onClick: () => {
                                            setRows(rows.filter((_, index) => index !== rowIndex));
                                        }, children: config.removeButtonLabel || "Remove" }) })] }, `row-${rowIndex}`))) })] }), _jsx("button", { type: "button", disabled: !props.form.isFieldEnabled(props.field.handle) || !canAdd, onClick: () => setRows([...rows, emptyTableRow(columns)]), children: config.addButtonLabel || "Add row" })] }));
}
export function SignatureFieldRenderer(props) {
    const canvasRef = useRef(null);
    const drawing = useRef(false);
    const [hasInk, setHasInk] = useState(Boolean(props.value));
    const config = (props.field.frontend?.config ?? {});
    const width = config.width ?? 400;
    const height = config.height ?? 100;
    const commit = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        props.form.setValue(props.field.handle, canvas.toDataURL("image/png"));
    }, [props.field.handle, props.form]);
    // biome-ignore lint/correctness/useExhaustiveDependencies: Initialize on mount/size only. Including props.value would clear strokes whenever commit() updates the form value mid-draw.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const context = canvas.getContext("2d");
        if (!context) {
            return;
        }
        context.fillStyle = config.backgroundColor || "rgba(0,0,0,0)";
        context.fillRect(0, 0, width, height);
        context.strokeStyle = config.penColor || "#000000";
        context.lineWidth = config.penDotSize ?? 2.5;
        context.lineCap = "round";
        context.lineJoin = "round";
        if (typeof props.value === "string" && props.value.startsWith("data:")) {
            const image = new Image();
            image.onload = () => {
                context.drawImage(image, 0, 0);
                setHasInk(true);
            };
            image.src = props.value;
        }
    }, [width, height]);
    const point = (event) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return { x: 0, y: 0 };
        }
        const rect = canvas.getBoundingClientRect();
        return {
            x: ((event.clientX - rect.left) / rect.width) * width,
            y: ((event.clientY - rect.top) / rect.height) * height,
        };
    };
    return (_jsxs("div", { className: props.classNames.input, children: [_jsx("canvas", { ref: canvasRef, width: width, height: height, style: {
                    width: "100%",
                    maxWidth: width,
                    height,
                    border: `1px solid ${config.borderColor || "#999"}`,
                    touchAction: "none",
                    cursor: "crosshair",
                    display: "block",
                }, onPointerDown: (event) => {
                    if (!props.form.isFieldEnabled(props.field.handle)) {
                        return;
                    }
                    const canvas = canvasRef.current;
                    const context = canvas?.getContext("2d");
                    if (!context) {
                        return;
                    }
                    drawing.current = true;
                    canvas?.setPointerCapture(event.pointerId);
                    const { x, y } = point(event);
                    context.beginPath();
                    context.moveTo(x, y);
                }, onPointerMove: (event) => {
                    if (!drawing.current) {
                        return;
                    }
                    const context = canvasRef.current?.getContext("2d");
                    if (!context) {
                        return;
                    }
                    const { x, y } = point(event);
                    context.lineTo(x, y);
                    context.stroke();
                    setHasInk(true);
                }, onPointerUp: () => {
                    if (!drawing.current) {
                        return;
                    }
                    drawing.current = false;
                    commit();
                }, onPointerLeave: () => {
                    if (!drawing.current) {
                        return;
                    }
                    drawing.current = false;
                    commit();
                } }), config.showClearButton !== false ? (_jsx("button", { type: "button", disabled: !hasInk || !props.form.isFieldEnabled(props.field.handle), onClick: () => {
                    const canvas = canvasRef.current;
                    const context = canvas?.getContext("2d");
                    if (!canvas || !context) {
                        return;
                    }
                    context.clearRect(0, 0, width, height);
                    context.fillStyle = config.backgroundColor || "rgba(0,0,0,0)";
                    context.fillRect(0, 0, width, height);
                    setHasInk(false);
                    props.form.setValue(props.field.handle, "");
                }, children: "Clear" })) : null] }));
}
export function UnsupportedFieldRenderer(props) {
    return (_jsxs("div", { className: props.classNames.input, role: "alert", children: ["Unsupported field type: ", props.field.type] }));
}
