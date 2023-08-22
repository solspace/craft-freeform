var form = document.querySelector('[data-id="{{ form.anchor }}"]');
if (form) {
    // Styling for AJAX responses
    form.addEventListener("freeform-ready", function (event) {
        var freeform = event.target.freeform;

        freeform.setOption("errorClassBanner", ["alert", "alert-danger", "errors", "freeform-alert"]);
        freeform.setOption("errorClassList", ["help-block", "errors", "invalid-feedback"]);
        freeform.setOption("errorClassField", ["is-invalid", "has-error"]);
        freeform.setOption("successClassBanner", ["alert", "alert-success", "form-success", "freeform-alert"]);
    })
    // Styling for Stripe Payments field
    form.addEventListener("freeform-stripe-styling", function (event) {
        event.detail.base = {
            fontSize: "16px",
            fontFamily: "-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\",\"Noto Color Emoji\"",
        }
    })
}