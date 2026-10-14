# Builder Preview

The **Preview** tab renders the saved form with its selected formatting template
inside an isolated frame. Save changes, then click **Refresh Preview**. The
Viewport selector offers Desktop (available width), Wide Desktop (1440px),
Laptop (1280px), Tablet Landscape (1024px), Tablet (768px), Large Mobile (430px),
Mobile (375px), and Small Mobile (320px). Fixed widths render at the selected
viewport size and scale down to fit the workspace when necessary. Dark sample templates use
a very dark gray (`#181a1b`) preview background.

The **Formatting Template** selector defaults to **Use Saved Template**. Choose
any bundled sample to try a different style in Preview, including its framework
assets and dark background where applicable. This selection never changes the
form's saved formatting template and resets when you leave Preview. Switching
templates returns to the first page and retains your temporary answers. Custom
templates with the same filename do not override the selected bundled sample.

Field and button visibility rules work in the preview. For multi-page forms,
use Next and Back to try saved page-jump rules and conditional early completion,
or use the page selector to inspect a specific page. Answers are retained across
page changes and refreshes while this Preview tab is open, allowing rules on
later pages to use earlier answers. Back returns to the previously visited page
after a conditional jump. Completing the preview displays a confirmation; it
never submits the form.

Answers are temporary. Switching forms/sites, leaving Preview, or reloading the
browser clears them. File uploads, nested table answers, and oversized values
are not carried between pages. Navigation evaluates rules without executing the
submission-validation pipeline. Custom formatting templates must retain
Freeform's form, field-container, and button attributes for interactive rules.

Preview ignores schedules and submission limits and displays a notice when a
form is currently unavailable. It does not require public HTML embeds to be enabled.

## Preview assets

Known bundled Bootstrap, Foundation, Tailwind, and daisyUI templates receive the
same framework assets as Freeform's standalone embed page. Custom templates,
including templates that share a sample template's filename, provide their own
assets.

Tailwind 3 samples include locally compiled Tailwind 3.4.19 utilities and do not
require the browser CDN. Developers can regenerate both sample stylesheets with
`pnpm build:tailwind3`. Tailwind 4 previews clip horizontal page overflow while
retaining vertical scrolling. Bootstrap 5 Dark previews set Bootstrap's dark
theme attribute, and daisyUI Dark progress connectors use a contrasting gray.

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
  path from the browser. Preview template overrides accept only exact bundled
  sample identifiers, which the server resolves to its own trusted template paths.
- The frame uses `sandbox="allow-scripts"`, without same-origin, forms, popups, or
  top navigation permissions. It cannot access the parent control panel's DOM or
  storage. There is no arbitrary server-side URL fetcher.
- A narrowly scoped message bridge accepts only bounded text/multiple-choice
  answers and Next/Back requests from the current iframe. It checks the exact
  source window, opaque origin, and a fresh per-render channel token. The parent
  calls only the authenticated preview endpoint; it never forwards credentials,
  arbitrary URLs, or submission commands to the frame.
- A restrictive frame CSP blocks form submissions, fetch/XHR/WebSocket requests,
  child frames, workers, and plugins. Only rendered script/stylesheet URLs and
  hashed inline scripts receive script permissions. Subresources use anonymous
  requests and no referrer.
- Preview forms do not register submission context, emit CSRF credentials or
  encrypted submission payloads, process request data, persist state, or call
  `form.submit()`. CAPTCHA, payment, notification, and integration functionality
  is disabled for the preview instance. The preview route never invokes the
  submission pipeline.

Preview is a presentation and conditional-flow check, not a submission test. Use
a normal frontend test form to verify full validation, real submission state,
uploads, payments, or integrations. Notification and integration rules are not
executed in Preview.

Only configure trusted assets. Allowed scripts can read values typed into the
preview, and allowed asset requests still reach their hosts. A browser sandbox
does not make malicious third-party JavaScript harmless. Do not enter sensitive
data into a preview.

Custom Twig templates remain trusted server-side application code, just as on
the frontend. The browser sandbox does not restrict Twig's PHP access or prevent
a custom template from querying data or executing server-side code. Template
authors must keep secrets and real submission data out of rendered markup.
