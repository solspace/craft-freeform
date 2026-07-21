# @solspace/freeform-extensions

> See [`PACKAGES.md`](../PACKAGES.md) for install notes and known limitations.

Official Freeform extensions for captchas and advanced form behavior used with `@solspace/freeform-core` and `@solspace/freeform-react`.

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

When a datetime field uses Freeform's built-in datepicker, this extension loads Flatpickr. Native browser date inputs are used when the field is configured for native types.

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

## Support

Documentation and support for Freeform are available through [Solspace](https://docs.solspace.com/craft/freeform/).
