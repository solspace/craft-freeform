# Cloudflare Turnstile

Freeform loads Cloudflare Turnstile on your forms and verifies each submission on the server.
Existing integrations keep their saved settings.

## Set up the integration

1. Enter your **Site Key** and **Secret Key** from the [Cloudflare Turnstile dashboard](https://dash.cloudflare.com/).
2. Choose whether the integration should be **Enabled by default** on forms.
3. Click **Save**.
4. Open your form in the builder, go to **Integrations → Captchas**, and select
   **Turnstile**. Make sure it is enabled, review its settings, and save the form.
5. Submit a test entry on your website.

## Setup help and settings

<details>
<summary>Get your keys</summary>

Open the [Cloudflare dashboard](https://dash.cloudflare.com/) and select
**Turnstile**. Add or open a widget, configure the hostnames where your forms run,
and copy its **Site Key** and **Secret Key** into Freeform.

Choose the widget mode in Cloudflare:

- **Managed** lets Cloudflare decide whether a visitor needs to tick a checkbox.
- **Non-interactive** shows a status widget without asking for a click.
- **Invisible** runs without displaying a widget.

These modes are set in Cloudflare, so Freeform does not show a separate mode
selector. See [Cloudflare's widget guide](https://developers.cloudflare.com/turnstile/concepts/widget/).

The secret key stays on your server. You can use an environment variable such as
`$TURNSTILE_SECRET_KEY` instead of entering it directly.

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

### Widget size

Choose **Normal** for a 300 × 65 px widget, **Flexible** to fill the available
width with a 300 px minimum, or **Compact** for a 150 × 140 px widget. Size only
applies to visible widgets. Invisible mode ignores this setting.

### Turnstile action name

Keep `submit` for most forms. This identifies submissions in Cloudflare analytics.
It does not change the widget mode or act as a risk-score threshold.

### Turnstile language

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
      "name": "cf-turnstile-response",
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

See the [Turnstile testing guide](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) and [Turnstile CSP guide](https://developers.cloudflare.com/turnstile/reference/content-security-policy/) for provider-specific checks.

</details>
