# reCAPTCHA

Freeform can load reCAPTCHA on your forms and check submissions with Google.

Already using reCAPTCHA in Freeform? Keep **Setup → Legacy** and your existing
keys. Moving a key to Google Cloud does not require you to change this setting.

## Set up the integration

1. Choose **Setup**:
   - **Google Cloud** uses the Enterprise API. Choose this for a new setup with a
     site key, Google Cloud project ID, and Google Cloud API key.
   - **Legacy** uses a site key and secret key. Choose this if you already have
     those keys, even if Google now manages them in Cloud.
2. Choose the **Captcha Type** that matches your Google website key:
   - **Score-based** shows no checkbox or puzzle. Freeform checks a risk score
     when the form is submitted.
   - **Invisible** may show a puzzle when the form is submitted. This v2 type is
     available with Legacy only.
   - **Checkbox** shows a checkbox and may ask the visitor to solve a puzzle.
3. Enter the credentials for your chosen setup. See the key instructions below
   if you need to create or find them.
4. Choose whether the integration should be **Enabled by default** on forms.
5. Click **Save**.
6. Open your form in the builder, go to **Integrations → Captchas**, and select
   **reCAPTCHA**. Make sure it is enabled, review its settings, and save the form.
7. Submit a test entry on your website to check the setup.

Changing **Captcha Type** in Freeform does not change the key in Google. Both
must use the same type.

## Setup help and settings

<details>
<summary>Get keys for Google Cloud</summary>

1. Open the [Google Cloud console](https://console.cloud.google.com/) and select
   or create a project.
2. [Create a website key](https://docs.cloud.google.com/recaptcha/docs/create-key-website)
   for Score-based or Checkbox. Add the domains that will display your forms and
   keep Google's domain verification enabled.
3. Enable the **reCAPTCHA Enterprise API** in that project.
4. [Create an API key](https://docs.cloud.google.com/docs/authentication/api-keys)
   in the same project. Restrict it to the reCAPTCHA Enterprise API. Use server
   IP restrictions for your server's outbound IP addresses, rather than website
   referrer restrictions.
5. In Freeform, choose **Setup → Google Cloud**. Enter the **Site Key**, **Google
   Cloud Project ID**, and **Google Cloud API Key**. Use the project ID rather
   than its display name or project number.

The site key and API key are different values. Keep the API key private. Freeform
uses it on the server and does not send it to visitors. You can use environment
variables for credentials, such as `$RECAPTCHA_API_KEY`.

The Enterprise API does not require a paid Enterprise subscription. Google
currently includes 10,000 free assessments per calendar month across an
organization's accounts and sites. Billing is not required within that allowance.
Without billing, verification stops working after the allowance is exceeded.
See [Google's billing information](https://docs.cloud.google.com/recaptcha/docs/billing-information)
for current limits and pricing.

This setup supports Score-based and Checkbox keys. Universal keys, policy-based
challenge keys, service-account JSON files, and OAuth credentials are not
supported.

</details>

<details>
<summary>Find keys for Legacy</summary>

If you already have a site key and secret key, enter them in **Site Key** and
**Secret Key** with **Setup → Legacy** selected.

For a key managed in Google Cloud:

1. Open the key's details in Google Cloud.
2. Select **Integration**.
3. Click **Use legacy key** or **Integrate with a third-party service or plugin**.
4. Copy the legacy secret key into Freeform's **Secret Key** field.

A Google Cloud API key cannot be used as the Secret Key. See
[Google's key guide](https://docs.cloud.google.com/recaptcha/docs/create-key-website)
for help finding the legacy secret.

Legacy supports Score-based v3, Invisible v2, and Checkbox v2. Keep the secret key
private. Freeform uses it on the server and does not send it to visitors.

</details>

<details>
<summary>Choose score and failure settings</summary>

For **Score-based**, **Score Threshold** is the minimum score a submission must
receive to pass verification. Scores below it fail. A value of **0.5 is
recommended**.

- Move toward **0.0** to be less strict and flag fewer submissions.
- Move toward **1.0** to be more strict and flag more submissions. This can also
  affect real visitors.

Review your results in Google before adjusting the threshold.

**Failure Behavior** controls what happens when verification fails:

- **Send to Spam Folder** marks the submission as spam.
- **Display Error Message** shows an error so the visitor can try again. Set the
  message in **Error Message**.

For new integrations, Score-based defaults to **Send to Spam Folder**. Both v2
types default to **Display Error Message**. Once you choose a failure behavior,
changing the Captcha Type will keep your choice. Existing integrations also keep
their saved behavior.

A missing token or a problem contacting Google always shows an error so the
visitor can retry.

</details>

<details>
<summary>Loading and advanced settings</summary>

Most sites can leave these settings at their defaults.

**Only load Captcha scripts once the user interacts with the form** delays
loading until the visitor starts filling out the form. Submitting directly also
starts reCAPTCHA. Disable this setting to load it when the page opens. Your site's
consent settings still apply.

Open **Advanced settings** for the options below. Closing the panel does not
reset its values. Freeform remembers whether it was open or closed for each
integration in this browser, without needing to click Save.

### JavaScript setup

Keep **Managed by Freeform** unless your site has its own code to load reCAPTCHA
and generate tokens. See the custom JavaScript section below for that setup.

### reCAPTCHA domain

Keep **google.com** unless it is blocked for your visitors. Choose
**recaptcha.net** in that case. Changing this setting does not bypass consent
requirements.

### Allowed website domains

Leave this blank to use Google's domain verification. If you turn off domain
verification in Google, you must enter the allowed domains here.

Enter one exact hostname per line, without `https://`, paths, ports, or wildcards:

```text
example.com
www.example.com
forms.example.com
```

Each entry matches only that hostname. Adding `example.com` does not also allow
`www.example.com`. Matching ignores letter case and trailing dots. For headless
sites, enter the frontend hostname where reCAPTCHA runs.

### Checkbox theme and size

For Checkbox keys, choose a light or dark appearance. Use **Compact** if the
checkbox needs to fit a narrow form.

### Google action name

For Score-based keys, keep `submit` unless you need another name. If your own
JavaScript generates tokens, its action must match this value. Names can contain
letters, numbers, underscores, and slashes. Freeform rejects tokens with a
different action.

### reCAPTCHA language

Leave blank for automatic selection. Regular forms use the current Craft site
language. Headless frontends let Google select the language. To choose a specific
language, enter a Google language code such as `en`, `fr`, or `de`.

</details>

<details>
<summary>Custom JavaScript and headless forms</summary>

### Using Freeform's headless packages

Keep **JavaScript setup → Managed by Freeform** when you use Freeform's reCAPTCHA
extension. It handles loading reCAPTCHA and providing a token for each submission.
Use compatible versions of the core and extensions packages that support your
chosen Google setup.

### Providing your own token

Choose **JavaScript setup → Custom JavaScript** if your code handles Google's
script and token generation. Freeform then adds no reCAPTCHA container or scripts
for this integration. The official reCAPTCHA extension also leaves token handling
to your code. Freeform still verifies the token on the server.

For regular forms, supply the fresh token in a `g-recaptcha-response` form field
before submitting. For Score-based keys, use `grecaptcha.execute()` with Legacy
or `grecaptcha.enterprise.execute()` with Google Cloud. The action must match
**Google action name**. For Checkbox or Invisible, use Google's challenge flow
to obtain the token.

For headless JSON submissions, include the following in your normal submission
payload. Replace `TOKEN` with the token from Google:

```json
{
  "meta": {
    "captcha": {
      "name": "g-recaptcha-response",
      "value": "TOKEN"
    }
  }
}
```

For GraphQL, use the `captcha` input's `name` and `value` fields.

Tokens can only be used once and expire after two minutes. Generate a fresh token
when submitting, and get another after a failed or expired challenge. See
[Google's assessment guide](https://docs.cloud.google.com/recaptcha/docs/create-assessment-website).

For custom script loading, Google Cloud uses `enterprise.js` and
`grecaptcha.enterprise`. Legacy uses `api.js` and `grecaptcha`. The selected
**reCAPTCHA domain** is also used for Legacy server verification. Google Cloud
server verification always uses `recaptchaenterprise.googleapis.com`.

</details>

<details>
<summary>Troubleshooting</summary>

- **Invalid key or credentials:** Check that Setup and Captcha Type match your
  Google key. For Google Cloud, confirm the API is enabled and the site key,
  project ID, and API key belong to the same project.
- **reCAPTCHA does not appear or submissions report a missing token:** Check
  whether consent tools, content blockers, or your Content Security Policy are
  blocking Google's scripts. With Custom JavaScript selected, your code must
  provide the token.
- **Unexpected domain or action:** Check Allowed website domains and Google
  action name. The hostname must match exactly, and Score-based tokens must use
  the configured action.
- **Quota exceeded:** Review usage and billing in Google Cloud. A quota error
  shows an error to the visitor instead of marking the submission as spam.
- **Testing while logged in:** If **Bypass All Spam Checks for Logged in Users**
  is enabled in Freeform's spam settings, test while signed out so reCAPTCHA
  verification runs.

Freeform logs verification failures and service errors without recording tokens,
secret keys, API keys, or raw Google error responses. Network failures, invalid
credentials, incomplete responses, and quota errors are treated as service errors.

Legacy verification can report success with a fixed score when a project exceeds
its free allowance without billing. Freeform detects Google's quota warning and
shows an error rather than accepting that score. See
[Google's quota behavior](https://docs.cloud.google.com/recaptcha/quotas#quota_limit).

</details>
