"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const keyframes = `
@keyframes ff-loader-spin {
  to { transform: rotate(360deg); }
}
@keyframes ff-loader-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
`;
const pulseStyle = {
    animation: "ff-loader-pulse 1.4s ease-in-out infinite",
    backgroundColor: "currentColor",
    opacity: 0.12,
    borderRadius: "8px",
};
export function FormLoader({ message = "Loading form…", className = "ff-loader", variant = "skeleton", }) {
    return (_jsxs("div", { className: className, role: "status", "aria-live": "polite", "aria-busy": "true", "data-variant": variant, style: rootStyle, children: [_jsx("style", { children: keyframes }), variant === "skeleton" ? (_jsxs("div", { style: skeletonRootStyle, "aria-hidden": "true", children: [_jsx("div", { style: {
                            ...pulseStyle,
                            height: "0.75rem",
                            width: "38%",
                            marginBottom: "1.25rem",
                        } }), [0, 1, 2].map((index) => (_jsxs("div", { style: { marginBottom: "1rem" }, children: [_jsx("div", { style: {
                                    ...pulseStyle,
                                    height: "0.65rem",
                                    width: "28%",
                                    marginBottom: "0.45rem",
                                    animationDelay: `${index * 0.12}s`,
                                } }), _jsx("div", { style: {
                                    ...pulseStyle,
                                    height: "2.5rem",
                                    width: index === 2 ? "62%" : "100%",
                                    animationDelay: `${index * 0.12}s`,
                                } })] }, index))), _jsx("div", { style: {
                            ...pulseStyle,
                            height: "2.5rem",
                            width: "7rem",
                            marginTop: "0.5rem",
                            animationDelay: "0.36s",
                        } })] })) : (_jsx("div", { style: spinnerStyle, "aria-hidden": "true" })), _jsx("p", { style: messageStyle, children: message })] }));
}
const rootStyle = {
    display: "grid",
    gap: "1rem",
    padding: "1.25rem 0",
    color: "inherit",
};
const skeletonRootStyle = {
    width: "100%",
};
const messageStyle = {
    margin: 0,
    fontSize: "0.9rem",
    opacity: 0.75,
};
const spinnerStyle = {
    width: "2rem",
    height: "2rem",
    border: "3px solid currentColor",
    borderTopColor: "transparent",
    borderRadius: "50%",
    opacity: 0.85,
    animation: "ff-loader-spin 0.7s linear infinite",
};
