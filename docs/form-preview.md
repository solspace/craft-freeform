# Builder Preview

The **Preview** tab renders the saved form with its selected formatting template
inside an isolated frame. Save changes, then click **Refresh Preview**. Select
Desktop, Tablet, or Mobile to change the frame width. For multi-page forms, use
the page selector to inspect each page without submitting the form.

Preview ignores schedules and submission limits and displays a notice when a
form is currently unavailable. It does not require public HTML embeds to be enabled.

## Preview assets

Known bundled Bootstrap, Foundation, Tailwind, and daisyUI templates receive the
same framework assets as Freeform's standalone embed page. Custom templates,
including templates that share a sample template's filename, provide their own
assets.

A Craft administrator can expand **Additional Preview Assets** to enter **Stylesheet URLs (CSS)**
and **Script URLs (JavaScript)**. Enter direct absolute HTTPS asset URLs, one per
line; JavaScript URLs load in the listed order. Save the form to retain these
settings. They are stored per form and do not change its frontend rendering.
URLs cannot contain credentials or fragments. Each field supports up to 20 URLs.

For example:

```text
https://example.com/assets/site.css
```

```text
https://example.com/assets/site.js
```

Freeform's own bundled scripts and sample styles are inlined into the frame.
Configured external scripts and styles are requested anonymously from an opaque-origin iframe. The
asset server must allow CORS (for example, `Access-Control-Allow-Origin: *` for
public static assets). Authenticated assets and scripts that require cookies,
storage, arbitrary network requests, dynamic script imports, inline event
handlers, or `eval()` will not work in Preview. Some stylesheet imports, remote
images, web fonts, CAPTCHA widgets, and payment widgets may also be blocked.
Inspect the browser console when an asset fails to load.

## Security boundaries

- The preview route requires an authenticated control-panel request, form
  management permission, a POST request, and Craft's normal CSRF validation.
  It renders the stored template; it accepts neither Twig source nor a template
  path from the browser.
- The frame uses `sandbox="allow-scripts"`, without same-origin, forms, popups, or
  top navigation permissions. It cannot access the parent control panel's DOM or
  storage. There is no message bridge or arbitrary server-side URL fetcher.
- A restrictive frame CSP blocks form submissions, fetch/XHR/WebSocket requests,
  child frames, workers, and plugins. Only rendered script/stylesheet URLs and
  hashed inline scripts receive script permissions. Subresources use anonymous
  requests and no referrer.
- Preview forms do not register submission context, emit CSRF credentials or
  encrypted submission payloads, process request data, persist state, or call
  `form.submit()`. CAPTCHA, payment, notification, and integration functionality
  is disabled for the preview instance. The preview route never invokes the
  submission pipeline.

Preview is a presentation check, not a submission test. Use a normal frontend
test form to verify validation, page transitions, uploads, payments, or
integrations.

Only configure trusted assets. Allowed scripts can read values typed into the
preview, and allowed asset requests still reach their hosts. A browser sandbox
does not make malicious third-party JavaScript harmless. Do not enter sensitive
data into a preview.

Custom Twig templates remain trusted server-side application code, just as on
the frontend. The browser sandbox does not restrict Twig's PHP access or prevent
a custom template from querying data or executing server-side code. Template
authors must keep secrets and real submission data out of rendered markup.
