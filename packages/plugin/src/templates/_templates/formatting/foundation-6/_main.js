var form = document.querySelector('[data-freeform-foundation]');
if (form) {
    // Styling for AJAX responses
    form.addEventListener("freeform-ready", function (event) {
        var freeform = event.freeform;
        freeform.setOption("errorClassBanner", ["callout", "alert"]);
        freeform.setOption("errorClassList", ["errors"]);
        freeform.setOption("errorClassField", "has-error");
        freeform.setOption("successClassBanner", ["callout", "success"]);
    })
    // Styling for Stripe Payments field
    form.addEventListener("freeform-stripe-appearance", function (event) {
        event.elementOptions.appearance = Object.assign(
            event.elementOptions.appearance,
            {
                variables: {
                    colorPrimary: "#0d6efd",
                },
            }
        );
    });
}
