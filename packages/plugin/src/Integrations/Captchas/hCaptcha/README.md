# hCaptcha

Freeform loads hCaptcha on your forms and verifies each submission on the server.
Existing integrations keep their saved settings.

## Set up the integration

1. Enter your **Site Key** and **Secret Key** from the [hCaptcha dashboard](https://dashboard.hcaptcha.com/).
2. Choose **Captcha Type**:
   - **Invisible** starts on submit and may show a puzzle. This is the recommended option.
   - **Checkbox** shows a checkbox and may also ask the visitor to solve a puzzle.
3. Choose whether the integration should be **Enabled by default** on forms.
4. Click **Save**.
5. Open your form in the builder, go to **Integrations → Captchas**, and select
   **hCaptcha**. Make sure it is enabled, review its settings, and save the form.
6. Submit a test entry on your website.

## Setup help and settings

<details>
<summary>Get your keys</summary>

Open the [hCaptcha dashboard](https://dashboard.hcaptcha.com/). Create or open a
site in **Sites** and copy its site key. Copy your secret key from **Settings**.
Enter them in Freeform's **Site Key** and **Secret Key** fields.

The secret key stays on your server. You can use an environment variable such as
`$HCAPTCHA_SECRET_KEY` instead of entering it directly.

Invisible and Checkbox can both show a puzzle. Invisible does not mean passive
or score-based verification. Account features and challenge difficulty are
managed in hCaptcha. See the [hCaptcha setup guide](https://docs.hcaptcha.com/).

For Invisible, add hCaptcha's required disclosure near your form. See its
[Invisible guide](https://docs.hcaptcha.com/invisible) for the current wording.

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

Choose Light or Dark to match your form. This setting applies to Checkbox.

### Widget size

Choose **Normal** for the standard checkbox, or **Compact** for a narrow form.
This setting applies to Checkbox.

### hCaptcha language

Leave blank for automatic selection, or enter a provider language code such as
`en`, `fr`, or `de`. Regular forms use the Craft site language when this is blank.
Headless frontends let the provider choose.

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
      "name": "h-captcha-response",
      "value": "TOKEN"
    }
  }
}
```

For GraphQL, use the `captcha` input's `name` and `value` fields. Tokens can only
be used once. Obtain a new token after a submission or an expired challenge.

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

See the [hCaptcha development and testing](https://docs.hcaptcha.com/#local-development) and [hCaptcha CSP guide](https://docs.hcaptcha.com/#content-security-policy-settings) for provider-specific checks.

</details>
