# Setup Guide

This guide assumes you already have [Square](https://squareup.com/) and [Square Developer](https://developer.squareup.com/console/apps) accounts.

<span class="note warning">Please refer to the [Freeform Square integration documentation](https://docs.solspace.com/craft/freeform/v5/integrations/square/) for the complete setup guide.</span>

## Compatibility

Uses a private app on `v1` of the REST API.

### Endpoints

Maps data to Square's **Web Payments SDK**.

## Setup Instructions

### 1. Prepare Freeform

- Click on the **Square** integration in your Freeform control panel.
- Leave this page open.

### 2. Set Up Square

Open another browser tab and [log into your Square Developer account](https://developer.squareup.com/console/apps):

- In the **Applications** menu, click on the large **+** button to create a new app:
    - Provide a name for the app and click _Next_.
    - Select _Accept Payments_ checkbox and click _Next_.
    - Choose an option for _Find your audience_ (likely **Myself**).
    - Click on **Complete** button.
- Once you're taken to the app's page, copy the **Sandbox Application ID** and **Sandbox Access token** tokens.
- In the navigation menu, click on **Locations**.
    - In the right side of the page, copy the value under the **Location ID** column.

### 3. Complete the Connection

- Switch back to the Square integration inside Freeform, and paste the Square tokens into the **Application ID**, **Access Token** and **Location ID** settings.
- If you plan on testing the integration in sandbox mode (recommended), enable the **Use Sandbox** setting.
- Click the **Save** button.
- After the integration is saved, you should see an **Authorize** button at the top of the page.
- Click **Authorize**.
- If successful, the flag at the top will turn green and display _Authorized_.

### 4. Configure the Form

To use this integration on your form(s), configure each form individually:

- Open the form in the form builder.
- Click the **Integrations** tab.
- Click **Square** in the list of available integrations.
- Toggle the _Enable_ setting ON.
- Add a **Square** field to your form layout and configure as needed.
- Save the form.

<span class="note warning">Please refer to the [Freeform Square integration documentation](https://docs.solspace.com/craft/freeform/v5/integrations/square/) for the complete setup guide.</span>

### 5. Sandbox Testing

- Open your form on the front end.
- Fill out the form as usual.
- To test the credit card field, refer to [Square's Sandbox Payments](https://developer.squareup.com/docs/devtools/sandbox/payments) docs for test card numbers.
- Complete the transaction.

---

<small>Need more from this integration? Looking for an integration that's not available? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>