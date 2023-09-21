var form = document.querySelector('[data-id="{{ form.anchor }}"]');
if (form) {
    // Styling for AJAX responses
    form.addEventListener("freeform-ready", function (event) {
        var freeform = event.target.freeform;
        freeform.setOption("errorClassBanner", ["bg-red-100", "border", "border-red-400", "font-bold", "text-red-700", "px-4", "py-3", "rounded", "relative", "mb-4"]);
        freeform.setOption("errorClassList", ["errors", "text-red-500", "text-sm", "italic"]);
        freeform.setOption("errorClassField", ["border-red-500"]);
        freeform.setOption("successClassBanner", ["bg-green-100", "border", "border-green-500", "font-bold", "text-green-700", "px-4", "py-3", "rounded", "relative", "mb-4"]);
    })
    // Styling for Stripe Payments field
    form.addEventListener("freeform-stripe-styling", function (event) {
        event.detail.base = {
            fontSize: "16px",
            fontFamily: "-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\",\"Noto Color Emoji\"",
        }
    })
}