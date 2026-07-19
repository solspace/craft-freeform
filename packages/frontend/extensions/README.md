# @solspace/freeform-extensions

> **Public beta (`0.1.0-beta.1`)** — APIs may change before stable. See [`../BETA.md`](../BETA.md).

Official Freeform extensions for captchas and advanced form behavior used with `@solspace/freeform-core` and `@solspace/freeform-react`.

## Install

```bash
npm install @solspace/freeform-extensions@beta @solspace/freeform-core@beta @solspace/freeform-react@beta
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
