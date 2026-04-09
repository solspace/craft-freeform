# Setup Guide

This guide assumes you already have a [PayPal](https://paypal.com) account.

<span class="note warning">Please refer to the [Freeform PayPal integration documentation](https://docs.solspace.com/craft/freeform/v5/integrations/paypal/) for the complete setup guide.</span>

## Compatibility

Uses a private app on `v1` of the REST API.

### Endpoints

Maps data to PayPal with the **Popup Payment Flow** via the **Orders** endpoint.

## Setup Instructions

### 1. Prepare Freeform

- Click on the **PayPal** integration in your Freeform control panel.
- Leave this page open.

### 2. Set Up PayPal

Open another browser tab and log into your PayPal account:

- On the top menu, click **Developers**.
- On the next page, click **Apps & Credentials**.
- Click the **Create App** button on the right.
  - Provide a name for the app.
  - Choose _Merchant_ for the type.
  - Select a _Sandbox Account_.
  - Click the **Create App** button.
- Once you're taken to the app's page, copy the **Client ID** and **Secret Key 1** tokens.

### 3. Complete the Connection

- Switch back to the PayPal integration inside Freeform, and paste the PayPal tokens into the **Client ID** and **Client Secret** settings.
- If you plan on testing the integration in sandbox mode (recommended), enable the **Use Sandbox** setting.
- Click the **Save** button.
- After the integration is saved, you should see an **Authorize** button at the top of the page.
- Click the **Authorize** button.
- If successful, the flag at the top will turn green and display _Authorized_.

### 4. Configure the Form

To use this integration on your form(s), configure each form individually:

- Open the form in the form builder.
- Click the **Integrations** tab.
- Click **PayPal** in the list of available integrations.
- Toggle the _Enable_ setting ON.
- Add a **PayPal** field to your form layout and configure as needed.
- Save the form.

<span class="note warning">Please refer to the [Freeform PayPal integration documentation](https://docs.solspace.com/craft/freeform/v5/integrations/paypal/) for the complete setup guide.</span>

### 5. Sandbox Configuration

- Switch back to the PayPal account browser tab.
- Scroll down to the **Sandbox account info** area. Here you'll see a test account login email and password.
- At the top of the PayPal page, click **Testing Tools** and then **Sandbox Accounts**.
- This will provide a list of test accounts to use for testing.
- Click on one of the **Personal** test account types to reveal/copy the email and password login.
  - Copy the email address and password.
  - This will be used for PayPal testing on your site.

### 6. Sandbox Testing

- Switch back to your Craft site.
- Open your form on the front end.
- Regular **PayPal** testing:
  - Click the **PayPal** button. A popup will load.
  - Log into PayPal with the **Personal** test account credentials you copied earlier.
  - Complete the transaction.
- **Credit Card** testing:
  - Click the **Debit or Credit Card** button. A series of form fields will load directly on the page.
  - Use PayPal's [credit card generator](https://developer.paypal.com/tools/sandbox/card-testing/#link-testcardnumbers) to create test credit card details.
  - Complete the transaction.

---

<small>Need more from this integration? Looking for an integration that's not available? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>