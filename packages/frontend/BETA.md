# Freeform Headless — npm Public Beta (`0.1.0-beta.1`)

Official Freeform frontend packages for **React / Next.js**. These npm packages are on a **separate beta version line** from the Freeform Craft plugin.

| Layer | Versioning |
| --- | --- |
| Freeform Craft plugin | Normal releases on main (e.g. `5.15.x` / `5.16.x`) — includes the headless REST API |
| `@solspace/freeform-*` npm packages | **`0.1.0-beta.x`** on the npm `beta` tag while we gather feedback |

## What’s included

| Package | Role |
| --- | --- |
| `@solspace/freeform-core` | Manifest client, state, conditionals, submit |
| `@solspace/freeform-react` | `<Freeform />` + `useFreeform()` |
| `@solspace/freeform-extensions` | Captchas, datetime, file DnD |
| `@solspace/freeform-react-theme-default` | Default light/dark theme CSS |

Requires a Freeform plugin build that includes the headless REST API (merged to main), with headless enabled in config.

## Install

```bash
npm install @solspace/freeform-core@beta \
  @solspace/freeform-react@beta \
  @solspace/freeform-extensions@beta \
  @solspace/freeform-react-theme-default@beta
```

```tsx
import { Freeform } from "@solspace/freeform-react";
import { recommendedExtensions } from "@solspace/freeform-extensions";
import "@solspace/freeform-react-theme-default/styles.css";

export function ContactForm() {
  return (
    <Freeform
      handle="contact"
      baseUrl={process.env.NEXT_PUBLIC_CRAFT_URL}
      extensions={recommendedExtensions}
    />
  );
}
```

Prefer a **same-origin proxy** for `/freeform/*` so CSRF cookies work without cross-origin friction.

## Deferred (post-beta)

- Drafts / save & continue
- Payments (Stripe, etc.)
- Calculation fields
- Vue adapter
- Bootstrap & Tailwind theme packages
- Full GraphQL parity with the REST contract

## Beta security checklist

1. Keep headless **off** until intentionally enabled per form.
2. Set explicit `headless.allowedOrigins` for cross-origin apps.
3. Require **captcha** on public forms.
4. Leave **`allowRawHtml` false** unless HTML fields are trusted CMS content.
5. Do not treat client-side conditional hiding as access control.

## Feedback

Report issues with your **Freeform plugin version** and the npm package versions (`0.1.0-beta.x`) you installed.
