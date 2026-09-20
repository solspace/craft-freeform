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

## International Phone fields

Enable **Use international phone input** on an existing Pro Phone field. It is off by default and replaces its fixed pattern/mask only when enabled. Choose a default country and optionally enter allowed two-letter country codes (for example `US, CA, GB`). An empty allowed list enables all supported countries; an invalid nonempty list permits none.

The country picker sits inside the phone input as a flag button. Its full-width dropdown shows country flags and names with right-aligned dialing codes, searches country names/codes/dialing codes, supports keyboard use, and supplies country-specific example placeholders unless a custom placeholder is configured. Valid numbers are formatted on blur and submitted as a single E.164 string, such as `+442079460018`. Letters and extensions are rejected. Server validation enforces both number validity and the allowed countries, including for headless/API requests. With JavaScript disabled, use a full international number or a national number in the configured default country.

React and Vue include the picker without a separate extension or stylesheet import. The manifest supplies `frontend.config.international`, `defaultCountry`, `allowedCountries`, translated `labels`, and `examples`. Custom renderers can use `mountInternationalPhone` from core; pass value changes to the form runtime and call `update()` for external changes and `destroy()` on unmount. Custom styles can set `--ff-phone-background`, `--ff-phone-color`, `--ff-phone-border`, `--ff-phone-selector-background`, `--ff-phone-highlight`, and `--ff-phone-dial-color`. Flags use the device’s emoji font. Classic forms load the phone script only when an opted-in field is present. No third-party lookup or geolocation service is contacted.

The plugin requires `giggsey/libphonenumber-for-php-lite` (installed by Composer); headless core uses `libphonenumber-js`. Keep their number metadata updated when upgrading dependencies.
