# Setup Guide

This guide assumes you have a [Mollie](https://www.mollie.com) account already.

## Compatibility

Supports Mollie Payments API v2.

## Setup Instructions

### 1. Prepare Freeform

- Go to Freeform → Settings → Payment Gateways → New Integration → Mollie
- Fill in:
  - API Key (required)
  - Use Test Mode (optional)
  - Webhook Secret (optional, recommended for signature verification)
- Copy the value in the read-only Webhook URL field (you will paste this in Mollie).

### 2. Prepare Mollie

- In the Mollie Dashboard, configure your webhook:
  - Go to Developers → Webhooks
  - Add a webhook endpoint and paste the Webhook URL copied from Freeform
  - Enable payment events you want to receive (e.g. paid, failed, canceled, expired)
- If you use a Webhook Secret in Freeform, ensure you record it and keep it secure.

### 3. Configure the Form

- Open your form in the Freeform builder
- Add the Mollie Payment field and configure:
  - Amount (fixed or dynamic)
  - Currency
  - Description (supports tokens like `{{ form.name }}`)
  - Successful Redirect URL (optional; falls back to form Return URL)
- Save the form

### 4. Test the Flow

- Enable Test Mode in Freeform if you’re testing
- Submit the form; you should be redirected to Mollie checkout
- After payment, Mollie will call your webhook; the submission’s payment record/status will update

## Troubleshooting

- Verify the Webhook URL is reachable from the internet
- Check Freeform → Logs → Integrations for errors
- Confirm your API key scopes in the Mollie Dashboard
