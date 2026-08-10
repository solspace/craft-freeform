import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getSignatureConfig, isSignatureValueEmpty, } from "@solspace/freeform-core";
import { useCallback, useEffect, useRef, useState, } from "react";
/**
 * Signature pad renderer. Register `signatureExtension` from
 * @solspace/freeform-extensions so manifests that require it resolve.
 */
export function SignatureFieldRenderer(props) {
    const canvasRef = useRef(null);
    const drawing = useRef(false);
    const [hasInk, setHasInk] = useState(!isSignatureValueEmpty(props.value));
    const config = getSignatureConfig(props.field);
    const width = config.width ?? 400;
    const height = config.height ?? 100;
    const enabled = props.form.isFieldEnabled(props.field.handle);
    const penColor = config.penColor || "#000000";
    const backgroundColor = config.backgroundColor || "rgba(0,0,0,0)";
    const borderColor = config.borderColor || "#999999";
    const penSize = config.penDotSize ?? 2.5;
    const paintBackground = useCallback((context) => {
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, width, height);
    }, [backgroundColor, height, width]);
    const commit = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        props.form.setValue(props.field.handle, canvas.toDataURL("image/png"));
    }, [props.field.handle, props.form]);
    const clear = useCallback(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) {
            return;
        }
        context.clearRect(0, 0, width, height);
        paintBackground(context);
        setHasInk(false);
        props.form.setValue(props.field.handle, "");
    }, [height, paintBackground, props.field.handle, props.form, width]);
    // biome-ignore lint/correctness/useExhaustiveDependencies: Initialize on mount/size only. Including props.value would wipe strokes whenever commit() updates the form value mid-draw.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const ratio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        canvas.width = Math.floor(width * ratio);
        canvas.height = Math.floor(height * ratio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const context = canvas.getContext("2d");
        if (!context) {
            return;
        }
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        paintBackground(context);
        context.strokeStyle = penColor;
        context.lineWidth = penSize;
        context.lineCap = "round";
        context.lineJoin = "round";
        if (typeof props.value === "string" && props.value.startsWith("data:")) {
            const image = new Image();
            image.onload = () => {
                context.drawImage(image, 0, 0, width, height);
                setHasInk(!isSignatureValueEmpty(props.value));
            };
            image.src = props.value;
        }
        else {
            setHasInk(false);
        }
        return () => {
            drawing.current = false;
        };
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
    const endStroke = () => {
        if (!drawing.current) {
            return;
        }
        drawing.current = false;
        commit();
    };
    return (_jsxs("div", { className: props.classNames.input, "data-freeform-signature": "", children: [_jsx("canvas", { ref: canvasRef, width: width, height: height, style: {
                    width: "100%",
                    maxWidth: width,
                    height,
                    border: `1px solid ${borderColor}`,
                    touchAction: "none",
                    cursor: enabled ? "crosshair" : "not-allowed",
                    display: "block",
                    backgroundColor,
                }, "aria-label": props.field.label, onPointerDown: (event) => {
                    if (!enabled) {
                        return;
                    }
                    const canvas = canvasRef.current;
                    const context = canvas?.getContext("2d");
                    if (!context || !canvas) {
                        return;
                    }
                    drawing.current = true;
                    canvas.setPointerCapture(event.pointerId);
                    context.strokeStyle = penColor;
                    context.lineWidth = penSize;
                    context.lineCap = "round";
                    context.lineJoin = "round";
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
                }, onPointerUp: endStroke, onPointerCancel: endStroke, onPointerLeave: endStroke }), config.showClearButton !== false ? (_jsx("button", { type: "button", disabled: !hasInk || !enabled, onClick: clear, children: "Clear" })) : null] }));
}
