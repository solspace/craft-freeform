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


## Range Slider

Freeform's **Range Slider** field stores a single numeric value. Configure its minimum (default `0`), maximum (`100`), step (`1`), and optional default value in the builder. Decimal steps and negative bounds are supported. A blank default starts at the minimum; configured defaults are clamped to the bounds and aligned to the nearest step, with ties rounded upward.

The manifest uses the `range` renderer and `frontend.config` containing `min`, `max`, and `step`. Its `defaultValue` contains the normalized starting value. The built-in React and Vue adapters render a native range input with a current-value display and bound labels. Layout is built into the renderers, and appearance comes from the existing Default, Bootstrap, or Tailwind theme assets; no separate range stylesheet is needed. Classic Twig forms use the bundled Freeform script and stylesheet automatically.

A slider always has a value. Required validation rejects a missing submission but does not require visitors to move the thumb. Submitted values are validated on the server for numeric content, bounds, and step alignment without silently clamping them. Zero is a valid value. Invalid configuration falls back to a step of `1`; a maximum below the minimum produces a fixed-value slider at the minimum.

For precise edits, the submission control panel uses a numeric input. Slider values are available to conditional Rules, calculations, integrations, exports, and survey results through the usual field interfaces. In custom scripts, dispatch an `input` or `change` event after assigning the range input's value so its visible output stays synchronized.
