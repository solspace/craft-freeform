# Setup Guide

This guide assumes you have a [Friendly Captcha](https://friendlycaptcha.com/) account and are using **Friendly Captcha v2**.

## Overview

The **Friendly Captcha** widget is loaded and handled automatically by Freeform when the integration is enabled for a form. The widget is inserted above the submit button(s).

### Widget mode (One-click, Zero-click, Smart)

Which interaction users see is configured per **application** in the [Friendly Captcha dashboard](https://app.friendlycaptcha.eu/), not in Freeform. That design prevents visitors from weakening the captcha by changing client-side settings.

### Risk Intelligence

When **Risk Intelligence** is enabled on your Friendly Captcha account, verification responses can include **risk scores**. Freeform stores a short summary (for example `Overall 2/5, Network 1/5, Browser 3/5`) on spam submissions so you can review them in the Control Panel.

## Setup Instructions

### 1. Create a Friendly Captcha application

- Open the [Friendly Captcha dashboard](https://app.friendlycaptcha.eu/) and create or select an application.
- Note your **Site key** (starts with `FC`).
- Under **API keys**, create an **API key** (starts with `A1`). You need this for server-side verification (`X-API-Key`). API keys are shown only once—copy them securely.

### 2. Configure the integration in Craft

- Enter **Site Key** and **API Key** in this integration’s settings.
- Optional:
    - **Start Mode** — when the puzzle starts (`Auto`, `Focus`, `None`).
    - **Theme** — `Auto`, `Light`, or `Dark`.
    - **Language** — leave blank for auto-detection, or set a code such as `en`, `de`, `fr`.
    - **Only load Captcha scripts once the user interacts with the form** — delays loading until the visitor interacts with the form (recommended on pages where few visitors submit).
    - **Failure Behavior** — show an error or send the submission to the spam folder.

### 3. Enable on each form

- Open the form in the form builder → **Integrations** → **Friendly Captcha** → enable and adjust overrides if needed.

## Content Security Policy (CSP)

If your site sends a `Content-Security-Policy` header, allow Friendly Captcha’s iframe origin. See Friendly Captcha’s documentation: [Content Security Policy (CSP)](https://developer.friendlycaptcha.com/docs/v2/guides/csp) (typically `frame-src` for `*.frcapi.com`). Freeform bundles the widget SDK with its scripts so you do not need to allow an extra script CDN for Freeform’s captcha bundle.

## Testing

Use the [Friendly Captcha Playground](https://developer.friendlycaptcha.com/playground) to preview widget behavior. Production widget mode and some options are controlled in the Friendly Captcha dashboard, not in the playground’s UI on your site.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>
