# Stripe setup

Connect Freeform to Stripe with API keys and a webhook. Freeform uses Stripe's Payment Element for payments. This connection does not use OAuth.

## Connect your account

1. Open [Stripe API keys](https://dashboard.stripe.com/apikeys) for the account and mode you want to use.
2. Copy the publishable key into **Publishable Key** and the matching secret key into **Secret Key**.
3. Copy Freeform's **Webhook URL** and configure a webhook in Stripe. See **Set up the webhook** below.
4. Paste that endpoint's signing secret into **Webhook Signing Secret**.
5. Save the integration and use **Authorize** to check the connection.

The publishable key starts with `pk_`. The webhook signing secret starts with `whsec_` and is different from the API secret key. See [Stripe's key guide](https://docs.stripe.com/keys) if you need help finding them.

<details>
<summary>Set up the webhook</summary>

In Stripe's **Workbench**, open **Webhooks** and create an event destination for your account. Choose a webhook endpoint with **Snapshot** payloads, then enter Freeform's **Webhook URL**.

Select the three events this integration handles:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`

After creating the endpoint, reveal its signing secret and copy it into Freeform's **Webhook Signing Secret** field. Use the secret for this endpoint and the same account and mode as your API keys.

Stripe must be able to reach the endpoint over HTTPS. See [Stripe's webhook guide](https://docs.stripe.com/webhooks) for current Workbench instructions and local testing options.

</details>

<details>
<summary>Test mode and live mode</summary>

Use test keys while setting up your form. Test publishable keys begin with `pk_test_`, and live publishable keys begin with `pk_live_`.

Keep the publishable key, secret key, and webhook signing secret matched to the same Stripe account and mode. Environment variables can hold different keys for development and production.

</details>

## Configure your form

1. Open the form and select **Integrations**, then **Stripe**.
2. Enable the integration and map the customer fields. Map an email field if you want Stripe receipts.
3. Map the customer address fields if needed.
4. Add a **Stripe** field to the form layout and configure the amount, payment type, and appearance.
5. Save the form.

See the [complete Freeform Stripe guide](https://docs.solspace.com/craft/freeform/v5/integrations/stripe-payments/) for payment-field options and subscription setup.

<details>
<summary>Payment method overrides</summary>

Open **Advanced settings** to override the payment methods configured in Stripe. Leave both fields blank to use your Stripe defaults.

- **One-time Payment Configuration:** enter a Stripe payment method configuration ID beginning with `pmc_`. This applies to one-time payments.
- **Subscription Payment Methods:** enter comma-separated payment method types for subscriptions, such as `card, us_bank_account`. Supported methods depend on your Stripe account and subscription setup.

</details>

<details>
<summary>Receipts and failed-payment actions</summary>

These options are in **Advanced settings**. Opening or closing that panel does not change them.

**Send Stripe Receipts** passes the mapped customer email address to Stripe for successful-payment receipts. These are separate from Freeform's email notifications. Stripe does not automatically send receipts for test payments. See [Stripe's receipt guide](https://docs.stripe.com/receipts) for testing and receipt settings.

**Skip Actions When Payment Fails** keeps the submission but skips Freeform email notifications and other integrations when payment is unsuccessful. Leave disabled to keep the existing default behavior.

</details>
