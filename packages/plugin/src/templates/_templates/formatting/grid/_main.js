var form = document.querySelector('[data-freeform-grid]');
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
