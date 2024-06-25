# Setup Guide

Spam Blocking is handled as an integration to give you more control. Spam Blocking can be updated even when setting changes are disabled for the site. It also offers the ability to create multiple sets of blocks as well as form-specific blocks (entered directly inside each form).

## Setup Instructions

### 1. Configure the Integration

- Enable the **Enabled by default** setting if you'd like this integration to be enabled by default for any existing and new forms. Otherwise, you will need to manually opt-in for each form inside the builder.
- Enable the **Display Errors about Blocked Email Addresses under each Email Field** setting if you'd like field-based errors to display under the Email field(s) for which the user has entered a blocked email address. This isn't recommended for regular use but is helpful if you're trying to troubleshoot submission issues.
    - If enabled, enter an error message to show users when blocked email addresses are submitted. You can use the `{email}` variables.
    - This can be overrided on a per form level inside the form builder.

### 2. Set the Defaults

- In the **Default Blocked Email Addresses** textarea below, enter email addresses you would like blocked from being used in all Email fields for any form that enables this integration.
- Use asterisks for wildcards (e.g. `*@hotmail.ru`), and separate multiples on new lines. When attempting to block individual characters (e.g. Russian letters) or partial words or strings, make good use of the wildcard character by placing one before and after.
- If you ever need to add, remove or change blocked email addresses, you can come back to this integration settings page and do so.
- Save the integration.

### 3. Configure the Form

- If you enabled the **Enabled by default** setting, this will already be enabled on all of your existing forms, and you likely shouldn't need to touch anything else after that.
- If you did not enable the **Enabled by default** setting, you will need to enable this spam block manually for each form that you wish for it to apply to.
- If you want to add form-specific blocks, you can enter them inside this integration in the form builder. Anything added there will be in addition to the global blocks set here and will apply only to that form.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>