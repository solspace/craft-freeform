# @solspace/freeform-extensions

Official Freeform extensions for captchas, calculation, datetime, and file drag-and-drop used with `@solspace/freeform-core` and `@solspace/freeform-react`.

**Docs:** [Getting Started](https://docs.solspace.com/craft/freeform/v5/headless/getting-started/) · [React JS](https://docs.solspace.com/craft/freeform/v5/headless/reactjs/)

## Install

```bash
npm install @solspace/freeform-extensions @solspace/freeform-core @solspace/freeform-react
```

## Datetime

```tsx
import { Freeform } from "@solspace/freeform-react";
import { datetimeExtension } from "@solspace/freeform-extensions";

<Freeform
  handle="event"
  baseUrl="https://cms.example.com"
  extensions={[datetimeExtension]}
/>;
```

The extension mounts the selected Freeform or Classic picker. Browser mode uses native date inputs.

## Captchas

```tsx
import { Freeform } from "@solspace/freeform-react";
import { captchaExtensions } from "@solspace/freeform-extensions";

export function ContactForm() {
  return (
    <Freeform
      handle="contact"
      baseUrl="https://cms.example.com"
      extensions={captchaExtensions}
    />
  );
}
```

Or register both captchas and datetime together:

```tsx
import { recommendedExtensions } from "@solspace/freeform-extensions";

<Freeform extensions={recommendedExtensions} ... />;
```

Supported captcha providers:

| Provider | Response field |
| --- | --- |
| Cloudflare Turnstile | `cf-turnstile-response` |
| Google reCAPTCHA | `g-recaptcha-response` |
| hCaptcha | `h-captcha-response` |
| Friendly Captcha | `frc-captcha-response` |

Extensions read provider settings from `manifest.security.captchas`, including `siteKey`, theme, size, version, and action. Tokens are submitted through `meta.captchas`.

## Date/time picker modes

Date/time manifests declare `frontend.config.picker`: `freeform`, `flatpickr`,
`browser`, or `none`. The Freeform picker runs without React or a CDN dependency,
with searchable month/year menus, time intervals, keyboard navigation, and
light/dark themes. Classic (`flatpickr`) retains the existing Flatpickr extension;
older manifests without `picker` continue using their original boolean settings.

When using the Freeform picker in a headless application, include its stylesheet:

```ts
import '@solspace/freeform-core/datetime.css';
```

It uses the field's PHP-style `format`, `locale`, `clock24h`, `enableDate`,
`enableTime`, `minuteStep`, `pickerMinDate`, and `pickerMaxDate` configuration.
`today` bounds are evaluated using the server reference clock when the picker opens. Dark sample
forms use `data-freeform-theme="dark"`; custom forms can use that same attribute
(or `data-freeform-theme="light"`) on the form or a containing element.

Front-end pickers use a minimal appearance by default. Freeform's control-panel
date inputs explicitly use the separate `control-panel` appearance, retaining
their original design with the same picker behavior.

Minimum and maximum values without a time (for example, `today`, `3 days ago`,
or `2026-10-26`) include the full day. Values with a time (for example,
`12 hours ago`, `today 7am`, or `2026-10-26 07:00`) enforce that time.
Freeform picker manifests include a server reference clock and relative time
offsets, so relative cutoffs advance while the form is open and use the site's
timezone. Submission validation always re-evaluates the limits on the server.

## Support

Documentation and support for Freeform are available through [Solspace](https://docs.solspace.com/craft/freeform/).
