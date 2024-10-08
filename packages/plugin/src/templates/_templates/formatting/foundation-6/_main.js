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
                  fontFamily: "-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\",\"Noto Color Emoji\"",
                  fontSizeBase: "16px",
                  spacingUnit: "0.2em",
                  tabSpacing: "10px",
                  gridColumnSpacing: "20px",
                  gridRowSpacing: "20px",
                  colorText: "#eaeaea",
                  colorBackground: "#1d1f23",
                  colorDanger: "#dc3545",
                  borderRadius: "5px",
              },
              rules: {
                  '.Tab, .Input': {
                      border: '1px solid #6c757d',
                      boxShadow: 'none',
                  },
                  '.Tab:focus, .Input:focus': {
                      border: '1px solid #0b5ed7',
                      boxShadow: 'none',
                      outline: '0',
                      transition: 'border-color .15s ease-in-out',
                  },
                  '.Label': {
                      fontSize: '16px',
                      fontWeight: '400',
                  },
              },
          }
        );
    });
}
