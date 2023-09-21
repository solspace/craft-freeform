var form = document.querySelector('[data-id="{{ form.anchor }}"]');
if (form) {
    // Styling for AJAX responses
    form.addEventListener("freeform-ready", function (event) {
        var freeform = event.target.freeform;
        freeform.setOption("errorClassBanner", ["callout", "alert"]);
        freeform.setOption("errorClassList", ["errors"]);
        freeform.setOption("errorClassField", "has-error");
        freeform.setOption("successClassBanner", ["callout", "success"]);
    })
    // Styling for Stripe Payments field
    form.addEventListener("freeform-stripe-styling", function (event) {
        event.detail.base = {
            fontSize: "16px",
            fontFamily: "-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\",\"Noto Color Emoji\"",
        }
    })
}