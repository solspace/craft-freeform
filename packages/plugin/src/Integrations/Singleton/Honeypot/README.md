# Setup Guide

Freeform includes its own Honeypot spam protection feature. It works by inserting an input in the form that is invisible to a regular user. A regular user will not see or be able to add a value to the field, leaving it empty and passing the test. If the bot enters a value in the input, the test will fail.

## Setup Instructions

### 1. Enable the Freeform Honeypot

- Enable the Freeform Honeypot by toggling on the **Enabled** setting.
- If you'd like the Freeform Honeypot to be enabled for all forms by default, toggle on the **Enabled by default** setting.

### 2. Additional Configuration

- If you wish to rename the default Freeform Honeypot input name, enter a value in the **Custom Input Name** setting.
- If you wish to change the default error message for the Freeform Honeypot, enter a value in the **Custom Error Message** setting.
    - This is only applied if the _Spam Behavior_ setting is set to _Display Error Messages_.
- Save the form.

### 3. Configure the Form
To use this integration on your form(s), you'll need to configure each form individually. If you toggled on the **Enabled by default** setting in the Freeform Settings, it will automatically be ON for all forms. You can disable them for each form as necessary.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Freeform Honeypot** in the list of available integrations.
- On the right side of the page:
    - Enable (or disable) the integration.
    - Adjust any of the settings as needed.
- Save the form.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>