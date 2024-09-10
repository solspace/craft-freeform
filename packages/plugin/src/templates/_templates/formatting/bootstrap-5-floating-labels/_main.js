var form = document.querySelector('[data-freeform-bootstrap-floating-labels]');
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
    form.addEventListener("freeform-stripe-appearance", function (event) {
        event.elementOptions.appearance = Object.assign(
            event.elementOptions.appearance,
            {
                variables: {
                    colorPrimary: "#0d6efd",
                    fontFamily: "-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\",\"Noto Color Emoji\"",
                    fontSizeBase: "1rem",
                    spacingUnit: "0.2em",
                    tabSpacing: "10px",
                    gridColumnSpacing: "20px",
                    gridRowSpacing: "20px",
                    colorText: "#212529",
                    colorBackground: "#ffffff",
                    colorDanger: "#dc3545",
                    borderRadius: "0.375rem",
                },
                rules: {
                    '.Tab, .Input': {
                        border: '1px solid #dee2e6',
                        boxShadow: 'none',
                    },
                    '.Tab:focus, .Input:focus': {
                        border: '1px solid #0b5ed7',
                        boxShadow: 'none',
                        outline: '0',
                        transition: 'border-color .15s ease-in-out',
                    },
                    '.Label': {
                        fontSize: '1rem',
                        fontWeight: '400',
                    },
                },
            }
        );
    });
}
