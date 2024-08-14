var form = document.querySelector('[data-freeform-basic-floating-labels]');
if (form) {
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
                    colorText: "#212529",
                    colorBackground: "#ffffff",
                    colorDanger: "#dc3545",
                    borderRadius: "5px",
                },
                rules: {
                    '.Tab, .Input': {
                        border: '1px solid #cbced0',
                        boxShadow: 'none',
                    },
                    '.Tab:focus, .Input:focus': {
                        border: '1px solid #0b5ed7',
                        boxShadow: 'none',
                        outline: '0',
                        transition: 'border-color .15s ease-in-out',
                    },
                    '.Label--resting': {
                        fontSize: '16px',
                        fontWeight: '400',
                    },
                    '.Label--floating': {
                        fontSize: '13px',
                        fontWeight: 'normal',
                    },
                },
            }
        );
    });
}
