# Setup Guide

This guide assumes you have a basic understanding of [reCAPTCHA](https://www.google.com/recaptcha/). This integration is compatible with the Enterprise API and the Classic legacy keys.

## Overview
All **reCAPTCHA** offerings will be automatically loaded and handled by Freeform (when enabled for the form). The **Challenge - Checkbox (v2)** field will be automatically inserted above the Submit button(s).

If you're not already familiar, here's an overview of how each Captcha works:

### Challenge - Checkbox (v2)
All users submitting your form must check off the reCAPTCHA checkbox, and in some cases, users will be presented the puzzle to solve to submit the form successfully. This is available in the _Lite_ and _Pro_ editions of Freeform.

### Challenge - Invisible (v2) (Lite/Pro only)
Most users will not even know it's automatically validating them, but like the _Challenge Checkbox (v2)_ described above, some users will be presented a modal on the page with the puzzle to solve when they click the submit button.

### Score Based (v3) (Lite/Pro only)
Users are never presented any puzzle to solve, etc. Instead, users are automatically validated by Google based on a score assigned to them. You have control over that score threshold inside Freeform settings. We suggest starting with something like `0.5` and see how that goes (where a `0.0` score means that it's almost certain a bot and a `1.0` score means it's a user). If the user does not pass this threshold, the submission will follow the behavior you set out for it in the settings (send to spam folder / reject it entirely / show an error to the user, etc). The user has no ability to validate themselves like in the **Challenge (v2)** reCAPTCHAs.

## Setup Instructions

### 1. Set up App on Captcha site

- Go to the [reCAPTCHA admin site](https://www.google.com/recaptcha/admin) and log into your account.
- If you don't already have an app created, click on the **+** icon button at the top right.
    - Enter a name for it in the **Label** setting.
    - Choose a type in the **reCAPTCHA Type** setting.
    - In the **Domains** section, enter in any domain(s) you plan on using the captcha for, e.g. `mysite.net`.
    - Click the **Submit** button.
    - On the next page, you'll be presented a **Site Key** and **Secret Key**. Copy both of these.
- If you have already created an app, select it from the dropdown at the top left and click on the **cog** settings icon at the top right.
    - In the **Domains** section, enter in any domain(s) you plan on using the captcha for, e.g. `mysite.net`.
    - Click on the **reCAPTCHA Keys** area above and copy the **Site Key** and **Secret Key** values.
    - If you have made any changes to this app, scroll to the bottom and click **Save** button.
- Leave this page open and open a new tab...

### 2. Set up Integration on your site

- Switch back to your Freeform/Craft tab.
- Select *reCAPTCHA* from the **Service Provider** select dropdown.
- Enter a name and handle for the integration. e.g. `My reCAPTCHA Integration`.
- Choose a reCAPTCHA version and type from the **Captcha Type** select dropdown.
- In the **Site Key** and **Secret Key** settings, paste in the **Site Key** and **Secret Key** values from the reCAPTCHA site.

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

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>

<style type="text/css">.warning {display:block;padding:10px 15px;border:1px solid var(--warning-color);border-radius:5px;}</style>