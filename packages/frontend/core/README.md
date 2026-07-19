# @solspace/freeform-core

> **Public beta (`0.1.0-beta.1`)** — APIs may change before stable. See [`../BETA.md`](../BETA.md).

Framework-neutral runtime for Solspace Freeform headless forms.

React adapters build on this package. Use it directly when you need form loading, state, conditionals, and submission without a UI framework adapter.

## Requirements

- A modern browser or Node.js runtime with `fetch`
- Freeform headless API enabled in your Craft project

## Install

```bash
npm install @solspace/freeform-core@beta
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
