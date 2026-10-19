# Setup Guide

This guide assumes you have a basic understanding of [Google Tag Manager](https://tagmanager.google.com/).

## Setup Instructions

### 1. Enable Google Tag Manager inside Freeform

- If you'd like GTM to be enabled for all forms by default, toggle on the **Enabled by default** setting.
- If you wish to have Freeform insert its own scripts, enter your GTM ID (`GTM-XXXXXX`) in the **Container ID** setting and a custom event name (if applicable) in the **Event Name** setting.
- Click the **Save** button.

### 2. Configure the Form
To use this integration on your form(s), you'll need to configure each form individually. If you toggled on the **Enabled by default** setting in the Freeform Settings, it will automatically be ON for all forms. You can disable them for each form as necessary.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Google Tag Manager** in the list of available integrations.
- On the right side of the page:
    - Enable (or disable) the integration.
    - Adjust any of the settings as needed.
- Save the form.

### 3. Map Event Parameters

In the form builder's **Integrations → Google Tag Manager** panel, use **Event Parameters** to map custom parameter names to fields. For example:

| Parameter name | Form field |
| --- | --- |
| `insurance_type` | Insurance Type |
| `office_location` | Office Location |

`form_name` is included automatically using the form's configured name. Mappings are specific to each form and remain connected when a field handle changes.

Only explicitly mapped choice, numeric, and hidden fields are included. Text, Textarea, Email, Phone, address-like free-text fields, and uploads are not available for mapping. Never map personal data, including personal information stored in hidden fields or option values. Multiple selected values are joined with a comma and space; mapped strings are limited to 100 characters. Missing or unsupported mappings are omitted.

Freeform obtains mapped values from the submitted server-side values, including earlier pages of a multi-page form. It does not read the reset form controls after success. Previously mapped parameters that are absent from the next tracked submission are cleared with `null`, so GTM does not reuse an earlier submission's selections.

### 4. Configure Google Tag Manager

Freeform pushes an event to `window.dataLayer`; this does not, by itself, send a GA4 event.

- If GTM is already installed on your website, leave **Container ID** blank. Freeform will use the existing data layer. If you supply an ID, Freeform avoids loading that same container again when its loader or registered container is already present.
- In GTM, create a **Custom Event** trigger matching the Freeform **Event Name**, such as `generate_lead`.
- Configure a **GA4 Event** tag using your existing Google tag and that trigger. Map `form_name` and each custom parameter using data-layer variables with those names.
- Enable this integration only on the forms you intend to track, or use form-specific trigger conditions.
- Test your GTM workspace before publishing its changes.

This integration uses GTM. A site using only a direct `gtag.js` installation needs its own event listener or an existing GTM setup; Freeform does not install a second Google tag automatically.

### 5. Submission Timing and Testing

Events are emitted only after a completed, successful AJAX submission. Intermediate pages, validation errors, failed requests, pending actions, duplicate submissions, and submissions identified as spam do not produce the completion event. Repeated notifications for the same submission are deduplicated within the page, including when both legacy and current Freeform tracking handlers are present.

The data layer contains the configured event name, `form_name`, mapped parameters, form metadata, and the submission ID when available. **Submission tokens are no longer included.** No complete set of submission answers is copied into the data layer.

Use GTM **Preview / Tag Assistant** and GA4 **DebugView**, or inspect the outgoing GA4 collection requests in the browser's Network panel. Test one accepted submission and confirm one GA4 event, then test validation failure and confirm none. Also check multi-page forms and any existing custom tracking scripts for additional event sources.

### Advanced Customization

The existing `freeform-gtm-data-layer-push` hook remains available for developers. It runs once for an eligible submission, before the data-layer push:

```js
document.addEventListener('freeform-gtm-data-layer-push', function (event) {
    event.payload.campaign = 'summer';
});
```

Only add non-personal values. Do not read selections from the reset form here; use the native mappings. Calling `event.preventDefault()` suppresses Freeform's push for that submission.

### 6. Troubleshooting
Google offers a [Tag Assistant](https://tagassistant.google.com/) tool along with a [Tag Assistant Companion](https://chrome.google.com/webstore/detail/tag-assistant-companion/jmekfmbnaedfebfnmakmokmlfpblbfdm) Chrome extension. These help troubleshoot installation of `gtag.js` and **Google Tag Manager**. When the Chrome extension is present, it enables additional features for Tag Assistant including debugging iframes and debugging multiple windows from the same debug session.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/custom-development/) to build any feature or change you need.</small>
