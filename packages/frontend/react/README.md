# @solspace/freeform-react

React components and hooks for Solspace Freeform forms over the headless REST API.

**Docs:** [Getting Started](https://docs.solspace.com/craft/freeform/v5/headless/getting-started/) · [React JS](https://docs.solspace.com/craft/freeform/v5/headless/reactjs/) · [Next.js](https://docs.solspace.com/craft/freeform/v5/headless/nextjs/)

## Requirements

- React 18 or 19
- `@solspace/freeform-core` (matching major/minor)
- Freeform headless API enabled in your Craft project (`config/freeform.php`)

## Install

```bash
npm install @solspace/freeform-react @solspace/freeform-core
```

## Quick start

```tsx
import { Freeform } from "@solspace/freeform-react";

export function ContactForm() {
  return (
    <Freeform
      handle="contact"
      baseUrl="https://cms.example.com"
      onSuccess={(response) => {
        console.log("Submitted", response.submission);
      }}
    />
  );
}
```

`<Freeform />` loads the form manifest, manages state, renders supported fields, handles CSRF, and submits using the endpoints declared by Freeform.

## Headless usage with `useFreeform()`

Use the hook when you want full control of markup:

```tsx
import { useFreeform } from "@solspace/freeform-react";

export function ContactForm() {
  const form = useFreeform({
    handle: "contact",
    baseUrl: "https://cms.example.com",
  });

  if (form.loading) {
    return <p>Loading…</p>;
  }

  if (form.error) {
    return <p role="alert">{form.error.message}</p>;
  }

  return (
    <form onSubmit={form.handleSubmit}>
      <label>
        Email
        <input {...form.getFieldProps("email")} type="email" />
      </label>
      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
```

## Loading and error states

```tsx
<Freeform
  handle="contact"
  baseUrl="https://cms.example.com"
  loadingMessage="Loading contact form…"
  loadingFallback={<MySpinner />}
  errorFallback={(error) => <p role="alert">{error.message}</p>}
/>
```

You can also use `FormLoader` on its own:

```tsx
import { FormLoader } from "@solspace/freeform-react";

<FormLoader variant="spinner" message="Loading…" />;
```

## Custom field renderers

Override rendering by field handle, `frontend.renderer` key, or field type. Resolution prefers the most specific match first.

```tsx
<Freeform
  handle="donation"
  baseUrl="https://cms.example.com"
  renderers={{
    handles: {
      payment: MyPaymentField,
    },
    frontend: {
      "payment.stripe": MyStripeField,
    },
    types: {
      text: MyTextField,
    },
  }}
/>
```

## Next.js (App Router)

Render Freeform from a Client Component:

```tsx
// app/contact/contact-form.tsx
"use client";

import { Freeform } from "@solspace/freeform-react";

export function ContactForm() {
  return (
    <Freeform
      handle="contact"
      baseUrl={process.env.NEXT_PUBLIC_CRAFT_URL}
    />
  );
}
```

### Same-origin proxy (recommended)

Proxy Freeform endpoints through Next.js so CSRF cookies stay on the same browser origin:

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/freeform/:path*",
        destination: `${process.env.CRAFT_URL}/freeform/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

With that proxy, use `baseUrl=""` (or omit a remote Craft host) so requests go to `/freeform/...` on your Next.js origin.

### Cross-origin setup

If the browser calls Craft directly, add your frontend origin to Freeform's `headless.allowedOrigins` and keep credentials enabled on requests.

## Security integrations

This package automatically includes CSRF, honeypot, and JavaScript-test metadata from the form manifest when submitting.

Captcha widgets are provided by `@solspace/freeform-extensions`:

```tsx
import { Freeform } from "@solspace/freeform-react";
import { captchaExtensions } from "@solspace/freeform-extensions";

<Freeform
  handle="contact"
  baseUrl="https://cms.example.com"
  extensions={captchaExtensions}
/>;
```

Configure captcha integrations in Freeform before going live. The form manifest must include public site keys for widgets to initialize.

## Themes

Pass a theme object to customize class names and default wrappers.

```bash
npm install @solspace/freeform-theme-default
# or, if the app already uses Tailwind:
npm install @solspace/freeform-theme-tailwind
# or Bootstrap 5:
npm install @solspace/freeform-theme-bootstrap bootstrap
```

```tsx
import { Freeform, createTheme } from "@solspace/freeform-react";
import { darkTheme } from "@solspace/freeform-theme-default";
// or: import { tailwindTheme } from "@solspace/freeform-theme-tailwind";

const theme = createTheme({
  classNames: {
    input: "my-input",
    submitButton: "my-submit",
  },
});

<Freeform handle="contact" baseUrl="https://cms.example.com" theme={theme} />;
// theme={darkTheme} or theme={tailwindTheme}
```

See the [React headless docs](https://docs.solspace.com/craft/freeform/v5/headless/reactjs/) for Tailwind `@source` setup and `classNameStrategy: "replace"`.

## API overview

| Export | Purpose |
| --- | --- |
| `Freeform` | Fully rendered form component |
| `useFreeform` | Headless form runtime hook |
| `FormLoader` | Built-in loading UI |
| `createTheme` / `defaultTheme` | Theme helpers |
| `resolveFieldRenderer` | Renderer resolution utility |

## Support

Documentation and support for Freeform are available through [Solspace](https://docs.solspace.com/craft/freeform/).

## Known limitations

- Conditional show/hide is client UX only (not a security boundary)

## International Phone fields

Enable **Use international phone input** on an existing Pro Phone field. It is off by default and replaces its fixed pattern/mask only when enabled. Choose a default country and optionally enter allowed two-letter country codes (for example `US, CA, GB`). An empty allowed list enables all supported countries; an invalid nonempty list permits none.

The country picker sits inside the phone input as a flag button. Its full-width dropdown shows country flags and names with right-aligned dialing codes, searches country names/codes/dialing codes, supports keyboard use, and supplies country-specific example placeholders unless a custom placeholder is configured. Valid numbers are formatted on blur and submitted as a single E.164 string, such as `+442079460018`. Letters and extensions are rejected. Server validation enforces both number validity and the allowed countries, including for headless/API requests. With JavaScript disabled, use a full international number or a national number in the configured default country.

React and Vue include the picker without a separate extension or stylesheet import. The manifest supplies `frontend.config.international`, `defaultCountry`, `allowedCountries`, translated `labels`, and `examples`. Custom renderers can use `mountInternationalPhone` from core; pass value changes to the form runtime and call `update()` for external changes and `destroy()` on unmount. Custom styles can set `--ff-phone-background`, `--ff-phone-color`, `--ff-phone-border`, `--ff-phone-selector-background`, `--ff-phone-highlight`, and `--ff-phone-dial-color`. Flags use the device’s emoji font. Classic forms load the phone script only when an opted-in field is present. No third-party lookup or geolocation service is contacted.

The plugin requires `giggsey/libphonenumber-for-php-lite` (installed by Composer); headless core uses `libphonenumber-js`. Keep their number metadata updated when upgrading dependencies.
