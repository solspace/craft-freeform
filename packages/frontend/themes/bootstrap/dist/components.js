import { jsx as _jsx } from "react/jsx-runtime";
function BootstrapForm({ className, children, onSubmit, colorMode, }) {
    return (_jsx("form", { className: className, onSubmit: onSubmit, noValidate: true, "data-bs-theme": colorMode, "data-freeform-bootstrap": colorMode === "dark" ? "dark" : true, children: children }));
}
export function BootstrapLightForm(props) {
    return _jsx(BootstrapForm, { ...props, colorMode: "light" });
}
export function BootstrapDarkForm(props) {
    return _jsx(BootstrapForm, { ...props, colorMode: "dark" });
}
