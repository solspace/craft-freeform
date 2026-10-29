# Setup Guide

This guide assumes you have a basic understanding of [reCAPTCHA](https://www.google.com/recaptcha/). Freeform supports reCAPTCHA v2 and v3 through Google's legacy `siteverify` API, using a **Site Key** and **Secret Key**. Compatible keys managed in Google Cloud, including migrated Classic keys, can be used with their **legacy secret key**.

Freeform does not currently use the native reCAPTCHA Enterprise `CreateAssessment` API, service-account authentication, or `enterprise.js`. Moving a key to Google Cloud does not require changing an existing v2/v3 integration to the native Enterprise API. See Google's [migration guidance](https://docs.cloud.google.com/recaptcha/docs/migration-overview).

## Overview
The supported **reCAPTCHA** types below will be automatically loaded and handled by Freeform (when enabled for the form). The **Challenge - Checkbox (v2)** field will be automatically inserted above the Submit button(s).

The **Only load Captcha scripts once the user interacts with the form** setting delays loading; it does not disable Freeform's CAPTCHA JavaScript. There is currently no dedicated option to manage the CAPTCHA frontend independently while retaining Freeform's token verification. Disabling the CAPTCHA integration for a form also disables its server-side verification.

If you're not already familiar, here's an overview of how each Captcha works:

### Challenge - Checkbox (v2)
All users submitting your form must check off the reCAPTCHA checkbox, and in some cases, users will be presented the puzzle to solve to submit the form successfully. This is available in the _Lite_ and _Pro_ editions of Freeform.

### Challenge - Invisible (v2) (Lite/Pro only)
Most users will not even know it's automatically validating them, but like the _Challenge Checkbox (v2)_ described above, some users will be presented a modal on the page with the puzzle to solve when they click the submit button.

### Score Based (v3) (Lite/Pro only)
Users are never presented any puzzle to solve, etc. Instead, users are automatically validated by Google based on a score assigned to them. You have control over that score threshold inside Freeform settings. We suggest starting with something like `0.5` and see how that goes (where a `0.0` score means that it's almost certain a bot and a `1.0` score means it's a user). If the user does not pass this threshold, the submission will follow the behavior you set out for it in the settings (send to spam folder / reject it entirely / show an error to the user, etc). The user has no ability to validate themselves like in the **Challenge (v2)** reCAPTCHAs.

## Setup Instructions

### 1. Create or select a reCAPTCHA key

- Create or select a web key in the [Google Cloud console](https://console.cloud.google.com/security/recaptcha), following Google's [key setup guide](https://docs.cloud.google.com/recaptcha/docs/create-key-website).
- Use a key type matching the **Captcha Type** you will select in Freeform: checkbox for **Challenge - Checkbox (v2)**, or score-based for **Score Based (v3)**. Existing **Challenge - Invisible (v2)** keys must use that matching Freeform option.
- Configure the domains where the form will appear, e.g. `mysite.net`.
- Copy the **Site Key** (also called the key ID).
- Open the key's details and its **Integration** tab. Choose **Use legacy key** or **Integrate with a third-party service or plugin**, then copy the **legacy secret key**. Enter this in Freeform's **Secret Key** field. See Google's [legacy-secret instructions](https://docs.cloud.google.com/recaptcha/docs/create-key-website#find-key).
- Keep the legacy secret key on the server. An API key or service-account JSON file cannot be used in its place in this integration.

### 2. Set up Integration on your site

- Switch back to this integration tab.
- Choose a reCAPTCHA version and type from the **Captcha Type** select dropdown.
- In the **Site Key** and **Secret Key** settings, paste in your **Site Key** and its **legacy secret key**.

### 3. Additional Configuration

- Complete the rest of the following optional fields (these will only be the default value when configuring the integration in the form builder later):
    - **Only load Captcha scripts once the user interacts with the form?**
    - **Failure Behavior** - set to `Display Error Message` or `Send to Spam Folder`.
        - **Error Message** - set a custom error message if using `Display Error Message` failure behavior.
    - If using **Score Based (v3)**, set the defaults for the following:
        - **Score Threshold** - the minimum score (between `0.0` and `1.0`) required for the Captcha to pass validation.
        - **Action** - the action to use when validating the Captcha, e.g. `submit`.
    - If using **Challenge - Checkbox (v2)**, set the defaults for the following:
        - **Theme** - set to `Light` or `Dark`.
        - **Size** - set to `Normal` or `Compact`.
- Click the **Save** button.

### 4. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **reCAPTCHA** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Adjust any of the settings as needed.

<span class="note warning"><b>Important:</b> <i>Challenge - Invisible (v2)</i> and <i>Score Based (v3)</i> will automatically load a <i>reCAPTCHA</i> icon in the bottom right corner of your site containing the form. This is required by Google's terms of service. There are CSS workarounds if you wish to locate the icon to the left side of the browser page, etc.</span>

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/custom-development/) to build any feature or change you need.</small>
