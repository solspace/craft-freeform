# Setup Guide

This guide assumes you have an account and basic understanding of [Friendly Captcha](https://friendlycaptcha.com/).

## Overview

This integration uses **Friendly Captcha v2**. The Friendly Captcha widget is loaded and handled automatically by Freeform when the integration is enabled for a form. The widget is inserted above the submit button(s).

### Widget Mode

Which interaction users see (one-click, zero-click, smart) is configured per **application** in the [Friendly Captcha dashboard](https://app.friendlycaptcha.eu/), not in Freeform. That design prevents visitors from weakening the captcha by changing client-side settings.

### Risk Intelligence

When **Risk Intelligence** is enabled on your Friendly Captcha account, verification responses can include **risk scores**. Freeform stores a short summary (for example `Overall 2/5, Network 1/5, Browser 3/5`) on spam submissions so you can review them in the control panel.

## Setup Instructions

### 1. Create a Friendly Captcha application

- Open the [Friendly Captcha dashboard](https://app.friendlycaptcha.eu/).
- Select an existing application or create a new one:
    - Click on **Applications** on the left navigation.
    - Click the **New application** button.
    - Name the application, e.g. `Freeform` and click **Next**.
    - For Use-cases, choose something like `Contact` under `Forms`, then click **Next**.
    - Review the app and click **Create application**.
    - On the next page that loads, copy the **Sitekey**, e.g. `FCXXXXXXXXXXXXXX`.

### 2. Create a Friendly Captcha API Key

- Click on **Keys** on the left navigation.
- Click the **New API Key** button.
- Name the API key, e.g. `Freeform` and click **Generate API key**.
- Copy the **API Key** provides on the next step, e.g. `A1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`.
    - API keys are shown only once. Copy them securely.

### 3. Set up Integration on your site

- Switch back to this integration tab.
- In the **Site Key** and **API Key** settings, paste in the **Sitekey** and **API Key** values from the Friendly Captcha site.

### 4. Additional Configuration

- Complete the rest of the following optional fields (these will only be the default value when configuring the integration in the form builder later):
    - **Only load Captcha scripts once the user interacts with the form?**
    - **Failure Behavior** - set to `Display Error Message` or `Send to Spam Folder`.
        - **Error Message** - set a custom error message if using `Display Error Message` failure behavior.
    - **Start Mode** - when the puzzle starts (`Auto`, `Focus`, `None`).
    - **Theme** - set to `Auto`, `Light` or `Dark`.
    - **Language** - leave blank for auto-detection, or set a 2-letter code such as `en`, `de`, `fr`.
- Click the **Save** button.

### 5. Enable on each form

- Open the form in the form builder → **Integrations** → **Friendly Captcha** → enable and adjust overrides if needed.

## Content Security Policy (CSP)

If your site sends a `Content-Security-Policy` header, allow Friendly Captcha's iframe origin. See Friendly Captcha's documentation: [Content Security Policy (CSP)](https://developer.friendlycaptcha.com/docs/v2/guides/csp) (typically `frame-src` for `*.frcapi.com`). Freeform bundles the widget SDK with its scripts so you do not need to allow an extra script CDN for Freeform's captcha bundle.

## Testing

Use the [Friendly Captcha Playground](https://developer.friendlycaptcha.com/playground) to preview widget behavior. Production widget mode and some options are controlled in the Friendly Captcha dashboard, not in the playground's UI on your site.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/custom-development/) to build any feature or change you need.</small>
