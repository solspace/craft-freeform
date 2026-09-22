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

## Character counts

Enable **Show character count** on a Text or Textarea field to show its current length. When a maximum length is configured, the counter also displays the limit (for example, `120 / 500 characters`). Without a maximum, it shows the count alone. The option is off by default.

The manifest exposes `frontend.config.showCharacterCount` and translated `characterCountMessages`; the maximum comes from `validation.maxLength`. React and Vue include the layout and use existing theme assets, with `characterCount` and `characterCountError` class-name overrides. No additional stylesheet import is needed. Counters update with controlled values, including the form API's `reset()` method. They are associated with the input using `aria-describedby` and do not announce every keystroke.

Counts follow native HTML `maxlength` semantics (UTF-16 units, with normalized line endings), so some emoji count as more than one unit. Server-side maximum-length validation uses the same convention. Classic Twig counters initialize with Freeform's JavaScript and update on input, change, reset, and AJAX replacement. Dispatch an `input` or `change` event after setting a value in custom scripts.

## Password visibility

Enable **Show Password Toggle** on the Pro Password field to add a Show/Hide button. It is off by default. The input remains masked initially and is masked again on native form reset or when its controlled value is cleared. The manifest supplies `frontend.config.showPasswordToggle` and translated `passwordToggleLabels`. Use the `passwordToggle` theme class override to customize the button. No extra stylesheet is required; password storage and submission behavior are unchanged.

## Email typo suggestions

Enable **Suggest email corrections** on an Email field to offer corrections for common domain typos after the visitor leaves the field. It is off by default. For example, `Jane+sales@gmial.com` prompts “Did you mean Jane+sales@gmail.com?” with a **Use suggestion** button. The address changes only when that button is activated. Suggestions never block submission or replace server-side validation.

Suggestions use a small, explicit list of common provider-domain typos; arbitrary company domains, regional domains, multiple addresses, quoted addresses, and internationalized local parts are not guessed. The local part, including capitalization and plus-addressing, is preserved. No network requests or new runtime dependencies are required. Suggestions clear on edits, external value changes, and form reset. Read-only/disabled fields are not changed.

The manifest exposes `frontend.config.suggestEmailCorrections` and translated `emailSuggestionLabels`. React and Vue include the behavior automatically. Classic forms bundle it with Freeform core JavaScript. No additional stylesheet import is needed; customize `--ff-email-suggestion-color` and `--ff-email-suggestion-action`. Custom renderers can use `getEmailSuggestion()` or `mountEmailSuggestions()` from core; pass accepted values to the form runtime, call `clear()` after external value updates, and call `destroy()` on unmount.
