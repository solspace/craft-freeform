# Setup Guide

Freeform includes its own Javascript Test spam protection feature. It works by inserting an input in the form that is invisible to a regular user with a random value. The javascript loaded into the page then automatically removes the value from the input, allowing the test to pass. If the user or bot doesn't have javascript enabled, the value will not be removed from the input and will fail the test.

## Setup Instructions

### 1. Enable the Freeform Javascript Test

- Enable the Freeform Javascript Test by toggling on the **Enabled** setting.
- If you'd like the Freeform Javascript Test to be enabled for all forms by default, toggle on the **Enabled by default** setting.

### 2. Additional Configuration

- If you wish to rename the default Freeform Javascript Test input name, enter a value in the **Custom Input Name** setting.
- If you wish to change the default error message for the Freeform Javascript Test, enter a value in the **Custom Error Message** setting.
    - This is only applied if the _Spam Behavior_ setting is set to _Display Error Messages_.
- Save the form.

### 3. Configure the Form
To use this integration on your form(s), you'll need to configure each form individually. If you toggled on the **Enabled by default** setting in the Freeform Settings, it will automatically be ON for all forms. You can disable them for each form as necessary.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Freeform Javascript Test** in the list of available integrations.
- On the right side of the page:
    - Enable (or disable) the integration.
    - Adjust any of the settings as needed.
- Save the form.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>