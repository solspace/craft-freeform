# Embed a form in a standalone HTML page

Freeform 5.17 lets you add a form to an HTML page that is not rendered by Craft. An administrator enables the form, then copies a single script tag from the form builder into the HTML page. The form itself is served by Craft and reflects changes after you save them in Freeform.

The HTML page and the selected Craft site must have the **same origin**: the same protocol (`https`), hostname, and port. A different subdomain or domain is not supported by this embed option.

For example, a static page at `https://example.com/landing.html` can embed a form served by `https://example.com`. A page at `https://www.example.com/landing.html` cannot embed that form, because `www.example.com` is a different hostname.

## Add the form

1. Open the form in the Freeform control panel and select **Settings → Embed Form**. Save a new form first.
2. A Craft administrator turns on **Allow HTML Embeds** and saves the form. This setting is off by default. If you cannot see the switch, ask a Craft administrator to enable it.
3. Select the Craft site for the form and click **Copy code** under **HTML page on this site**.
4. Paste the copied script tag into the HTML page where the form should appear. Publish or upload that page on the **same origin** as the selected Craft site.
5. Open the HTML page in a browser and submit a test entry.

The copied code looks like this (your site URL and form handle will differ):

```html
<script src="https://example.com/freeform/embed.js" data-freeform-url="https://example.com/freeform/embed/contact" data-freeform-title="Contact" defer></script>
```

Copy the complete tag from Freeform so it contains the correct site URL and form handle. You do not need to enable Freeform's headless API for this method.

## Appearance and behavior

The embed displays the form in an iframe and adjusts its height as the form changes. Craft renders the form using its selected **Formatting Template**. The bundled Bootstrap, Foundation, and Tailwind templates load their corresponding framework assets in the embedded page. Custom formatting templates do not receive framework assets automatically, regardless of their filename. Register the styles and scripts a custom template needs, and test it in the embed.

Submissions are handled by the Craft site inside the iframe. A **success message** is usually the best completion behavior: a redirect opens *inside* the embedded form rather than navigating the whole HTML page. See [Success Behavior](https://docs.solspace.com/craft/freeform/v5/guides/guide/success-return-on-forms/) for your form's options.

## Public access and other domains

Enabling **Allow HTML Embeds** creates a public form URL. Only enable forms intended for public visitors. Avoid secrets in the form's HTML blocks, default values, and other publicly rendered content. Save the form after turning the switch off to disable its embed URL. Archived forms are unavailable at that URL.

This script cannot embed a form on another domain or subdomain. Changing CORS settings alone will not make it work. For a separate domain, see [Freeform Headless](https://docs.solspace.com/craft/freeform/v5/headless/getting-started/) or serve the HTML page from the Craft site's exact origin.

## Troubleshooting

- **No form appears:** Confirm that the form is saved, HTML embeds are enabled and saved, the form is not archived, and you copied the code for the correct Craft site. Check that the HTML page uses the same protocol, hostname, and port as the Craft site.
- **The browser blocks the script or iframe:** Check any Content Security Policy on the HTML page and Craft site. The HTML page must permit the embed script and iframe; a stricter site-wide framing policy can also block the embed.
- **The form looks different:** Check the selected Formatting Template and any assets required by a custom template. Test payment flows and advanced fields on the actual site before publishing the page.
- **A redirect stays inside the form:** Select a success message for this placement.

For a Craft Twig template, use the separate **Twig code** in the same Embed tab instead.
