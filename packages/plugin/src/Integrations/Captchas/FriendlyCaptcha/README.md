# Friendly Captcha

Freeform loads Friendly Captcha on your forms and verifies each submission on the server.
Existing integrations keep their saved settings.

## Set up the integration

1. Enter your **Site Key** and **API Key** from the [Friendly Captcha dashboard](https://app.friendlycaptcha.eu/).
2. Choose **When to start verification**. **On form focus** suits most forms. It starts
   verification when the visitor focuses a field.
3. Choose whether the integration should be **Enabled by default** on forms.
4. Click **Save**.
5. Open your form in the builder, go to **Integrations → Captchas**, and select
   **Friendly Captcha**. Make sure it is enabled, review its settings, and save the form.
6. Submit a test entry on your website.

## Setup help and settings

<details>
<summary>Get your keys</summary>

This integration uses **Friendly Captcha v2**.

1. Open the [Friendly Captcha dashboard](https://app.friendlycaptcha.eu/).
2. Create or open an application and copy its **Sitekey** into Freeform's
   **Site Key** field.
3. Create an API key in the dashboard's keys section and copy it into Freeform's
   **API Key** field. Store it securely before leaving the page.

The API key stays on your server. You can use an environment variable such as
`$FRIENDLY_CAPTCHA_API_KEY` instead of entering it directly.

This integration uses Friendly Captcha's Global endpoint for both the widget
and server verification. See its [getting started guide](https://developer.friendlycaptcha.com/docs/v2/getting-started).

</details>

<details>
<summary>Verification timing and widget mode</summary>

**When to start verification** in Freeform controls when verification starts:

- **On form focus** starts when the visitor focuses a field. This is the default.
- **When widget loads** starts as soon as the widget is ready. If delayed loading is
  enabled, verification waits until the widget loads.
- **On request** waits for the visitor to click the widget. Freeform also starts
  it when the form is submitted.

The separate **Widget Mode** in Friendly Captcha's dashboard determines whether
verification needs a click to finish. It offers One-click, Zero-click, and Smart.
Changing when verification starts in Freeform does not change Widget Mode.

See [Friendly Captcha's configuration guide](https://developer.friendlycaptcha.com/docs/v2/sdk/configuration).

</details>

<details>
<summary>Choose failure settings</summary>

**Failure Behavior** controls what happens when the provider rejects a token:

- **Display Error Message** lets the visitor try again. This is the default.
  Set the message in **Error Message**.
- **Send to Spam Folder** marks the submission as spam.

A missing token, invalid credentials, or an unavailable verification service
always shows an error. These problems do not mean the visitor is spam.
Existing saved choices are preserved.

</details>

<details>
<summary>Loading and advanced settings</summary>

**Only load Captcha scripts once the user interacts with the form** delays
initialization until the visitor starts filling out the form. Submitting directly
also initializes it. Disable this setting to initialize when the page opens.
Your site's consent settings still apply.

Open **Advanced settings** for the options below. Closing the panel does not
reset its values. The panel remembers its open or closed state for this integration
in this browser, without needing to click Save.

### Widget theme

Keep **Auto** to follow the visitor’s appearance preference, or choose Light or
Dark to match your form.

### Friendly Captcha language

Leave blank for automatic selection, or enter a provider language code such as
`en`, `fr`, or `de`. Friendly Captcha chooses the language when this is blank.

</details>

<details>
<summary>Headless forms</summary>

With Freeform's official frontend packages, use the provider's captcha extension
to load the widget and supply its token. Keep the core and extensions packages
compatible with each other.

If your frontend handles tokens itself, include the following in your normal
JSON submission payload. Replace `TOKEN` with the token from the provider:

```json
{
  "meta": {
    "captcha": {
      "name": "frc-captcha-response",
      "value": "TOKEN"
    }
  }
}
```

For GraphQL, use the `captcha` input's `name` and `value` fields. Tokens can only
be used once. Obtain a new token after a submission or an expired challenge.

</details>

<details>
<summary>Risk Intelligence</summary>

If your Friendly Captcha account returns Risk Intelligence with challenge
verification, Freeform keeps a short score summary for reviewing spam, such as
`Overall 2/5, Network 1/5, Browser 3/5`. Freeform does not apply a score threshold
to these values.

This requires Friendly Captcha's Risk Intelligence on Captcha Challenge feature.
See its [Risk Intelligence guide](https://developer.friendlycaptcha.com/docs/v2/risk-intelligence/).

</details>

<details>
<summary>Troubleshooting</summary>

- **Widget does not load:** Check for content blockers, consent tools, or Content
  Security Policy rules blocking the provider. Confirm that the integration is
  enabled on the form.
- **Verification fails:** Check the site key and server key. Make sure the keys
  belong to the same provider account or widget and are valid for your site.
- **Testing while logged in:** If **Bypass All Spam Checks for Logged in Users**
  is enabled in Freeform's spam settings, test while signed out.

Service errors are logged without including tokens, keys, or raw provider
responses. Visitors see your configured error message and can retry.

See the [Friendly Captcha testing guide](https://developer.friendlycaptcha.com/docs/v2/guides/automated-testing) and [Friendly Captcha CSP guide](https://developer.friendlycaptcha.com/docs/v2/guides/csp) for provider-specific checks.

</details>
