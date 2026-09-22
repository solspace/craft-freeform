# @solspace/freeform-core

Framework-neutral runtime for Solspace Freeform headless forms.

React adapters build on this package. Use it directly when you need form loading, state, conditionals, and submission without a UI framework adapter.

**Docs:** [Headless Getting Started](https://docs.solspace.com/craft/freeform/v5/headless/getting-started/) · [REST API](https://docs.solspace.com/craft/freeform/v5/headless/rest-api/)

## Requirements

- A modern browser or Node.js runtime with `fetch`
- Freeform headless API enabled in your Craft project

## Install

```bash
npm install @solspace/freeform-core
```

## Quick start

```ts
import { createFreeformClient } from "@solspace/freeform-core";

const client = createFreeformClient({
  baseUrl: "https://cms.example.com",
});

const manifest = await client.loadManifest({ handle: "contact" });
const state = client.createState(manifest);

state.setValue("email", "jane@example.com");

const result = await client.submit({
  manifest,
  request: {
    values: state.getValuesForSubmit(),
    intent: "submit",
  },
});
```

In Node.js or other environments without automatic cookie handling, pass a cookie-aware `fetch` implementation such as `createCookieFetch()` so CSRF token requests and form submits share the same session.

## What it provides

| Area | Responsibility |
| --- | --- |
| Manifest client | Fetch and validate Freeform manifests |
| Form state | Values, touched/dirty flags, errors, page index |
| Conditionals | Evaluate show/hide and enable/disable rules |
| Submit client | JSON and multipart submit, CSRF attachment |
| Extensions registry | Register required field/behavior extensions |

## Related packages

- `@solspace/freeform-react` — React components and hooks
- Official extension and theme packages for captcha, payments, and styling

## Support

Documentation and support for Freeform are available through [Solspace](https://docs.solspace.com/craft/freeform/).

## Known limitations

- Conditional show/hide is client UX only (not a security boundary)

## Character counts

Enable **Show Character Count** on a Text or Textarea field to show its current length. When a maximum length is configured, the counter also displays the limit (for example, `120 / 500 characters`). Without a maximum, it shows the count alone. The option is off by default.

The manifest exposes `frontend.config.showCharacterCount` and translated `characterCountMessages`; the maximum comes from `validation.maxLength`. React and Vue include the layout and use existing theme assets, with `characterCount` and `characterCountError` class-name overrides. No additional stylesheet import is needed. Counters update with controlled values, including the form API's `reset()` method. They are associated with the input using `aria-describedby` and do not announce every keystroke.

Counts follow native HTML `maxlength` semantics (UTF-16 units, with normalized line endings), so some emoji count as more than one unit. Server-side maximum-length validation uses the same convention. Classic Twig counters initialize with Freeform's JavaScript and update on input, change, reset, and AJAX replacement. Dispatch an `input` or `change` event after setting a value in custom scripts.

## Email typo suggestions

Enable **Suggest email corrections** on an Email field to offer corrections for common domain typos after the visitor leaves the field. It is off by default. For example, `Jane+sales@gmial.com` prompts “Did you mean Jane+sales@gmail.com?” with a **Use suggestion** button. The address changes only when that button is activated. Suggestions never block submission or replace server-side validation.

Suggestions use a small, explicit list of common provider-domain typos; arbitrary company domains, regional domains, multiple addresses, quoted addresses, and internationalized local parts are not guessed. The local part, including capitalization and plus-addressing, is preserved. No network requests or new runtime dependencies are required. Suggestions clear on edits, external value changes, and form reset. Read-only/disabled fields are not changed.

The manifest exposes `frontend.config.suggestEmailCorrections` and translated `emailSuggestionLabels`. React and Vue include the behavior automatically. Classic forms bundle it with Freeform core JavaScript. No additional stylesheet import is needed; customize `--ff-email-suggestion-color` and `--ff-email-suggestion-action`. Custom renderers can use `getEmailSuggestion()` or `mountEmailSuggestions()` from core; pass accepted values to the form runtime, call `clear()` after external value updates, and call `destroy()` on unmount.
