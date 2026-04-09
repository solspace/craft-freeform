# Setup Guide

This guide assumes you have a [Mollie](https://www.mollie.com) account already.

<span class="note warning">Please refer to the [Freeform Mollie integration documentation](https://docs.solspace.com/craft/freeform/v5/integrations/mollie/) for the complete setup guide.</span>

## Compatibility

- Uses Mollie Payments on `v2` of the REST API.
- Supports one-time payments.
- A publicly accessible site is required to fully test or use Mollie.

### How It Works

- Frontend: no _Mollie_ field is presented to the user when viewing the form. When the user submits the form, the page redirects to a Mollie-hosted page to accept the payment.
- Backend: Freeform creates a Mollie payment and returns the user to the configured success/failure URL.
- Submission: After the payment is completed and the form submission is saved, Freeform links the payment to the submission so it appears in the control panel.

## Setup Instructions

### 1. Prepare Freeform

- Click on the **Mollie** integration in your Freeform control panel.
- Copy the value inside the **Webhook URL** setting.
- Leave this page open.

### 2. Set Up Mollie

Open another browser tab and [log into your Mollie account](https://mollie.com):

- In the top menu, click on the **Browse** menu and then click **Developers**.
- On the **API Keys** tab:
  - Copy the **Test API Key** on the page.
- On **Webhooks** tab:
  - Click the _Create webhook_ button.
  - On next page, paste in your _Webhook URL_ from Freeform into the **Webhook URL** setting.
  - Fill out rest of settings as necessary.
    - For **Payload style**, choose _Snapshot_.
    - For **Event types**, choose _Payment Link API_.
- Click the **Create** button at the bottom of the page.
  - A modal window will load with a **Secret Token**.
  - Copy that token and close the modal.

### 3. Complete the Connection

- Switch back to the Mollie integration inside Freeform.
  - Paste the Mollie _Test API Key_ into the **API Key** setting in Freeform.
  - Paste the Mollie _Webhook Secret_ token into the **Webhook Secret** setting in Freeform.
- If you plan on testing the integration in test mode (recommended), enable the **Use Test Mode** setting.
- Click the **Save** button.
- After the integration is saved, you should see an **Authorize** button at the top of the page.
- Click the **Authorize** button.
- If successful, the flag at the top will turn green and display _Authorized_.

### 4. Configure the Form

To use this integration on your form(s), configure each form individually:

- Open the form in the form builder.
- Click the **Integrations** tab.
- Click **Mollie** in the list of available integrations.
- Toggle the _Enable_ setting ON.
- Add a **Mollie** field to your form layout and configure as needed.
- Save the form.

<span class="note warning">Please refer to the [Freeform Mollie integration documentation](https://docs.solspace.com/craft/freeform/v5/integrations/mollie/) for the complete setup guide.</span>

### 5. Testing

- Open your form on the front end.
- Fill out the form as usual.
- To create test payments, refer to [Mollie's Testing Payments](https://docs.mollie.com/reference/testing#testing-different-types-of-cards) docs for test card numbers.
- Complete the transaction.

---

<small>Need more from this integration? Looking for an integration that's not available? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>
