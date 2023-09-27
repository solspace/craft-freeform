# Setup Guide

This guide assumes you have a basic understanding of [hCaptcha](https://www.hcaptcha.com/).

<span class="note warning"><b>Important:</b> In order for this to work, the site you are connecting the integration to will need to be publicly accessible.</span>

## Overview
All **hCaptcha** offerings will be automatically loaded and handled by Freeform (when enabled for the form). The **hCaptcha Checkbox** field will be automatically inserted above the Submit button(s).

If you're not already familiar, here's an overview of how each Captcha works:

### hCaptcha Checkbox
This is based off of _reCAPTCHA_ and works very similarly. All users submitting your form must check off the hCaptcha checkbox, and in some cases, users will be presented the puzzle to solve to submit the form successfully.

### hCaptcha Invisible
Most users will not even know it's automatically validating them, but like the hCaptcha Checkbox described above, some users will be presented a modal on the page with the puzzle to solve when they click the submit button.

## Setup Instructions

### 1. Get the Secret Key on hCaptcha site

- Go to the [hCaptcha admin site](https://dashboard.hcaptcha.com/) and log into your account.
- At the top left of the page, click on your profile icon and select **Settings**.
- On the next page, copy the value in the **Secret Key** field.

### 2. Set up App on hCaptcha site

- If you don't already have an app created, click on the **New Site** icon button at the top right.
    - Enter a name for it in the **Add New Sitekey** setting (optional).
    - In the **Domains** section, enter in any domain(s) you plan on using the captcha for, e.g. `mysite.net`.
    - Choose an option in the **hCaptcha Behavior** setting.
    - Choose an option in the **Passing Threshold** setting.
    - Scroll back to the top and click the **Save** button.
    - On the next page, you'll be presented a **Site Key** for each app. Copy this key.
- If you have already created an app, the app name and **Site Key** will appear in the list of _Sites_.
    - Copy the **Site Key** value.
- Leave this page open and open a new tab...

### 3. Set up Integration on your site

- Switch back to your Freeform/Craft tab.
- Select *hCaptcha* from the **Service Provider** select dropdown.
- Enter a name and handle for the integration. e.g. `My hCaptcha Integration`.
- Choose an hCaptcha version and type from the **Captcha Type** select dropdown.
- In the **Site Key** and **Secret Key** settings, paste in the **Site Key** and **Secret Key** values from the hCaptcha site.

### 4. Additional Configuration

- Complete the rest of the following optional fields (these will only be the default value when configuring the integration in the form builder later):
    - **Only load Captcha scripts once the user interacts with the form?**
    - **Failure Behavior** - set to `Display Error Message` or `Send to Spam Folder`.
        - **Error Message** - set a custom error message if using `Display Error Message` failure behavior.
    - If using **hCaptcha Checkbox**, set the defaults for the following:
        - **Theme** - set to `Light` or `Dark`.
        - **Size** - set to `Normal` or `Compact`.
- Click the **Save** button.

### 5. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **hCaptcha** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Adjust any of the settings as needed.

<style type="text/css">.warning {display:block;padding:10px 15px;border:1px solid var(--warning-color);border-radius:5px;}</style>