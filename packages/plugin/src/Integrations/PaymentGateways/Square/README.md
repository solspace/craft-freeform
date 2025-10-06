# Setup Guide

This guide assumes you have a Square account and developer app.

> For a complete setup guide for payments in Freeform, see the Freeform documentation.

## Compatibility

- Supports one-time payments using Square’s Web Payments SDK and REST API.
- Amounts are in the smallest currency unit (e.g., USD cents). $5.00 = 500.

## Requirements

- Square Application ID (frontend)
- Square Access Token (server-side)
- Square Location ID

## Setup Instructions

### 1. Prepare Freeform

- Go to Craft CP → Freeform → Integrations → Add Integration.
- Choose Square and enter:
  - Application ID
  - Access Token (use a Sandbox token if Sandbox is enabled)
  - Location ID
- Toggle “Use Sandbox” for testing.
- Save and run Status Check to verify credentials.

### 2. Configure the Form

- Open your form in the Freeform form builder.
- Add the “Square Payment” field.
- In field settings:
  - Select your Square integration.
  - Choose the amount source:
    - Fixed amount
    - Dynamic amount (read from another field)
  - Optional: set Successful Payment Redirect and Failed Payment Redirect.

### 3. Frontend Behavior

- The Square field renders a mount point for the Web Payments SDK.
- On form submit, the card is tokenized and a payment is created server-side.
- On success, the payment id is stored and the form submits normally (or redirects if configured).

## How It Works

- Frontend: Square Web Payments SDK creates a nonce and posts to a Freeform endpoint to create the payment.
- Backend: Freeform creates a Square payment and returns success/failure.
- Submission: After the form is saved, Freeform links the payment to the submission so it appears in the Control Panel.

## Troubleshooting

- Declines (e.g., CARD_DECLINED) are returned and shown on the form; test with Sandbox cards when in Sandbox mode.
- If a payment is successful but doesn’t appear on the submission, ensure the form includes a Square Payment field and that the page loads the Square script.


