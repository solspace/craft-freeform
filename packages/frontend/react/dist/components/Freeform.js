"use client";
import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useFreeform } from "../hooks/useFreeform.js";
import { FormLoader } from "./FormLoader.js";
import { FreeformView } from "./FreeformView.js";
export function Freeform({ children, className, loadingMessage, loadingFallback, errorFallback = (error) => _jsx("div", { role: "alert", children: error.message }), ...options }) {
    const form = useFreeform(options);
    const loader = loadingFallback ?? (_jsx(FormLoader, { message: loadingMessage ?? "Loading form…" }));
    if (children) {
        return _jsx(_Fragment, { children: children(form) });
    }
    if (form.loading) {
        return _jsx(_Fragment, { children: loader });
    }
    if (form.error) {
        return _jsx(_Fragment, { children: errorFallback(form.error) });
    }
    if (!form.manifest) {
        return null;
    }
    return (_jsx(FreeformView, { form: form, className: className }));
}
