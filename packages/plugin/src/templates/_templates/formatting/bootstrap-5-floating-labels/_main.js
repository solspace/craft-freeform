var form = document.querySelector('[data-id="{{ form.anchor }}"]');
if (form) {
    // Styling for AJAX responses
    form.addEventListener("freeform-ready", function (event) {
        var freeform = event.freeform;

        freeform.setOption("errorClassBanner", ["alert", "alert-danger"]);
        freeform.setOption("errorClassList", ["list-unstyled", "m-0", "fst-italic", "text-danger"]);
        freeform.setOption("errorClassField", ["is-invalid"]);
        freeform.setOption("successClassBanner", ["alert", "alert-success"]);
    })
    // Styling for Stripe Payments field
    form.addEventListener("freeform-stripe-styling", function (event) {
        event.detail.base = {
            fontSize: "16px",
            fontFamily: "-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\",\"Noto Color Emoji\"",
        }
    })
}