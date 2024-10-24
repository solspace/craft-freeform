# Setup Guide

This guide assumes you have a [Cloudflare](https://www.cloudflare.com/) account and a basic understanding of Cloudflare [Turnstile](https://www.cloudflare.com/products/turnstile/).

## Overview
The Cloudflare **Turnstile** widget will be automatically loaded and handled by Freeform (when enabled for the form). The banner or checkbox field will be automatically inserted above the Submit button(s).

### Managed
Cloudflare will use information from the visitor to decide if an interactive challenge should be used. If we do show an interaction, the user will be prompted to check a box (no images or text to decipher).

### Non-interactive
A purely non-interactive challenge. Users will see a widget with a loading bar while the browser challenge is run.

### Invisible
Invisible challenge that does not require interaction.

## Setup Instructions

### 1. Set up Widget on Cloudflare site

- Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) site and log into your account.
- Click on **Turnstile** in the navigation menu.
- If you don't already have a Turnstile widget created, click on the **Add Widget** button.
    - Enter a name for it in the **Widget name** setting.
    - In the **Domains** section, enter in any domain(s) you plan on using the captcha for, e.g. `mysite.net`.
    - Choose a type in the **Widget Mode** setting.
    - Click the **Create** button.
    - On the next page, you'll be presented a **Site Key** and **Secret Key**. Copy both of these.
- Leave this page open and open a new tab...

### 2. Set up Integration on your site

- Switch back to your Freeform/Craft tab.
- Select *Turnstile* from the **Service Provider** select dropdown.
- Enter a name and handle for the integration. e.g. `My Turnstile Integration`.
- In the **Site Key** and **Secret Key** settings, paste in the **Site Key** and **Secret Key** values from the Cloudflare site.

### 3. Additional Configuration

- Complete the rest of the following optional fields (these will only be the default value when configuring the integration in the form builder later):
    - **Only load Captcha scripts once the user interacts with the form?**
    - **Failure Behavior** - set to `Display Error Message` or `Send to Spam Folder`.
        - **Error Message** - set a custom error message if using `Display Error Message` failure behavior.
    - **Theme** - set to `Auto`, `Light` or `Dark`.
    - **Size** - set to `Normal (300x65px)`, `Flexible (100%x65px)` or `Compact (150x140px)`.
    - **Action** - the action to use when validating the Captcha, e.g. `submit`.
    - **Locale** - the locale to use for the Captcha as the language ID, e.g. `en`, `de`, etc. If left blank, the locale will be auto-detected.
- Click the **Save** button.

### 4. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Turnstile** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Adjust any of the settings as needed.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>